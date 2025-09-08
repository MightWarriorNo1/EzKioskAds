import { supabase } from '../lib/supabaseClient';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

export class NotificationService {
  // Create a notification
  static async createNotification(notificationData: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('host_notifications')
        .insert({
          host_id: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data,
          read: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notifications for a user
  static async getNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
    try {
      let query = supabase
        .from('host_notifications')
        .select('*')
        .eq('host_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('read', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('host_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('host_notifications')
        .update({ read: true })
        .eq('host_id', userId)
        .eq('read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('host_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('host_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Create system notifications for common events
  static async notifyAdApproved(userId: string, adName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'ad_approved',
      title: 'Ad Approved',
      message: `Your ad "${adName}" has been approved and is ready for assignment.`,
      data: { adName }
    });
  }

  static async notifyAdRejected(userId: string, adName: string, reason?: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'ad_rejected',
      title: 'Ad Rejected',
      message: `Your ad "${adName}" was rejected${reason ? `: ${reason}` : '.'}`,
      data: { adName, reason }
    });
  }

  static async notifyPayoutProcessed(userId: string, amount: number, payoutId: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'payout_processed',
      title: 'Payout Processed',
      message: `Your payout of $${amount.toFixed(2)} has been processed successfully.`,
      data: { amount, payoutId }
    });
  }

  static async notifyKioskOffline(userId: string, kioskName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'kiosk_offline',
      title: 'Kiosk Offline',
      message: `Kiosk "${kioskName}" has gone offline and may need attention.`,
      data: { kioskName }
    });
  }

  static async notifyRevenueMilestone(userId: string, milestone: string, amount: number): Promise<void> {
    await this.createNotification({
      userId,
      type: 'revenue_milestone',
      title: 'Revenue Milestone',
      message: `Congratulations! You've reached ${milestone}: $${amount.toFixed(2)}`,
      data: { milestone, amount }
    });
  }

  static async notifySystemAlert(userId: string, title: string, message: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'system_alert',
      title,
      message,
      data: { isSystemAlert: true }
    });
  }
}

