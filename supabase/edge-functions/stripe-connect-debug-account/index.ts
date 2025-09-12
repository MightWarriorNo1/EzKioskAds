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

    const { hostId } = await req.json()

    if (!hostId) {
      return new Response(JSON.stringify({ error: 'Missing hostId parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_connect_account_id, email, id')
      .eq('id', hostId)
      .single()

    if (profileError) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    const result = {
      profile: {
        id: profile.id,
        email: profile.email,
        stripe_connect_account_id: profile.stripe_connect_account_id
      },
      stripeAccount: null,
      isValid: false,
      error: null
    }

    if (profile.stripe_connect_account_id) {
      try {
        const account = await stripe.accounts.retrieve(profile.stripe_connect_account_id)
        result.stripeAccount = {
          id: account.id,
          object: account.object,
          business_type: account.business_type,
          country: account.country,
          default_currency: account.default_currency,
          details_submitted: account.details_submitted,
          payouts_enabled: account.payouts_enabled,
          charges_enabled: account.charges_enabled,
          email: account.email,
          created: account.created,
          deleted: account.deleted
        }
        result.isValid = !account.deleted
      } catch (error) {
        result.error = error.message
        result.isValid = false
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Error debugging Stripe Connect account:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  }
})
