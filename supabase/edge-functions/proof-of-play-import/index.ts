// deno-lint-ignore-file no-explicit-any
// @ts-nocheck
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.6'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

function parseCSV(text: string) {
  const lines = text.trim().split(/\r?\n/)
  const headers = lines.shift()?.split(',').map(h => h.trim().replace(/^"|"$/g, '')) ?? []
  return lines.map(line => {
    // naive CSV parse (supports quoted commas minimally)
    const cells: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') {
        inQuotes = !inQuotes
      } else if (c === ',' && !inQuotes) {
        cells.push(current)
        current = ''
      } else {
        current += c
      }
    }
    cells.push(current)
    const row: any = {}
    headers.forEach((h, idx) => {
      row[h] = (cells[idx] ?? '').trim().replace(/^"|"$/g, '')
    })
    return row
  })
}

function parseHTMLTable(html: string) {
  // minimal parse: extract rows between <tr> and map <td> text
  const rows = [...html.matchAll(/<tr[\s\S]*?>[\s\S]*?<\/tr>/gi)].map(m => m[0])
  const cellText = (s: string) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  const table = rows.map(r => [...r.matchAll(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi)].map(m => cellText(m[0])))
  if (table.length === 0) return []
  const headers = table[0]
  return table.slice(1).map(cells => {
    const row: any = {}
    headers.forEach((h, i) => { row[h] = cells[i] ?? '' })
    return row
  })
}

function toUtc(dateStr: string, tz?: string) {
  // If tz is provided, assume input is in tz and convert to UTC using Date fallback
  // For simplicity in Edge, parse as local then toISOString
  const d = new Date(dateStr)
  return d.toISOString()
}

function computeAssetKey(assetName?: string, providerAssetId?: string, durationSec?: number) {
  const normName = (assetName ?? '').replace(/\s+/g, ' ').trim().toLowerCase()
  const part2 = providerAssetId && providerAssetId.length > 0 ? providerAssetId : '-'
  const part3 = (durationSec ?? null) !== null && (durationSec as any) !== undefined ? String(durationSec) : '-'
  return `${normName}|${part2}|${part3}`
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const authHeader = req.headers.get('Authorization')

  const supabase = createClient(supabaseUrl, (supabaseServiceRoleKey ?? supabaseAnonKey), {
    global: { headers: { Authorization: authHeader ?? '' } }
  })

  try {
    const contentType = req.headers.get('content-type') ?? ''
    const bodyText = await req.text()

    let rows: any[] = []
    if (contentType.includes('text/csv') || bodyText.trim().startsWith('Report Date') || bodyText.includes(',Device')) {
      rows = parseCSV(bodyText)
    } else if (contentType.includes('text/html') || bodyText.includes('<table')) {
      rows = parseHTMLTable(bodyText)
    } else {
      // try JSON { records: [] }
      const parsed = JSON.parse(bodyText)
      rows = parsed?.records ?? []
    }

    // Resolve org_id for uploader via users_orgs
    const { data: me, error: meErr } = await supabase.auth.getUser()
    if (meErr || !me?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }
    const userId = me.user.id
    const { data: membership } = await supabase
      .from('users_orgs')
      .select('org_id')
      .limit(1)
      .maybeSingle()
    if (!membership?.org_id) {
      return new Response(JSON.stringify({ error: 'No org membership found' }), { status: 403, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }
    const orgId = membership.org_id

    let inserted = 0
    let dropped = 0
    let lastPlayedAt: string | null = null

    for (const r of rows) {
      try {
        const deviceName = r['Device Name'] || r['Screen Name'] || r['Device'] || r['Device Name/ID'] || r['Device Name / ID'] || r['Device Name/ID'] || r['Device Name /ID']
        const deviceId = r['Device ID'] || r['Device Name/ID'] || r['Device ID/UUID']
        const assetName = r['Asset Name'] || r['Media'] || r['Asset']
        const campaignName = r['Campaign'] || r['Playlist'] || r['Campaign/Playlist']
        const startTime = r['Start Time'] || r['Start Time UTC'] || r['Start']
        const endTime = r['End Time'] || r['End Time UTC'] || null
        const durationSec = r['Duration'] ? parseInt(String(r['Duration']).replace(/[^0-9]/g, '')) : (r['Duration (sec)'] ? parseInt(r['Duration (sec)']) : undefined)
        const eventId = r['Event ID'] || r['Event'] || r['ID']
        const reportTz = r['Report TZ'] || r['Timezone']

        if (!deviceName && !deviceId) { dropped++; continue }
        if (!assetName) { dropped++; continue }
        if (!startTime && !durationSec) { dropped++; continue }

        // Upsert kiosk
        const provider = 'optisigns'
        const externalId = deviceId ?? null
        const kioskName = deviceName ?? (deviceId ?? 'Unknown')

        let { data: kiosk } = await supabase
          .from('kiosks')
          .upsert({ org_id: orgId, provider, external_id: externalId, name: kioskName }, { onConflict: 'org_id,provider,external_id' })
          .select('*')
          .limit(1)
        if (!kiosk || kiosk.length === 0) {
          // fallback on (org_id,name)
          const up2 = await supabase
            .from('kiosks')
            .upsert({ org_id: orgId, provider, name: kioskName }, { onConflict: 'org_id,name' })
            .select('*')
            .limit(1)
          kiosk = up2.data
        }
        const kioskId = kiosk?.[0]?.id
        if (!kioskId) { dropped++; continue }

        // Upsert asset
        const assetKey = computeAssetKey(assetName, r['Provider Asset ID'] ?? null, durationSec)
        const { data: assetRows } = await supabase
          .from('assets')
          .upsert({ org_id: orgId, asset_name: assetName, provider_asset_id: r['Provider Asset ID'] ?? null, duration_sec: durationSec ?? null, asset_key: assetKey }, { onConflict: 'org_id,asset_key' })
          .select('*')
          .limit(1)
        const assetId = assetRows?.[0]?.id
        if (!assetId) { dropped++; continue }

        // Campaign (optional)
        let campaignId: string | null = null
        if (campaignName && String(campaignName).trim().length > 0) {
          const { data: camp } = await supabase
            .from('campaigns')
            .upsert({ org_id: orgId, name: String(campaignName).trim() }, { onConflict: 'org_id,name' })
            .select('*')
            .limit(1)
          campaignId = camp?.[0]?.id ?? null
          if (campaignId) {
            await supabase
              .from('campaigns_assets')
              .upsert({ campaign_id: campaignId, asset_id: assetId })
          }
        }

        // Times
        const playedAt = startTime ? toUtc(startTime, reportTz) : new Date().toISOString()
        const endedAt = endTime ? toUtc(endTime, reportTz) : (durationSec ? new Date(new Date(playedAt).getTime() + durationSec * 1000).toISOString() : null)

        // Insert play (dedupe by unique key)
        await supabase
          .from('plays')
          .upsert({
            org_id: orgId,
            kiosk_id: kioskId,
            asset_id: assetId,
            campaign_id: campaignId,
            provider_event_id: eventId ?? null,
            played_at: playedAt,
            ended_at: endedAt,
            duration_sec: durationSec ?? null
          }, { onConflict: 'org_id,kiosk_id,asset_id,played_at' })

        inserted++
        lastPlayedAt = playedAt
      } catch (_e) {
        dropped++
      }
    }

    // Refresh MV
    try { await supabase.rpc('refresh_plays_daily') } catch (_) {}

    return new Response(JSON.stringify({ ok: true, inserted, dropped, lastPlayedAt }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  }
})


