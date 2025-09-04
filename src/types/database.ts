export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          company_name?: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
          subscription_tier: 'free' | 'basic' | 'premium' | 'enterprise';
          stripe_customer_id?: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          company_name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
          subscription_tier?: 'free' | 'basic' | 'premium' | 'enterprise';
          stripe_customer_id?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          company_name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
          subscription_tier?: 'free' | 'basic' | 'premium' | 'enterprise';
          stripe_customer_id?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description?: string;
          status: 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
          start_date: string;
          end_date: string;
          budget: number;
          daily_budget?: number;
          target_locations: string[];
          target_demographics?: Record<string, any>;
          created_at: string;
          updated_at: string;
          total_spent: number;
          total_cost: number;
          total_slots: number;
          impressions: number;
          clicks: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          status?: 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
          start_date: string;
          end_date: string;
          budget: number;
          daily_budget?: number;
          target_locations: string[];
          target_demographics?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          total_spent?: number;
          total_cost?: number;
          total_slots?: number;
          impressions?: number;
          clicks?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          status?: 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
          start_date?: string;
          end_date?: string;
          budget?: number;
          daily_budget?: number;
          target_locations?: string[];
          target_demographics?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          total_spent?: number;
          total_cost?: number;
          total_slots?: number;
          impressions?: number;
          clicks?: number;
        };
      };
      media_assets: {
        Row: {
          id: string;
          user_id: string;
          campaign_id?: string;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: 'image' | 'video';
          mime_type: string;
          dimensions: {
            width: number;
            height: number;
          };
          duration?: number;
          status: 'uploading' | 'processing' | 'approved' | 'rejected' | 'archived';
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
          validation_errors?: string[];
        };
        Insert: {
          id?: string;
          user_id: string;
          campaign_id?: string;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: 'image' | 'video';
          mime_type: string;
          dimensions: {
            width: number;
            height: number;
          };
          duration?: number;
          status?: 'uploading' | 'processing' | 'approved' | 'rejected' | 'archived';
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          validation_errors?: string[];
        };
        Update: {
          id?: string;
          user_id?: string;
          campaign_id?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          file_type?: 'image' | 'video';
          mime_type?: string;
          dimensions?: {
            width: number;
            height: number;
          };
          duration?: number;
          status?: 'uploading' | 'processing' | 'approved' | 'rejected' | 'archived';
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          validation_errors?: string[];
        };
      };
      campaign_media: {
        Row: {
          id: string;
          campaign_id: string;
          media_id: string;
          display_order: number;
          weight: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          media_id: string;
          display_order: number;
          weight: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          media_id?: string;
          display_order?: number;
          weight?: number;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          campaign_id?: string;
          amount: number;
          currency: string;
          status: 'pending' | 'paid' | 'overdue' | 'cancelled';
          due_date: string;
          paid_date?: string;
          stripe_invoice_id?: string;
          description: string;
          items: Array<{
            description: string;
            quantity: number;
            unit_price: number;
            total: number;
          }>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          campaign_id?: string;
          amount: number;
          currency?: string;
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
          due_date: string;
          paid_date?: string;
          stripe_invoice_id?: string;
          description: string;
          items: Array<{
            description: string;
            quantity: number;
            unit_price: number;
            total: number;
          }>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          campaign_id?: string;
          amount?: number;
          currency?: string;
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
          due_date?: string;
          paid_date?: string;
          stripe_invoice_id?: string;
          description?: string;
          items?: Array<{
            description: string;
            quantity: number;
            unit_price: number;
            total: number;
          }>;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          stripe_payment_method_id: string;
          type: 'card' | 'bank_account';
          last4?: string;
          brand?: string;
          expiry_month?: number;
          expiry_year?: number;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_payment_method_id: string;
          type: 'card' | 'bank_account';
          last4?: string;
          brand?: string;
          expiry_month?: number;
          expiry_year?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_payment_method_id?: string;
          type?: 'card' | 'bank_account';
          last4?: string;
          brand?: string;
          expiry_month?: number;
          expiry_year?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      coupon_codes: {
        Row: {
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
        };
        Insert: {
          id?: string;
          code: string;
          type: 'percentage' | 'fixed' | 'free';
          value: number;
          max_uses: number;
          current_uses?: number;
          min_amount?: number;
          valid_from: string;
          valid_until: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          type?: 'percentage' | 'fixed' | 'free';
          value?: number;
          max_uses?: number;
          current_uses?: number;
          min_amount?: number;
          valid_from?: string;
          valid_until?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      coupon_usage: {
        Row: {
          id: string;
          coupon_id: string;
          user_id: string;
          campaign_id?: string;
          discount_amount: number;
          used_at: string;
        };
        Insert: {
          id?: string;
          coupon_id: string;
          user_id: string;
          campaign_id?: string;
          discount_amount: number;
          used_at?: string;
        };
        Update: {
          id?: string;
          coupon_id?: string;
          user_id?: string;
          campaign_id?: string;
          discount_amount?: number;
          used_at?: string;
        };
      };
      creative_services: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: 'image' | 'video' | 'design' | 'copywriting';
          price: number;
          currency: string;
          delivery_time: number;
          features: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category: 'image' | 'video' | 'design' | 'copywriting';
          price: number;
          currency?: string;
          delivery_time: number;
          features: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: 'image' | 'video' | 'design' | 'copywriting';
          price?: number;
          currency?: string;
          delivery_time?: number;
          features?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_orders: {
        Row: {
          id: string;
          user_id: string;
          service_id: string;
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          requirements: Record<string, any>;
          final_delivery?: string;
          total_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_id: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          requirements: Record<string, any>;
          final_delivery?: string;
          total_amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_id?: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          requirements?: Record<string, any>;
          final_delivery?: string;
          total_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          campaign_id: string;
          media_id: string;
          event_type: 'impression' | 'click' | 'play' | 'complete';
          location: string;
          device_info: Record<string, any>;
          timestamp: string;
          user_agent?: string;
          ip_address?: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          media_id: string;
          event_type: 'impression' | 'click' | 'play' | 'complete';
          location: string;
          device_info: Record<string, any>;
          timestamp?: string;
          user_agent?: string;
          ip_address?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          media_id?: string;
          event_type?: 'impression' | 'click' | 'play' | 'complete';
          location?: string;
          device_info?: Record<string, any>;
          timestamp?: string;
          user_agent?: string;
          ip_address?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Common types
export type Profile = Tables<'profiles'>;
export type Campaign = Tables<'campaigns'>;
export type MediaAsset = Tables<'media_assets'>;
export type CampaignMedia = Tables<'campaign_media'>;
export type Invoice = Tables<'invoices'>;
export type PaymentMethod = Tables<'payment_methods'>;
export type CouponCode = Tables<'coupon_codes'>;
export type CouponUsage = Tables<'coupon_usage'>;
export type CreativeService = Tables<'creative_services'>;
export type ServiceOrder = Tables<'service_orders'>;
export type AnalyticsEvent = Tables<'analytics_events'>;
