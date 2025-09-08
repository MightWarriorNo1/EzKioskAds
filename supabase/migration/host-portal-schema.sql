-- Host Portal Database Schema Enhancements
-- This migration adds host-specific tables and functionality

-- Create host_kiosks table to track which kiosks belong to which hosts
CREATE TABLE IF NOT EXISTS host_kiosks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  kiosk_id UUID REFERENCES kiosks(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  commission_rate DECIMAL(5,2) DEFAULT 70.00, -- Host gets 70% by default
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(host_id, kiosk_id)
);

-- Create host_ads table for ads uploaded by hosts
CREATE TABLE IF NOT EXISTS host_ads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  duration INTEGER DEFAULT 15, -- Duration in seconds
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'active', 'paused')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create host_ad_assignments table for assigning ads to kiosks
CREATE TABLE IF NOT EXISTS host_ad_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ad_id UUID REFERENCES host_ads(id) ON DELETE CASCADE NOT NULL,
  kiosk_id UUID REFERENCES kiosks(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'paused', 'completed')),
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create host_revenue table for tracking host earnings
CREATE TABLE IF NOT EXISTS host_revenue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  kiosk_id UUID REFERENCES kiosks(id) ON DELETE CASCADE NOT NULL,
  ad_assignment_id UUID REFERENCES host_ad_assignments(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0.00,
  commission DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create host_payouts table for tracking payouts
CREATE TABLE IF NOT EXISTS host_payouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payout_method TEXT DEFAULT 'bank_transfer' CHECK (payout_method IN ('bank_transfer', 'stripe_connect')),
  stripe_transfer_id TEXT,
  bank_account_id TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create host_payout_statements table for detailed payout breakdowns
CREATE TABLE IF NOT EXISTS host_payout_statements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  payout_id UUID REFERENCES host_payouts(id) ON DELETE CASCADE NOT NULL,
  kiosk_id UUID REFERENCES kiosks(id) ON DELETE CASCADE NOT NULL,
  ad_assignment_id UUID REFERENCES host_ad_assignments(id) ON DELETE CASCADE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0.00,
  commission_rate DECIMAL(5,2) DEFAULT 70.00,
  commission_amount DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create host_notifications table for host-specific notifications
CREATE TABLE IF NOT EXISTS host_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ad_approved', 'ad_rejected', 'payout_processed', 'kiosk_offline', 'revenue_milestone', 'system_alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Stripe Connect fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_connect_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payout_frequency TEXT DEFAULT 'weekly' CHECK (payout_frequency IN ('weekly', 'monthly'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS minimum_payout DECIMAL(10,2) DEFAULT 100.00;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_host_kiosks_host_id ON host_kiosks(host_id);
CREATE INDEX IF NOT EXISTS idx_host_kiosks_kiosk_id ON host_kiosks(kiosk_id);
CREATE INDEX IF NOT EXISTS idx_host_ads_host_id ON host_ads(host_id);
CREATE INDEX IF NOT EXISTS idx_host_ads_status ON host_ads(status);
CREATE INDEX IF NOT EXISTS idx_host_ad_assignments_host_id ON host_ad_assignments(host_id);
CREATE INDEX IF NOT EXISTS idx_host_ad_assignments_kiosk_id ON host_ad_assignments(kiosk_id);
CREATE INDEX IF NOT EXISTS idx_host_ad_assignments_status ON host_ad_assignments(status);
CREATE INDEX IF NOT EXISTS idx_host_revenue_host_id ON host_revenue(host_id);
CREATE INDEX IF NOT EXISTS idx_host_revenue_date ON host_revenue(date);
CREATE INDEX IF NOT EXISTS idx_host_payouts_host_id ON host_payouts(host_id);
CREATE INDEX IF NOT EXISTS idx_host_payouts_status ON host_payouts(status);
CREATE INDEX IF NOT EXISTS idx_host_notifications_host_id ON host_notifications(host_id);
CREATE INDEX IF NOT EXISTS idx_host_notifications_read ON host_notifications(read);

-- Enable RLS on new tables
ALTER TABLE host_kiosks ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_ad_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_payout_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for host_kiosks
CREATE POLICY "Hosts can view their own kiosks" ON host_kiosks
  FOR SELECT USING (host_id = auth.uid());

CREATE POLICY "Admins can view all host kiosks" ON host_kiosks
  FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for host_ads
CREATE POLICY "Hosts can manage their own ads" ON host_ads
  FOR ALL USING (host_id = auth.uid());

CREATE POLICY "Admins can view all host ads" ON host_ads
  FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for host_ad_assignments
CREATE POLICY "Hosts can manage their own ad assignments" ON host_ad_assignments
  FOR ALL USING (host_id = auth.uid());

CREATE POLICY "Admins can view all ad assignments" ON host_ad_assignments
  FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for host_revenue
CREATE POLICY "Hosts can view their own revenue" ON host_revenue
  FOR SELECT USING (host_id = auth.uid());

CREATE POLICY "Admins can view all revenue" ON host_revenue
  FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for host_payouts
CREATE POLICY "Hosts can view their own payouts" ON host_payouts
  FOR SELECT USING (host_id = auth.uid());

CREATE POLICY "Admins can manage all payouts" ON host_payouts
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for host_payout_statements
CREATE POLICY "Hosts can view their own payout statements" ON host_payout_statements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM host_payouts 
      WHERE host_payouts.id = host_payout_statements.payout_id 
      AND host_payouts.host_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payout statements" ON host_payout_statements
  FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for host_notifications
CREATE POLICY "Hosts can manage their own notifications" ON host_notifications
  FOR ALL USING (host_id = auth.uid());

-- Create functions for host revenue calculations
CREATE OR REPLACE FUNCTION calculate_host_revenue(
  p_host_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  total_revenue DECIMAL(10,2),
  total_commission DECIMAL(10,2),
  total_impressions BIGINT,
  total_clicks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(hr.revenue), 0) as total_revenue,
    COALESCE(SUM(hr.commission), 0) as total_commission,
    COALESCE(SUM(hr.impressions), 0) as total_impressions,
    COALESCE(SUM(hr.clicks), 0) as total_clicks
  FROM host_revenue hr
  WHERE hr.host_id = p_host_id
    AND hr.date >= p_start_date
    AND hr.date <= p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get host kiosk statistics
CREATE OR REPLACE FUNCTION get_host_kiosk_stats(p_host_id UUID)
RETURNS TABLE (
  total_kiosks BIGINT,
  active_kiosks BIGINT,
  total_impressions BIGINT,
  total_revenue DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(hk.id) as total_kiosks,
    COUNT(CASE WHEN hk.status = 'active' THEN 1 END) as active_kiosks,
    COALESCE(SUM(hr.impressions), 0) as total_impressions,
    COALESCE(SUM(hr.revenue), 0) as total_revenue
  FROM host_kiosks hk
  LEFT JOIN host_revenue hr ON hr.kiosk_id = hk.kiosk_id
  WHERE hk.host_id = p_host_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_host_kiosks_updated_at BEFORE UPDATE ON host_kiosks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_host_ads_updated_at BEFORE UPDATE ON host_ads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_host_ad_assignments_updated_at BEFORE UPDATE ON host_ad_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_host_revenue_updated_at BEFORE UPDATE ON host_revenue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_host_payouts_updated_at BEFORE UPDATE ON host_payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample host kiosk assignments (for testing)
INSERT INTO host_kiosks (host_id, kiosk_id, commission_rate, status)
SELECT 
  p.id as host_id,
  k.id as kiosk_id,
  70.00 as commission_rate,
  'active' as status
FROM profiles p
CROSS JOIN kiosks k
WHERE p.role = 'host'
  AND k.id IN (
    'a1b2c3d4-e5f6-4789-abcd-ef1234567890',
    'b2c3d4e5-f6a7-4801-bcde-f23456789012'
  )
ON CONFLICT (host_id, kiosk_id) DO NOTHING;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION calculate_host_revenue(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_host_kiosk_stats(UUID) TO authenticated;

