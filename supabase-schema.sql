-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'host', 'admin')) DEFAULT 'client',
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
  stripe_customer_id TEXT
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'paused', 'completed', 'rejected')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  daily_budget DECIMAL(10,2),
  target_locations TEXT[] DEFAULT '{}',
  target_demographics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_spent DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  total_slots INTEGER DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0
);

-- Create media_assets table
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  mime_type TEXT NOT NULL,
  dimensions JSONB NOT NULL,
  duration INTEGER,
  status TEXT DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'approved', 'rejected', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validation_errors TEXT[]
);

-- Create campaign_media junction table
CREATE TABLE IF NOT EXISTS campaign_media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  media_id UUID REFERENCES media_assets(id) ON DELETE CASCADE NOT NULL,
  display_order INTEGER DEFAULT 0,
  weight INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, media_id)
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  paid_date DATE,
  stripe_invoice_id TEXT,
  description TEXT NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_method_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account')),
  last4 TEXT,
  brand TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupon_codes table
CREATE TABLE IF NOT EXISTS coupon_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'free')),
  value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER NOT NULL,
  current_uses INTEGER DEFAULT 0,
  min_amount DECIMAL(10,2),
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupon_usage table
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coupon_id UUID REFERENCES coupon_codes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create creative_services table
CREATE TABLE IF NOT EXISTS creative_services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('image', 'video', 'design', 'copywriting')),
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  delivery_time INTEGER NOT NULL, -- in days
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_orders table
CREATE TABLE IF NOT EXISTS service_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES creative_services(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  requirements JSONB NOT NULL,
  final_delivery TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kiosks table
CREATE TABLE IF NOT EXISTS kiosks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  traffic_level TEXT NOT NULL CHECK (traffic_level IN ('low', 'medium', 'high')),
  base_rate DECIMAL(10,2) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  coordinates JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kiosk_campaigns junction table
CREATE TABLE IF NOT EXISTS kiosk_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  kiosk_id UUID REFERENCES kiosks(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, kiosk_id)
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  media_id UUID REFERENCES media_assets(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click', 'play', 'complete')),
  location TEXT NOT NULL,
  device_info JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_media_assets_user_id ON media_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_status ON media_assets(status);
CREATE INDEX IF NOT EXISTS idx_media_assets_file_type ON media_assets(file_type);
CREATE INDEX IF NOT EXISTS idx_campaign_media_campaign_id ON campaign_media(campaign_id);
CREATE INDEX IF NOT EXISTS idx_kiosks_status ON kiosks(status);
CREATE INDEX IF NOT EXISTS idx_kiosks_city_state ON kiosks(city, state);
CREATE INDEX IF NOT EXISTS idx_kiosk_campaigns_campaign_id ON kiosk_campaigns(campaign_id);
CREATE INDEX IF NOT EXISTS idx_kiosk_campaigns_kiosk_id ON kiosk_campaigns(kiosk_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_code ON coupon_codes(code);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_active ON coupon_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_analytics_events_campaign_id ON analytics_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);

-- Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiosks ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiosk_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

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

-- Admin can view all profiles (using function to avoid recursion)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin(auth.uid()));

-- Admin can update all profiles (using function to avoid recursion)
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin(auth.uid()));

-- Campaigns policies
DROP POLICY IF EXISTS "Users can view own campaigns" ON campaigns;
CREATE POLICY "Users can view own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own campaigns" ON campaigns;
CREATE POLICY "Users can insert own campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own campaigns" ON campaigns;
CREATE POLICY "Users can update own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own campaigns" ON campaigns;
CREATE POLICY "Users can delete own campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Media assets policies
DROP POLICY IF EXISTS "Users can view own media assets" ON media_assets;
CREATE POLICY "Users can view own media assets" ON media_assets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own media assets" ON media_assets;
CREATE POLICY "Users can insert own media assets" ON media_assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own media assets" ON media_assets;
CREATE POLICY "Users can update own media assets" ON media_assets
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own media assets" ON media_assets;
CREATE POLICY "Users can delete own media assets" ON media_assets
  FOR DELETE USING (auth.uid() = user_id);

-- Campaign media policies
DROP POLICY IF EXISTS "Users can view campaign media for own campaigns" ON campaign_media;
CREATE POLICY "Users can view campaign media for own campaigns" ON campaign_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns WHERE id = campaign_media.campaign_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage campaign media for own campaigns" ON campaign_media;
CREATE POLICY "Users can manage campaign media for own campaigns" ON campaign_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM campaigns WHERE id = campaign_media.campaign_id AND user_id = auth.uid()
    )
  );

-- Kiosks policies (public read access for active kiosks)
DROP POLICY IF EXISTS "Anyone can view active kiosks" ON kiosks;
CREATE POLICY "Anyone can view active kiosks" ON kiosks
  FOR SELECT USING (status = 'active');

-- Admin can manage all kiosks
DROP POLICY IF EXISTS "Admins can manage all kiosks" ON kiosks;
CREATE POLICY "Admins can manage all kiosks" ON kiosks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Kiosk campaigns policies
DROP POLICY IF EXISTS "Users can view kiosk campaigns for own campaigns" ON kiosk_campaigns;
CREATE POLICY "Users can view kiosk campaigns for own campaigns" ON kiosk_campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns WHERE id = kiosk_campaigns.campaign_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage kiosk campaigns for own campaigns" ON kiosk_campaigns;
CREATE POLICY "Users can manage kiosk campaigns for own campaigns" ON kiosk_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM campaigns WHERE id = kiosk_campaigns.campaign_id AND user_id = auth.uid()
    )
  );

-- Invoices policies
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own invoices" ON invoices;
CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);

-- Payment methods policies
DROP POLICY IF EXISTS "Users can view own payment methods" ON payment_methods;
CREATE POLICY "Users can view own payment methods" ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own payment methods" ON payment_methods;
CREATE POLICY "Users can insert own payment methods" ON payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own payment methods" ON payment_methods;
CREATE POLICY "Users can update own payment methods" ON payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own payment methods" ON payment_methods;
CREATE POLICY "Users can delete own payment methods" ON payment_methods
  FOR DELETE USING (auth.uid() = user_id);

-- Coupon usage policies
DROP POLICY IF EXISTS "Users can view own coupon usage" ON coupon_usage;
CREATE POLICY "Users can view own coupon usage" ON coupon_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own coupon usage" ON coupon_usage;
CREATE POLICY "Users can insert own coupon usage" ON coupon_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service orders policies
DROP POLICY IF EXISTS "Users can view own service orders" ON service_orders;
CREATE POLICY "Users can view own service orders" ON service_orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own service orders" ON service_orders;
CREATE POLICY "Users can insert own service orders" ON service_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own service orders" ON service_orders;
CREATE POLICY "Users can update own service orders" ON service_orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Analytics events policies (read-only for users)
DROP POLICY IF EXISTS "Users can view analytics for own campaigns" ON analytics_events;
CREATE POLICY "Users can view analytics for own campaigns" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns WHERE id = analytics_events.campaign_id AND user_id = auth.uid()
    )
  );

-- Public read access for creative services and coupon codes
ALTER TABLE creative_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active creative services" ON creative_services;
CREATE POLICY "Anyone can view active creative services" ON creative_services
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view active coupon codes" ON coupon_codes;
CREATE POLICY "Anyone can view active coupon codes" ON coupon_codes
  FOR SELECT USING (is_active = true);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_assets_updated_at ON media_assets;
CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupon_codes_updated_at ON coupon_codes;
CREATE TRIGGER update_coupon_codes_updated_at BEFORE UPDATE ON coupon_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_creative_services_updated_at ON creative_services;
CREATE TRIGGER update_creative_services_updated_at BEFORE UPDATE ON creative_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_orders_updated_at ON service_orders;
CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON service_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kiosks_updated_at ON kiosks;
CREATE TRIGGER update_kiosks_updated_at BEFORE UPDATE ON kiosks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate media dimensions
CREATE OR REPLACE FUNCTION validate_media_dimensions()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if dimensions are valid (9:16 ratio and correct resolutions)
  IF NEW.dimensions->>'width' IS NULL OR NEW.dimensions->>'height' IS NULL THEN
    RAISE EXCEPTION 'Dimensions must be specified';
  END IF;
  
  -- Check aspect ratio (9:16 = 0.5625)
  IF ABS((NEW.dimensions->>'width')::numeric / (NEW.dimensions->>'height')::numeric - 0.5625) > 0.01 THEN
    RAISE EXCEPTION 'Aspect ratio must be 9:16 (portrait)';
  END IF;
  
  -- Check resolution
  IF NOT (
    ((NEW.dimensions->>'width')::integer = 1080 AND (NEW.dimensions->>'height')::integer = 1920) OR
    ((NEW.dimensions->>'width')::integer = 2160 AND (NEW.dimensions->>'height')::integer = 3840)
  ) THEN
    RAISE EXCEPTION 'Resolution must be 1080x1920 or 2160x3840';
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for media validation
DROP TRIGGER IF EXISTS validate_media_dimensions_trigger ON media_assets;
CREATE TRIGGER validate_media_dimensions_trigger BEFORE INSERT OR UPDATE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION validate_media_dimensions();

-- Function to handle file size limits
CREATE OR REPLACE FUNCTION validate_file_size()
RETURNS TRIGGER AS $$
BEGIN
  -- Check file size limits
  IF NEW.file_type = 'image' AND NEW.file_size > 10 * 1024 * 1024 THEN
    RAISE EXCEPTION 'Image file size must be under 10MB';
  END IF;
  
  IF NEW.file_type = 'video' AND NEW.file_size > 500 * 1024 * 1024 THEN
    RAISE EXCEPTION 'Video file size must be under 500MB';
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for file size validation
DROP TRIGGER IF EXISTS validate_file_size_trigger ON media_assets;
CREATE TRIGGER validate_file_size_trigger BEFORE INSERT OR UPDATE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION validate_file_size();

-- Insert sample creative services (only if they don't exist)
INSERT INTO creative_services (name, description, category, price, delivery_time, features) 
SELECT * FROM (VALUES 
('Vertical Image Design Package', 'Professional vertical image design for digital displays', 'image', 299.00, 3, ARRAY['Custom design', 'Multiple revisions', 'Source files included', '9:16 aspect ratio']),
('Vertical Video Production', 'High-quality vertical video production for digital signage', 'video', 899.00, 7, ARRAY['Script writing', 'Professional filming', 'Editing & effects', 'Multiple formats', '15-second duration']),
('Brand Identity Package', 'Complete brand identity design for your business', 'design', 599.00, 5, ARRAY['Logo design', 'Color palette', 'Typography', 'Brand guidelines']),
('Ad Copywriting Service', 'Compelling ad copy that converts', 'copywriting', 199.00, 2, ARRAY['Multiple variations', 'A/B testing suggestions', 'SEO optimization'])
) AS v(name, description, category, price, delivery_time, features)
WHERE NOT EXISTS (SELECT 1 FROM creative_services WHERE creative_services.name = v.name);

-- Insert sample coupon codes
INSERT INTO coupon_codes (code, type, value, max_uses, min_amount, valid_until) VALUES
('WELCOME20', 'percentage', 20.00, 100, 50.00, '2025-12-31'),
('NEWCUSTOMER50', 'fixed', 50.00, 50, 100.00, '2025-06-30'),
('FREETRIAL', 'free', 0.00, 25, 0.00, '2025-03-31')
ON CONFLICT (code) DO NOTHING;

-- Insert sample kiosks (only if they don't exist)
INSERT INTO kiosks (id, name, location, address, city, state, traffic_level, base_rate, price, coordinates, description) 
SELECT v.id::uuid, v.name, v.location, v.address, v.city, v.state, v.traffic_level, v.base_rate, v.price, v.coordinates::jsonb, v.description
FROM (VALUES 
('a1b2c3d4-e5f6-4789-abcd-ef1234567890', 'Murrieta Town Center', 'Murrieta Town Center', '123 Main St, Murrieta, CA 92562', 'Murrieta', 'CA', 'high', 90.00, 90.00, '{"lat": 33.5689, "lng": -117.1865}', 'High-traffic location in the heart of Murrieta'),
('b2c3d4e5-f6a7-4801-bcde-f23456789012', 'California Oaks Shopping Center', 'California Oaks Shopping Center', '456 California Oaks Rd, Murrieta, CA 92562', 'Murrieta', 'CA', 'medium', 50.00, 50.00, '{"lat": 33.5721, "lng": -117.1892}', 'Popular shopping destination with steady foot traffic'),
('c3d4e5f6-a7b8-4012-cdef-345678901234', 'North Jeffe Plaza', 'North Jeffe Plaza', '789 North Jeffe St, Murrieta, CA 92562', 'Murrieta', 'CA', 'low', 40.00, 40.00, '{"lat": 33.5750, "lng": -117.1920}', 'Affordable option in growing neighborhood'),
('d4e5f6a7-b8c9-4123-defa-456789012345', 'Murrieta Hot Springs', 'Murrieta Hot Springs', '321 Hot Springs Blvd, Murrieta, CA 92562', 'Murrieta', 'CA', 'high', 90.00, 90.00, '{"lat": 33.5660, "lng": -117.1840}', 'Premium location near popular attractions'),
('e5f6a7b8-c9d0-4234-efab-567890123456', 'Murrieta Valley Plaza', 'Murrieta Valley Plaza', '654 Valley Blvd, Murrieta, CA 92562', 'Murrieta', 'CA', 'medium', 50.00, 50.00, '{"lat": 33.5700, "lng": -117.1880}', 'Well-established retail area with good visibility')
) AS v(id, name, location, address, city, state, traffic_level, base_rate, price, coordinates, description)
WHERE NOT EXISTS (SELECT 1 FROM kiosks WHERE kiosks.id = v.id::uuid);

-- Create storage buckets for media files
INSERT INTO storage.buckets (id, name, public) VALUES
('media-assets', 'media-assets', true),
('campaign-content', 'campaign-content', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for media assets
DROP POLICY IF EXISTS "Media assets are publicly accessible" ON storage.objects;
CREATE POLICY "Media assets are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'media-assets');

DROP POLICY IF EXISTS "Users can upload their own media" ON storage.objects;
CREATE POLICY "Users can upload their own media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media-assets' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
CREATE POLICY "Users can update their own media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media-assets' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;
CREATE POLICY "Users can delete their own media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media-assets' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
$$ language 'plpgsql';

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
