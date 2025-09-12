// deno-lint-ignore-file no-explicit-any
// @ts-nocheck
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!stripeSecretKey || !stripeWebhookSecret) {
      return new Response(JSON.stringify({ error: 'Missing Stripe configuration' }), {
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

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      })
    }

    console.log('Received Stripe webhook:', event.type)

    switch (event.type) {
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account, supabase)
        break
      
      case 'account.application.deauthorized':
        await handleAccountDeauthorized(event.data.object as Stripe.Account, supabase)
        break
      
      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer, supabase)
        break
      
      case 'transfer.updated':
        await handleTransferUpdated(event.data.object as Stripe.Transfer, supabase)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    })
  }
})

async function handleAccountUpdated(account: Stripe.Account, supabase: any) {
  try {
    // Find the host profile by Stripe Connect account ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_connect_account_id', account.id)
      .single()

    if (!profile) {
      console.log('No profile found for account:', account.id)
      return
    }

    // Update the profile with account status
    const updates: any = {}
    
    if (account.details_submitted !== undefined) {
      updates.stripe_connect_enabled = account.details_submitted && account.charges_enabled && account.payouts_enabled
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
      
      console.log('Updated profile for account:', account.id, updates)
    }
  } catch (error) {
    console.error('Error handling account updated:', error)
  }
}

async function handleAccountDeauthorized(account: Stripe.Account, supabase: any) {
  try {
    // Find and disable the host profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_connect_account_id', account.id)
      .single()

    if (profile) {
      await supabase
        .from('profiles')
        .update({ 
          stripe_connect_enabled: false,
          stripe_connect_account_id: null 
        })
        .eq('id', profile.id)
      
      console.log('Disabled Stripe Connect for profile:', profile.id)
    }
  } catch (error) {
    console.error('Error handling account deauthorized:', error)
  }
}

async function handleTransferCreated(transfer: Stripe.Transfer, supabase: any) {
  try {
    // Update payout status to processing
    const { data: payout } = await supabase
      .from('host_payouts')
      .select('id')
      .eq('stripe_transfer_id', transfer.id)
      .single()

    if (payout) {
      await supabase
        .from('host_payouts')
        .update({ status: 'processing' })
        .eq('id', payout.id)
      
      console.log('Updated payout status to processing:', payout.id)
    }
  } catch (error) {
    console.error('Error handling transfer created:', error)
  }
}

async function handleTransferUpdated(transfer: Stripe.Transfer, supabase: any) {
  try {
    // Update payout status based on transfer status
    const { data: payout } = await supabase
      .from('host_payouts')
      .select('id')
      .eq('stripe_transfer_id', transfer.id)
      .single()

    if (payout) {
      let status = 'processing'
      if (transfer.status === 'paid') {
        status = 'completed'
      } else if (transfer.status === 'failed') {
        status = 'failed'
      }

      await supabase
        .from('host_payouts')
        .update({ 
          status,
          processed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', payout.id)
      
      console.log('Updated payout status:', payout.id, status)
    }
  } catch (error) {
    console.error('Error handling transfer updated:', error)
  }
}
