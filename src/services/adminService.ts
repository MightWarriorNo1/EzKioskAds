import { supabase } from '../lib/supabaseClient';

// Types for admin operations
export interface AdminMetrics {
  totalUsers: number;
  activeKiosks: number;
  pendingReviews: number;
  platformRevenue: number;
  totalCampaigns: number;
  totalAds: number;
  recentSignups: number;
  monthlyGrowth: number;
}

export interface AdReviewItem {
  id: string;
  user_id: string;
  campaign_id: string;
  file_name: string;
  file_path: string;
  file_type: 'image' | 'video';
  status: 'uploading' | 'processing' | 'approved' | 'rejected' | 'archived';
  created_at: string;
  updated_at: string;
  validation_errors: string[];
  user: {
    id: string;
    full_name: string;
    email: string;
    company_name?: string;
  };
  campaign: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    budget: number;
  };
}

export interface CreativeOrder {
  id: string;
  user_id: string;
  service_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  requirements: any;
  final_delivery?: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    company_name?: string;
  };
  service: {
    id: string;
    name: string;
    category: string;
    price: number;
    delivery_time: number;
  };
}

export interface CouponWithScopes {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free';
  value: number;
  max_uses: number;
  current_uses: number;
  min_amount?: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  scopes: Array<{
    id: string;
    scope_type: 'role' | 'kiosk' | 'product' | 'subscription_tier';
    scope_value: string;
  }>;
}

export interface MarketingTool {
  id: string;
  type: 'announcement_bar' | 'popup' | 'testimonial' | 'sales_notification';
  title: string;
  content: string;
  settings: any;
  is_active: boolean;
  priority: number;
  target_audience: any;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_company?: string;
  client_avatar_url?: string;
  content: string;
  rating?: number;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemIntegration {
  id: string;
  name: string;
  type: 'stripe' | 'stripe_connect' | 'gmail' | 'google_drive' | 'google_oauth';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  config: any;
  last_sync?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetLifecycleItem {
  id: string;
  media_asset_id: string;
  campaign_id?: string;
  status: 'active' | 'archived' | 'deleted';
  google_drive_folder?: string;
  google_drive_file_id?: string;
  archived_at?: string;
  deleted_at?: string;
  restored_at?: string;
  created_at: string;
  updated_at: string;
  media_asset: {
    id: string;
    file_name: string;
    file_type: 'image' | 'video';
    user_id: string;
  };
  campaign?: {
    id: string;
    name: string;
    end_date: string;
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: 'ad_approval' | 'ad_rejection' | 'campaign_approved' | 'campaign_rejected' | 'welcome' | 'payment_confirmation';
  subject: string;
  body_html: string;
  body_text?: string;
  variables: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  category: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export class AdminService {
  // Get admin dashboard metrics
  static async getDashboardMetrics(): Promise<AdminMetrics> {
    try {
      const [
        { count: totalUsers },
        { count: activeKiosks },
        { count: pendingReviews },
        { count: totalCampaigns },
        { count: totalAds },
        { count: recentSignups }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('kiosks').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('media_assets').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
        supabase.from('campaigns').select('*', { count: 'exact', head: true }),
        supabase.from('media_assets').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Get platform revenue from invoices
      const { data: revenueData } = await supabase
        .from('invoices')
        .select('amount')
        .eq('status', 'paid');

      const platformRevenue = revenueData?.reduce((sum, invoice) => sum + Number(invoice.amount), 0) || 0;

      // Calculate monthly growth (simplified)
      const { count: lastMonthUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
        .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const monthlyGrowth = lastMonthUsers ? ((recentSignups || 0) - lastMonthUsers) / lastMonthUsers * 100 : 0;

      return {
        totalUsers: totalUsers || 0,
        activeKiosks: activeKiosks || 0,
        pendingReviews: pendingReviews || 0,
        platformRevenue,
        totalCampaigns: totalCampaigns || 0,
        totalAds: totalAds || 0,
        recentSignups: recentSignups || 0,
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100
      };
    } catch (error) {
      console.error('Error fetching admin metrics:', error);
      throw error;
    }
  }

  // Get ad review queue
  static async getAdReviewQueue(): Promise<AdReviewItem[]> {
    try {
      const { data, error } = await supabase
        .from('media_assets')
        .select(`
          *,
          user:profiles!media_assets_user_id_fkey(id, full_name, email, company_name),
          campaign:campaigns!media_assets_campaign_id_fkey(id, name, start_date, end_date, budget)
        `)
        .in('status', ['processing', 'uploading'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching ad review queue:', error);
      throw error;
    }
  }

  // Approve or reject ad
  static async reviewAd(mediaAssetId: string, action: 'approve' | 'reject', rejectionReason?: string): Promise<void> {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      
      const { error } = await supabase
        .from('media_assets')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(action === 'reject' && rejectionReason ? { validation_errors: [rejectionReason] } : {})
        })
        .eq('id', mediaAssetId);

      if (error) throw error;

      // Log admin action
      await this.logAdminAction('review_ad', 'media_asset', mediaAssetId, {
        action,
        rejection_reason: rejectionReason
      });

      // Send email notification
      if (action === 'approve') {
        await this.sendAdApprovalEmail(mediaAssetId);
      } else {
        await this.sendAdRejectionEmail(mediaAssetId, rejectionReason);
      }
    } catch (error) {
      console.error('Error reviewing ad:', error);
      throw error;
    }
  }

  // Get creative orders
  static async getCreativeOrders(): Promise<CreativeOrder[]> {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          user:profiles!service_orders_user_id_fkey(id, full_name, email, company_name),
          service:creative_services!service_orders_service_id_fkey(id, name, category, price, delivery_time)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching creative orders:', error);
      throw error;
    }
  }

  // Update creative order status
  static async updateCreativeOrderStatus(orderId: string, status: string, finalDelivery?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ 
          status,
          final_delivery: finalDelivery,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      await this.logAdminAction('update_creative_order', 'service_order', orderId, {
        status,
        final_delivery: finalDelivery
      });
    } catch (error) {
      console.error('Error updating creative order:', error);
      throw error;
    }
  }

  // Get coupons with scopes
  static async getCoupons(): Promise<CouponWithScopes[]> {
    try {
      const { data: coupons, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get scopes for each coupon
      const couponsWithScopes = await Promise.all(
        (coupons || []).map(async (coupon) => {
          const { data: scopes } = await supabase
            .from('coupon_scopes')
            .select('*')
            .eq('coupon_id', coupon.id);

          return {
            ...coupon,
            scopes: scopes || []
          };
        })
      );

      return couponsWithScopes;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  }

  // Create coupon
  static async createCoupon(couponData: any): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('coupon_codes')
        .insert(couponData)
        .select('id')
        .single();

      if (error) throw error;

      await this.logAdminAction('create_coupon', 'coupon_code', data.id, couponData);
      return data.id;
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  }

  // Update coupon
  static async updateCoupon(couponId: string, updates: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('coupon_codes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', couponId);

      if (error) throw error;

      await this.logAdminAction('update_coupon', 'coupon_code', couponId, updates);
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  }

  // Get marketing tools
  static async getMarketingTools(): Promise<MarketingTool[]> {
    try {
      const { data, error } = await supabase
        .from('marketing_tools')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching marketing tools:', error);
      throw error;
    }
  }

  // Create marketing tool
  static async createMarketingTool(toolData: any): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('marketing_tools')
        .insert(toolData)
        .select('id')
        .single();

      if (error) throw error;

      await this.logAdminAction('create_marketing_tool', 'marketing_tool', data.id, toolData);
      return data.id;
    } catch (error) {
      console.error('Error creating marketing tool:', error);
      throw error;
    }
  }

  // Get testimonials
  static async getTestimonials(): Promise<Testimonial[]> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  }

  // Create testimonial
  static async createTestimonial(testimonialData: any): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert(testimonialData)
        .select('id')
        .single();

      if (error) throw error;

      await this.logAdminAction('create_testimonial', 'testimonial', data.id, testimonialData);
      return data.id;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  }

  // Get system integrations
  static async getSystemIntegrations(): Promise<SystemIntegration[]> {
    try {
      const { data, error } = await supabase
        .from('system_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching system integrations:', error);
      throw error;
    }
  }

  // Update integration status
  static async updateIntegrationStatus(integrationId: string, status: string, config?: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_integrations')
        .update({ 
          status,
          config: config || {},
          last_sync: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', integrationId);

      if (error) throw error;

      await this.logAdminAction('update_integration', 'system_integration', integrationId, {
        status,
        config
      });
    } catch (error) {
      console.error('Error updating integration:', error);
      throw error;
    }
  }

  // Get asset lifecycle items
  static async getAssetLifecycle(): Promise<AssetLifecycleItem[]> {
    try {
      const { data, error } = await supabase
        .from('asset_lifecycle')
        .select(`
          *,
          media_asset:media_assets!asset_lifecycle_media_asset_id_fkey(id, file_name, file_type, user_id),
          campaign:campaigns!asset_lifecycle_campaign_id_fkey(id, name, end_date)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching asset lifecycle:', error);
      throw error;
    }
  }

  // Restore archived asset
  static async restoreAsset(assetId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('asset_lifecycle')
        .update({ 
          status: 'active',
          google_drive_folder: 'active',
          restored_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assetId);

      if (error) throw error;

      await this.logAdminAction('restore_asset', 'asset_lifecycle', assetId);
    } catch (error) {
      console.error('Error restoring asset:', error);
      throw error;
    }
  }

  // Get email templates
  static async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('type', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching email templates:', error);
      throw error;
    }
  }

  // Get system settings
  static async getSystemSettings(): Promise<SystemSetting[]> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  }

  // Update system setting
  static async updateSystemSetting(key: string, value: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          value,
          updated_at: new Date().toISOString()
        })
        .eq('key', key);

      if (error) throw error;

      await this.logAdminAction('update_system_setting', 'system_setting', null, {
        key,
        value
      });
    } catch (error) {
      console.error('Error updating system setting:', error);
      throw error;
    }
  }

  // Export users to CSV
  static async exportUsers(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const csvHeaders = 'ID,Email,Full Name,Role,Company,Subscription Tier,Created At\n';
      const csvRows = (data || []).map(user => 
        `${user.id},${user.email},${user.full_name},${user.role},${user.company_name || ''},${user.subscription_tier},${user.created_at}`
      ).join('\n');

      return csvHeaders + csvRows;
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  }

  // Export kiosks to CSV
  static async exportKiosks(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('kiosks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const csvHeaders = 'ID,Name,Location,Address,City,State,Traffic Level,Base Rate,Price,Status,Created At\n';
      const csvRows = (data || []).map(kiosk => 
        `${kiosk.id},${kiosk.name},${kiosk.location},${kiosk.address},${kiosk.city},${kiosk.state},${kiosk.traffic_level},${kiosk.base_rate},${kiosk.price},${kiosk.status},${kiosk.created_at}`
      ).join('\n');

      return csvHeaders + csvRows;
    } catch (error) {
      console.error('Error exporting kiosks:', error);
      throw error;
    }
  }

  // Import users from CSV
  static async importUsers(csvData: string): Promise<{ success: number; errors: string[] }> {
    try {
      const lines = csvData.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      const errors: string[] = [];
      let success = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Invalid number of columns`);
          continue;
        }

        const userData = {
          email: values[0],
          full_name: values[1],
          role: values[2] || 'client',
          company_name: values[3] || null,
          subscription_tier: values[4] || 'free'
        };

        try {
          const { error } = await supabase
            .from('profiles')
            .insert(userData);

          if (error) {
            errors.push(`Row ${i + 1}: ${error.message}`);
          } else {
            success++;
          }
        } catch (err) {
          errors.push(`Row ${i + 1}: ${err}`);
        }
      }

      await this.logAdminAction('import_users', 'profiles', null, {
        success_count: success,
        error_count: errors.length
      });

      return { success, errors };
    } catch (error) {
      console.error('Error importing users:', error);
      throw error;
    }
  }

  // Log admin action
  static async logAdminAction(
    action: string,
    resourceType: string,
    resourceId: string | null,
    details: any = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('admin_audit_log')
        .insert({
          admin_id: user.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
          ip_address: ipAddress,
          user_agent: userAgent
        });

      if (error) {
        console.error('Error logging admin action:', error);
      }
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  // Send ad approval email
  private static async sendAdApprovalEmail(mediaAssetId: string): Promise<void> {
    try {
      // Get media asset and campaign details
      const { data: mediaAsset } = await supabase
        .from('media_assets')
        .select(`
          *,
          user:profiles!media_assets_user_id_fkey(id, full_name, email),
          campaign:campaigns!media_assets_campaign_id_fkey(id, name, start_date, end_date, budget)
        `)
        .eq('id', mediaAssetId)
        .single();

      if (!mediaAsset) return;

      // Get email template
      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', 'ad_approval')
        .eq('is_active', true)
        .single();

      if (!template) return;

      // Queue email
      await supabase
        .from('email_queue')
        .insert({
          template_id: template.id,
          recipient_email: mediaAsset.user.email,
          recipient_name: mediaAsset.user.full_name,
          subject: template.subject.replace('{{campaign_name}}', mediaAsset.campaign.name),
          body_html: template.body_html
            .replace('{{campaign_name}}', mediaAsset.campaign.name)
            .replace('{{start_date}}', new Date(mediaAsset.campaign.start_date).toLocaleDateString())
            .replace('{{end_date}}', new Date(mediaAsset.campaign.end_date).toLocaleDateString())
            .replace('{{budget}}', mediaAsset.campaign.budget.toString()),
          body_text: template.body_text
            ?.replace('{{campaign_name}}', mediaAsset.campaign.name)
            .replace('{{start_date}}', new Date(mediaAsset.campaign.start_date).toLocaleDateString())
            .replace('{{end_date}}', new Date(mediaAsset.campaign.end_date).toLocaleDateString())
            .replace('{{budget}}', mediaAsset.campaign.budget.toString())
        });
    } catch (error) {
      console.error('Error sending ad approval email:', error);
    }
  }

  // Send ad rejection email
  private static async sendAdRejectionEmail(mediaAssetId: string, rejectionReason?: string): Promise<void> {
    try {
      // Get media asset and campaign details
      const { data: mediaAsset } = await supabase
        .from('media_assets')
        .select(`
          *,
          user:profiles!media_assets_user_id_fkey(id, full_name, email),
          campaign:campaigns!media_assets_campaign_id_fkey(id, name)
        `)
        .eq('id', mediaAssetId)
        .single();

      if (!mediaAsset) return;

      // Get email template
      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', 'ad_rejection')
        .eq('is_active', true)
        .single();

      if (!template) return;

      // Queue email
      await supabase
        .from('email_queue')
        .insert({
          template_id: template.id,
          recipient_email: mediaAsset.user.email,
          recipient_name: mediaAsset.user.full_name,
          subject: template.subject.replace('{{campaign_name}}', mediaAsset.campaign.name),
          body_html: template.body_html
            .replace('{{campaign_name}}', mediaAsset.campaign.name)
            .replace('{{rejection_reason}}', rejectionReason || 'Content does not meet our guidelines'),
          body_text: template.body_text
            ?.replace('{{campaign_name}}', mediaAsset.campaign.name)
            .replace('{{rejection_reason}}', rejectionReason || 'Content does not meet our guidelines')
        });
    } catch (error) {
      console.error('Error sending ad rejection email:', error);
    }
  }
}
