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
      return new Response(JSON.stringify({ error: 'Missing hostId' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    // Get Stripe Connect account ID from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_connect_account_id')
      .eq('id', hostId)
      .single()

    if (!profile?.stripe_connect_account_id) {
      return new Response(JSON.stringify({ error: 'No Stripe Connect account found' }), {
        status: 404,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(profile.stripe_connect_account_id)

    return new Response(JSON.stringify(account), {
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Error getting Stripe Connect account:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  }
})

