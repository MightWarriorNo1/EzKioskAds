# Stripe Connect Setup Guide

This guide will help you set up Stripe Connect for the Ad Management Platform to enable automatic payouts to hosts.

## Prerequisites

1. A Stripe account (create one at [stripe.com](https://stripe.com))
2. Access to your Supabase project dashboard
3. Admin access to the Ad Management Platform

## Step 1: Configure Stripe Connect

### 1.1 Enable Stripe Connect in Stripe Dashboard

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Connect** in the left sidebar
3. Click **Get Started** if you haven't enabled Connect yet
4. Choose **Express accounts** (recommended for simplicity)
5. Complete the Connect onboarding process

### 1.2 Get Your Stripe Keys

1. In your Stripe Dashboard, go to **Developers** > **API keys**
2. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)
4. Go to **Connect** > **Settings** and copy your **Client ID** (starts with `ca_`)

### 1.3 Set Up Webhook Endpoint

1. In your Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://your-supabase-project.supabase.co/functions/v1/stripe-connect-webhook`
4. Select these events to listen for:
   - `account.updated`
   - `account.application.deauthorized`
   - `transfer.created`
   - `transfer.updated`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

## Step 2: Configure Environment Variables

### 2.1 Frontend Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_STRIPE_CLIENT_ID=ca_your_stripe_connect_client_id
```

### 2.2 Supabase Edge Function Environment Variables

In your Supabase project dashboard, go to **Settings** > **Edge Functions** and add these environment variables:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
```

## Step 3: Deploy Edge Functions

The following edge functions need to be deployed to your Supabase project:

1. `stripe-connect-create-account-link` - Creates Stripe Connect account links for onboarding
2. `stripe-connect-get-account` - Retrieves account status from Stripe
3. `stripe-connect-create-payout` - Creates transfers to host accounts
4. `stripe-connect-get-payouts` - Retrieves payout history
5. `stripe-connect-process-payouts` - Processes scheduled payouts
6. `stripe-connect-webhook` - Handles Stripe webhook events

### Deploy Commands

```bash
# Deploy all Stripe Connect functions
supabase functions deploy stripe-connect-create-account-link
supabase functions deploy stripe-connect-get-account
supabase functions deploy stripe-connect-create-payout
supabase functions deploy stripe-connect-get-payouts
supabase functions deploy stripe-connect-process-payouts
supabase functions deploy stripe-connect-webhook
```

## Step 4: Test the Integration

### 4.1 Test Account Creation

1. Log in as a host user
2. Navigate to the Payout History page
3. Click "Setup Stripe Connect"
4. Complete the Stripe Connect onboarding flow
5. Verify the account status shows as "Complete"

### 4.2 Test Payout Processing

1. Ensure you have some revenue data in the `host_revenue` table
2. Call the process payouts function:
   ```bash
   curl -X POST https://your-supabase-project.supabase.co/functions/v1/stripe-connect-process-payouts \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```
3. Check the `host_payouts` table for new payout records
4. Verify transfers appear in your Stripe Dashboard

## Step 5: Set Up Automated Payouts (Optional)

To automatically process payouts on a schedule, you can set up a cron job or use a service like:

- **GitHub Actions** (for free tier)
- **Vercel Cron Jobs**
- **Railway Cron Jobs**
- **Supabase Edge Functions with cron triggers**

### Example GitHub Actions Workflow

Create `.github/workflows/process-payouts.yml`:

```yaml
name: Process Host Payouts

on:
  schedule:
    # Run every Friday at 2 PM UTC
    - cron: '0 14 * * 5'
  workflow_dispatch:

jobs:
  process-payouts:
    runs-on: ubuntu-latest
    steps:
      - name: Process Payouts
        run: |
          curl -X POST ${{ secrets.SUPABASE_FUNCTION_URL }}/stripe-connect-process-payouts \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

## Troubleshooting

### Common Issues

1. **"Missing STRIPE_SECRET_KEY" error**
   - Ensure the environment variable is set in Supabase Edge Functions settings

2. **"No Stripe Connect account found" error**
   - Verify the host has completed the Stripe Connect onboarding process
   - Check that the `stripe_connect_account_id` is saved in the profiles table

3. **Webhook signature verification failed**
   - Ensure the webhook secret is correctly set in environment variables
   - Verify the webhook endpoint URL is correct

4. **Account not showing as enabled**
   - Check that the webhook is receiving `account.updated` events
   - Verify the account has completed all required verification steps

### Debugging Steps

1. Check Supabase Edge Function logs for errors
2. Verify Stripe webhook events are being received
3. Check the `profiles` table for correct `stripe_connect_account_id` values
4. Test individual edge functions using the Supabase dashboard

## Security Considerations

1. **Never expose secret keys** in frontend code
2. **Use environment variables** for all sensitive configuration
3. **Enable Row Level Security** on all database tables
4. **Validate webhook signatures** to ensure requests are from Stripe
5. **Use HTTPS** for all webhook endpoints

## Support

For additional help:

1. Check the [Stripe Connect documentation](https://stripe.com/docs/connect)
2. Review Supabase Edge Functions [documentation](https://supabase.com/docs/guides/functions)
3. Contact support through the platform's admin panel

## Production Checklist

Before going live:

- [ ] Switch to live Stripe keys (remove `_test` suffix)
- [ ] Update webhook endpoint to production URL
- [ ] Test with real bank accounts (not test accounts)
- [ ] Set up monitoring for failed payouts
- [ ] Configure proper error handling and notifications
- [ ] Test the complete payout flow end-to-end
