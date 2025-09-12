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

    // Get all profiles with Stripe Connect account IDs
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, stripe_connect_account_id')
      .not('stripe_connect_account_id', 'is', null)

    if (profilesError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch profiles' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    const results = []
    const invalidAccountIds = []

    for (const profile of profiles || []) {
      if (!profile.stripe_connect_account_id) continue

      try {
        const account = await stripe.accounts.retrieve(profile.stripe_connect_account_id)
        if (account.deleted) {
          invalidAccountIds.push(profile.id)
          results.push({
            profileId: profile.id,
            email: profile.email,
            accountId: profile.stripe_connect_account_id,
            status: 'deleted',
            action: 'cleared'
          })
        } else {
          results.push({
            profileId: profile.id,
            email: profile.email,
            accountId: profile.stripe_connect_account_id,
            status: 'valid',
            action: 'none'
          })
        }
      } catch (error) {
        invalidAccountIds.push(profile.id)
        results.push({
          profileId: profile.id,
          email: profile.email,
          accountId: profile.stripe_connect_account_id,
          status: 'invalid',
          error: error.message,
          action: 'cleared'
        })
      }
    }

    // Clear invalid account IDs from database
    if (invalidAccountIds.length > 0) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          stripe_connect_account_id: null,
          stripe_connect_enabled: false 
        })
        .in('id', invalidAccountIds)

      if (updateError) {
        console.error('Error clearing invalid account IDs:', updateError)
      }
    }

    return new Response(JSON.stringify({
      totalProfiles: profiles?.length || 0,
      invalidAccounts: invalidAccountIds.length,
      clearedAccounts: invalidAccountIds,
      results
    }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Error clearing invalid Stripe Connect accounts:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  }
})
