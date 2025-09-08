-- Admin Portal Database Schema Enhancements
-- This migration adds admin-specific tables and functionality

-- Create marketing_tools table for announcement bars, popups, etc.
CREATE TABLE IF NOT EXISTS marketing_tools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('announcement_bar', 'popup', 'testimonial', 'sales_notification')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  target_audience JSONB DEFAULT '{}', -- role, subscription_tier, etc.
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create testimonials table for testimonials slider
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_company TEXT,
  client_avatar_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system_integrations table for tracking integration status
CREATE TABLE IF NOT EXISTS system_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('stripe', 'stripe_connect', 'gmail', 'google_drive', 'google_oauth')),
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'pending')),
  config JSONB DEFAULT '{}',
  last_sync TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create asset_lifecycle table for Google Drive asset management
CREATE TABLE IF NOT EXISTS asset_lifecycle (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  media_asset_id UUID REFERENCES media_assets(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  google_drive_folder TEXT, -- 'active' or 'archive'
  google_drive_file_id TEXT,
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  restored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_audit_log table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email_templates table for Gmail API auto-responses
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ad_approval', 'ad_rejection', 'campaign_approved', 'campaign_rejected', 'welcome', 'payment_confirmation')),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables JSONB DEFAULT '{}', -- Available template variables
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email_queue table for managing Gmail API sends
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create coupon_scopes table for detailed coupon scoping
CREATE TABLE IF NOT EXISTS coupon_scopes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coupon_id UUID REFERENCES coupon_codes(id) ON DELETE CASCADE NOT NULL,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('role', 'kiosk', 'product', 'subscription_tier')),
  scope_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system_settings table for platform configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketing_tools_type ON marketing_tools(type);
CREATE INDEX IF NOT EXISTS idx_marketing_tools_active ON marketing_tools(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_system_integrations_type ON system_integrations(type);
CREATE INDEX IF NOT EXISTS idx_system_integrations_status ON system_integrations(status);
CREATE INDEX IF NOT EXISTS idx_asset_lifecycle_status ON asset_lifecycle(status);
CREATE INDEX IF NOT EXISTS idx_asset_lifecycle_media_asset_id ON asset_lifecycle(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(type);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_coupon_scopes_coupon_id ON coupon_scopes(coupon_id);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- Insert default email templates
INSERT INTO email_templates (name, type, subject, body_html, body_text, variables) VALUES
(
  'Ad Approval',
  'ad_approval',
  'Your Ad Has Been Approved - {{campaign_name}}',
  '<h2>Great News!</h2><p>Your ad for campaign "{{campaign_name}}" has been approved and is now live.</p><p>Campaign Details:</p><ul><li>Start Date: {{start_date}}</li><li>End Date: {{end_date}}</li><li>Budget: ${{budget}}</li></ul><p>You can view your campaign performance in your dashboard.</p><p>Best regards,<br>The ezkioskads.com Team</p>',
  'Great News! Your ad for campaign "{{campaign_name}}" has been approved and is now live. Campaign Details: Start Date: {{start_date}}, End Date: {{end_date}}, Budget: ${{budget}}. You can view your campaign performance in your dashboard. Best regards, The ezkioskads.com Team',
  '{"campaign_name": "string", "start_date": "date", "end_date": "date", "budget": "number"}'
),
(
  'Ad Rejection',
  'ad_rejection',
  'Ad Review Update - {{campaign_name}}',
  '<h2>Ad Review Update</h2><p>We''ve reviewed your ad for campaign "{{campaign_name}}" and unfortunately it doesn''t meet our guidelines.</p><p><strong>Reason for rejection:</strong> {{rejection_reason}}</p><p>Please review our advertising guidelines and submit a new version. We''re here to help if you have any questions.</p><p>Best regards,<br>The ezkioskads.com Team</p>',
  'Ad Review Update: We''ve reviewed your ad for campaign "{{campaign_name}}" and unfortunately it doesn''t meet our guidelines. Reason for rejection: {{rejection_reason}}. Please review our advertising guidelines and submit a new version. We''re here to help if you have any questions. Best regards, The ezkioskads.com Team',
  '{"campaign_name": "string", "rejection_reason": "string"}'
);

-- Insert default system settings (with conflict handling)
INSERT INTO system_settings (key, value, description, category) VALUES
('asset_archive_days', '90', 'Number of days before assets are moved to archive', 'asset_lifecycle'),
('asset_delete_days', '90', 'Number of days before archived assets are deleted', 'asset_lifecycle'),
('auto_email_responses', 'true', 'Enable automatic email responses for ad reviews', 'notifications'),
('platform_maintenance_mode', 'false', 'Enable maintenance mode for the platform', 'system'),
('max_file_size_mb', '500', 'Maximum file size for video uploads in MB', 'uploads'),
('allowed_file_types', '["image/jpeg", "image/png", "video/mp4"]', 'Allowed file types for uploads', 'uploads')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  updated_at = CURRENT_TIMESTAMP;

-- Create function to automatically move expired assets to archive
CREATE OR REPLACE FUNCTION archive_expired_assets()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Move assets from active campaigns that have ended to archive
  UPDATE asset_lifecycle 
  SET status = 'archived', 
      google_drive_folder = 'archive',
      archived_at = NOW()
  WHERE status = 'active' 
    AND campaign_id IN (
      SELECT id FROM campaigns 
      WHERE end_date < CURRENT_DATE 
        AND status IN ('completed', 'paused')
    );
END;
$$;

-- Create function to delete old archived assets
CREATE OR REPLACE FUNCTION delete_old_archived_assets()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  delete_days INTEGER;
BEGIN
  -- Get the delete days setting
  SELECT (value->>'delete_days')::INTEGER INTO delete_days
  FROM system_settings 
  WHERE key = 'asset_delete_days';
  
  -- Default to 90 days if setting not found
  IF delete_days IS NULL THEN
    delete_days := 90;
  END IF;
  
  -- Delete assets that have been archived for more than the specified days
  UPDATE asset_lifecycle 
  SET status = 'deleted', 
      deleted_at = NOW()
  WHERE status = 'archived' 
    AND archived_at < NOW() - INTERVAL '1 day' * delete_days;
END;
$$;

-- Create trigger to automatically create asset lifecycle entries
CREATE OR REPLACE FUNCTION create_asset_lifecycle_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only create lifecycle entry for approved assets
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO asset_lifecycle (media_asset_id, campaign_id, status, google_drive_folder)
    VALUES (NEW.id, NEW.campaign_id, 'active', 'active');
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_create_asset_lifecycle ON media_assets;
CREATE TRIGGER trigger_create_asset_lifecycle
  AFTER UPDATE ON media_assets
  FOR EACH ROW
  EXECUTE FUNCTION create_asset_lifecycle_entry();

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO admin_audit_log (admin_id, action, resource_type, resource_id, details, ip_address, user_agent)
  VALUES (p_admin_id, p_action, p_resource_type, p_resource_id, p_details, p_ip_address, p_user_agent);
END;
$$;
