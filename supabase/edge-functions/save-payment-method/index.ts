// deno-lint-ignore-file no-explicit-any
// @ts-nocheck
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase configuration' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.json()
    const { paymentMethodId, userId } = body

    if (!paymentMethodId || !userId) {
      return new Response(JSON.stringify({ error: 'Missing paymentMethodId or userId' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    // Get payment method details from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    
    if (!paymentMethod) {
      return new Response(JSON.stringify({ error: 'Payment method not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    // Set all existing payment methods to not default
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId)

    // Save the payment method to our database
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([{
        user_id: userId,
        stripe_payment_method_id: paymentMethodId,
        type: paymentMethod.type,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        expiry_month: paymentMethod.card?.exp_month,
        expiry_year: paymentMethod.card?.exp_year,
        is_default: true
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(JSON.stringify({ error: 'Failed to save payment method' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      paymentMethod: data 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })

  } catch (error) {
    console.error('Error saving payment method:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  }
})
