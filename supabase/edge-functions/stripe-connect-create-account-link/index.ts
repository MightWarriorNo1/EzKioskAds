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

    const { hostId, refreshUrl, returnUrl } = await req.json()

    if (!hostId || !refreshUrl || !returnUrl) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    // Get or create Stripe Connect account
    let accountId: string
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_connect_account_id, email')
      .eq('id', hostId)
      .single()

    if (profile?.stripe_connect_account_id) {
      // Verify the existing account is still valid
      try {
        const existingAccount = await stripe.accounts.retrieve(profile.stripe_connect_account_id)
        if (existingAccount && !existingAccount.deleted) {
          accountId = profile.stripe_connect_account_id
        } else {
          // Account was deleted, create a new one
          throw new Error('Account deleted')
        }
      } catch (error) {
        console.log('Existing account invalid, creating new one:', error.message)
        // Create new Stripe Connect account
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'US',
          email: profile?.email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        })
        accountId = account.id

        // Save new account ID to profile
        await supabase
          .from('profiles')
          .update({ stripe_connect_account_id: accountId })
          .eq('id', hostId)
      }
    } else {
      // Create new Stripe Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: profile?.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      accountId = account.id

      // Save account ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_connect_account_id: accountId })
        .eq('id', hostId)
    }

    // Create account link
    console.log('Creating account link for account:', accountId)
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    console.log('Account link created successfully:', accountLink.id)
    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Error creating Stripe Connect account link:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  }
})