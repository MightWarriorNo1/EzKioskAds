// deno-lint-ignore-file no-explicit-any
// @ts-nocheck
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Get all hosts with Stripe Connect enabled
    const { data: hosts } = await supabase
      .from('profiles')
      .select('id, payout_frequency, minimum_payout, stripe_connect_account_id')
      .eq('stripe_connect_enabled', true)
      .not('stripe_connect_account_id', 'is', null)

    if (!hosts || hosts.length === 0) {
      return new Response(JSON.stringify({ message: 'No hosts with Stripe Connect enabled' }), {
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    const processedPayouts = []

    for (const host of hosts) {
      try {
        // Calculate payout period based on frequency
        const now = new Date()
        let periodStart: Date
        let periodEnd: Date

        if (host.payout_frequency === 'weekly') {
          // Weekly payouts on Fridays
          const daysUntilFriday = (5 - now.getDay() + 7) % 7
          const lastFriday = new Date(now)
          lastFriday.setDate(now.getDate() - daysUntilFriday)
          lastFriday.setHours(0, 0, 0, 0)
          
          periodEnd = lastFriday
          periodStart = new Date(lastFriday)
          periodStart.setDate(lastFriday.getDate() - 7)
        } else {
          // Monthly payouts on the last day of the month
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 0)
          periodEnd = lastMonth
          periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        }

        // Check if payout already exists for this period
        const { data: existingPayout } = await supabase
          .from('host_payouts')
          .select('id')
          .eq('host_id', host.id)
          .eq('period_start', periodStart.toISOString().split('T')[0])
          .eq('period_end', periodEnd.toISOString().split('T')[0])
          .single()

        if (existingPayout) {
          console.log(`Payout already exists for host ${host.id} for period ${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]}`)
          continue
        }

        // Calculate total commission for the period
        const { data: revenueData } = await supabase
          .from('host_revenue')
          .select('commission')
          .eq('host_id', host.id)
          .gte('date', periodStart.toISOString().split('T')[0])
          .lte('date', periodEnd.toISOString().split('T')[0])

        const totalCommission = revenueData?.reduce((sum, row) => sum + parseFloat(row.commission || 0), 0) || 0

        // Check if commission meets minimum payout threshold
        if (totalCommission < (host.minimum_payout || 100)) {
          console.log(`Host ${host.id} commission ${totalCommission} below minimum ${host.minimum_payout}`)
          continue
        }

        // Create payout record
        const { data: payout, error: payoutError } = await supabase
          .from('host_payouts')
          .insert({
            host_id: host.id,
            amount: totalCommission,
            status: 'pending',
            payout_method: 'stripe_connect',
            period_start: periodStart.toISOString().split('T')[0],
            period_end: periodEnd.toISOString().split('T')[0]
          })
          .select()
          .single()

        if (payoutError) {
          console.error('Error creating payout record:', payoutError)
          continue
        }

        // Create transfer in Stripe
        const transfer = await stripe.transfers.create({
          amount: Math.round(totalCommission * 100), // Convert to cents
          currency: 'usd',
          destination: host.stripe_connect_account_id,
          transfer_group: `payout_${host.id}_${Date.now()}`,
          metadata: {
            host_id: host.id,
            payout_id: payout.id,
            period_start: periodStart.toISOString().split('T')[0],
            period_end: periodEnd.toISOString().split('T')[0]
          }
        })

        // Update payout with transfer ID
        await supabase
          .from('host_payouts')
          .update({ stripe_transfer_id: transfer.id })
          .eq('id', payout.id)

        // Create payout statements
        const { data: revenueBreakdown } = await supabase
          .from('host_revenue')
          .select(`
            kiosk_id,
            ad_assignment_id,
            impressions,
            clicks,
            revenue,
            commission
          `)
          .eq('host_id', host.id)
          .gte('date', periodStart.toISOString().split('T')[0])
          .lte('date', periodEnd.toISOString().split('T')[0])

        if (revenueBreakdown && revenueBreakdown.length > 0) {
          const statements = revenueBreakdown.map(row => ({
            payout_id: payout.id,
            kiosk_id: row.kiosk_id,
            ad_assignment_id: row.ad_assignment_id,
            impressions: row.impressions || 0,
            clicks: row.clicks || 0,
            revenue: parseFloat(row.revenue || 0),
            commission_rate: 70.00, // Default commission rate
            commission_amount: parseFloat(row.commission || 0)
          }))

          await supabase
            .from('host_payout_statements')
            .insert(statements)
        }

        processedPayouts.push({
          hostId: host.id,
          payoutId: payout.id,
          amount: totalCommission,
          transferId: transfer.id
        })

        console.log(`Created payout for host ${host.id}: $${totalCommission}`)

      } catch (error) {
        console.error(`Error processing payout for host ${host.id}:`, error)
      }
    }

    return new Response(JSON.stringify({
      message: `Processed ${processedPayouts.length} payouts`,
      payouts: processedPayouts
    }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Error processing scheduled payouts:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  }
})
