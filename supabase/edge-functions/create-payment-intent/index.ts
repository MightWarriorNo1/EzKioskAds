// deno-lint-ignore-file no-explicit-any
// @ts-nocheck
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const body = await req.json()
    const { amount, currency = 'usd', metadata, recaptchaToken, captchaRequired } = body

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    if (captchaRequired) {
      const recaptchaSecretKey = Deno.env.get('RECAPTCHA_SECRET_KEY')
      if (!recaptchaSecretKey) {
        return new Response(JSON.stringify({ error: 'Missing RECAPTCHA_SECRET_KEY' }), {
          status: 500,
          headers: { ...corsHeaders, 'content-type': 'application/json' }
        })
      }
      if (!recaptchaToken || typeof recaptchaToken !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing recaptcha token' }), {
          status: 400,
          headers: { ...corsHeaders, 'content-type': 'application/json' }
        })
      }
      const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: recaptchaSecretKey,
          response: recaptchaToken,
          remoteip: req.headers.get('x-forwarded-for') ?? ''
        }).toString()
      })
      const verifyJson = await verifyRes.json()
      if (!verifyJson?.success) {
        return new Response(JSON.stringify({ error: 'reCAPTCHA verification failed', details: verifyJson }), {
          status: 400,
          headers: { ...corsHeaders, 'content-type': 'application/json' }
        })
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in the smallest currency unit (cents)
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  }
})


