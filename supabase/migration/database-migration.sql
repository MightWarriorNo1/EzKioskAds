-- Database Migration Script
-- Add role field to profiles table and create trigger for automatic profile creation

-- Step 1: Add role column to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL CHECK (role IN ('client', 'host', 'admin')) DEFAULT 'client';

-- Step 2: Create index for role field
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Recreate with SECURITY DEFINER and stable search_path to ensure it runs from auth trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if profile already exists (prevent duplicate)
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Insert new profile with role from metadata
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 4: Create trigger for new user creation (drop if exists first)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure function owner is postgres or service role for SECURITY DEFINER correctness
DO $$ BEGIN
  PERFORM 1 FROM pg_roles WHERE rolname = 'postgres';
  IF FOUND THEN
    ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- ignore ownership change errors in local environments
  NULL;
END $$;

-- Create function to check admin role without recursion
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function runs with elevated privileges, bypassing RLS
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin(auth.uid()));

-- Step 6: Update existing profiles to have a default role if they don't have one
UPDATE profiles SET role = 'client' WHERE role IS NULL OR role = '';

-- Backfill profiles for any existing auth users missing a profile
INSERT INTO public.profiles (id, email, full_name, role)
SELECT u.id,
       u.email,
       COALESCE(u.raw_user_meta_data->>'name', 'Unknown') AS full_name,
       COALESCE(u.raw_user_meta_data->>'role', 'client') AS role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'paused')) DEFAULT 'active',
  auto_renewal BOOLEAN NOT NULL DEFAULT TRUE,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create subscription_campaigns junction table
CREATE TABLE IF NOT EXISTS public.subscription_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(subscription_id, campaign_id)
);

-- Create payment_history table
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
  description TEXT,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can manage their own subscriptions
DROP POLICY IF EXISTS "Users can select own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can select own subscriptions" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can delete own subscriptions" ON public.subscriptions
  FOR DELETE USING (user_id = auth.uid());

-- RLS for subscription_campaigns: allowed if the related subscription belongs to user
DROP POLICY IF EXISTS "Users can select own subscription_campaigns" ON public.subscription_campaigns;
CREATE POLICY "Users can select own subscription_campaigns" ON public.subscription_campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.id = subscription_campaigns.subscription_id
        AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own subscription_campaigns" ON public.subscription_campaigns;
CREATE POLICY "Users can insert own subscription_campaigns" ON public.subscription_campaigns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.id = subscription_campaigns.subscription_id
        AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own subscription_campaigns" ON public.subscription_campaigns;
CREATE POLICY "Users can delete own subscription_campaigns" ON public.subscription_campaigns
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.id = subscription_campaigns.subscription_id
        AND s.user_id = auth.uid()
    )
  );

-- RLS policies: users can view and manage their own payment history
DROP POLICY IF EXISTS "Users can select own payments" ON public.payment_history;
CREATE POLICY "Users can select own payments" ON public.payment_history
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own payments" ON public.payment_history;
CREATE POLICY "Users can insert own payments" ON public.payment_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Typically updates/deletes are not allowed on historical payments, but allow own if needed
DROP POLICY IF EXISTS "Users can update own payments" ON public.payment_history;
CREATE POLICY "Users can update own payments" ON public.payment_history
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own payments" ON public.payment_history;
CREATE POLICY "Users can delete own payments" ON public.payment_history
  FOR DELETE USING (user_id = auth.uid());

-- Touch updated_at on subscriptions
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Final verification
-- Custom ad orders table for Custom Ads Page submissions
CREATE TABLE IF NOT EXISTS public.custom_ad_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_key TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  details TEXT NOT NULL,
  files JSONB NOT NULL DEFAULT '[]',
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','succeeded','failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS and policies for custom_ad_orders
ALTER TABLE public.custom_ad_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own custom ad orders" ON public.custom_ad_orders;
CREATE POLICY "Users can view own custom ad orders" ON public.custom_ad_orders
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own custom ad orders" ON public.custom_ad_orders;
CREATE POLICY "Users can insert own custom ad orders" ON public.custom_ad_orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own custom ad orders" ON public.custom_ad_orders;
CREATE POLICY "Users can update own custom ad orders" ON public.custom_ad_orders
  FOR UPDATE USING (user_id = auth.uid());

-- Storage bucket for custom ad uploads
INSERT INTO storage.buckets (id, name, public) VALUES
('custom-ad-uploads', 'custom-ad-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for custom ad uploads
DROP POLICY IF EXISTS "Custom ad uploads are publicly accessible" ON storage.objects;
CREATE POLICY "Custom ad uploads are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'custom-ad-uploads');

DROP POLICY IF EXISTS "Users can upload their own custom ad files" ON storage.objects;
CREATE POLICY "Users can upload their own custom ad files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'custom-ad-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their own custom ad files" ON storage.objects;
CREATE POLICY "Users can update their own custom ad files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'custom-ad-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete their own custom ad files" ON storage.objects;
CREATE POLICY "Users can delete their own custom ad files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'custom-ad-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- updated_at trigger for custom_ad_orders
DROP TRIGGER IF EXISTS set_custom_ad_orders_updated_at ON public.custom_ad_orders;
CREATE TRIGGER set_custom_ad_orders_updated_at
  BEFORE UPDATE ON public.custom_ad_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

SELECT 'Migration completed successfully' as status;
