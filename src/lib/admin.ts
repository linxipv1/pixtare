import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  read_by: string | null;
}

export interface SiteContent {
  id: string;
  section: string;
  key: string;
  content_type: string;
  value: string;
  description: string | null;
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  old_values: any;
  new_values: any;
  created_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  creditsUsedThisMonth: number;
  unreadMessages: number;
  totalCreditsDistributed: number;
  totalGenerations: number;
}

export class AdminService {
  // Admin Authentication
  static async adminLogin(email: string, password: string) {
    try {
      // Demo için sabit admin bilgileri
      const ADMIN_EMAIL = 'admin@pixtrate.com';
      const ADMIN_PASSWORD = 'admin123';
      
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        throw new Error('Invalid credentials');
      }

      // Demo admin user objesi oluştur
      const adminUser = {
        id: 'admin-demo-id',
        email: ADMIN_EMAIL,
        full_name: 'Admin User',
        is_active: true,
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      return { data: adminUser, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Dashboard Stats
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Active users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString());

      // Credits used this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { data: creditTransactions } = await supabase
        .from('credit_transactions')
        .select('amount')
        .eq('type', 'usage')
        .gte('created_at', firstDayOfMonth.toISOString());

      const creditsUsedThisMonth = creditTransactions?.reduce(
        (sum, transaction) => sum + Math.abs(transaction.amount), 0
      ) || 0;

      // Unread messages
      const { count: unreadMessages } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      // Total credits distributed
      const { data: allCredits } = await supabase
        .from('users')
        .select('credits_balance');

      const totalCreditsDistributed = allCredits?.reduce(
        (sum, user) => sum + user.credits_balance, 0
      ) || 0;

      // Total generations
      const { count: totalGenerations } = await supabase
        .from('generations')
        .select('*', { count: 'exact', head: true });

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        creditsUsedThisMonth,
        unreadMessages: unreadMessages || 0,
        totalCreditsDistributed,
        totalGenerations: totalGenerations || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Contact Messages
  static async getContactMessages() {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      return [];
    }
  }

  static async markMessageAsRead(messageId: string, adminId: string) {
    const { error } = await supabase
      .from('contact_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        read_by: adminId
      })
      .eq('id', messageId);

    if (error) throw error;

    // Log admin action
    await this.logAdminAction(adminId, 'mark_message_read', 'message', messageId);
  }

  // Site Content
  static async getSiteContent() {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('section', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching site content:', error);
      return [];
    }
  }

  static async updateSiteContent(contentId: string, value: string, adminId: string) {
    // Get old value for logging
    const { data: oldContent } = await supabase
      .from('site_content')
      .select('value')
      .eq('id', contentId)
      .single();

    const { error } = await supabase
      .from('site_content')
      .update({
        value,
        updated_by: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId);

    if (error) throw error;

    // Log admin action
    await this.logAdminAction(
      adminId,
      'update_content',
      'content',
      contentId,
      { value: oldContent?.value },
      { value }
    );
  }

  // Settings Management
  static async getSettings() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('key', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching settings:', error);
      return [];
    }
  }

  static async updateSetting(settingId: string, value: string, adminId: string) {
    try {
      // Get old value for logging
      const { data: oldSetting } = await supabase
        .from('settings')
        .select('value')
        .eq('id', settingId)
        .single();

      const { error } = await supabase
        .from('settings')
        .update({
          value,
          updated_by: adminId,
          updated_at: new Date().toISOString()
        })
        .eq('id', settingId);

      if (error) throw error;

      // Log admin action
      await this.logAdminAction(
        adminId,
        'update_setting',
        'setting',
        settingId,
        { value: oldSetting?.value },
        { value }
      );
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  }

  // User Management
  static async updateUserCredits(userEmail: string, newBalance: number, adminId: string, description: string) {
    // Get current balance
    const { data: user } = await supabase
      .from('users')
      .select('id, credits_balance')
      .eq('email', userEmail)
      .single();

    if (!user) throw new Error('User not found');

    const oldBalance = user.credits_balance;
    const difference = newBalance - oldBalance;

    // Update user credits
    const { error: updateError } = await supabase
      .from('users')
      .update({
        credits_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('email', userEmail);

    if (updateError) throw updateError;

    // Record transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        wallet_id: null,
        user_email: userEmail,
        amount: difference,
        type: difference > 0 ? 'purchase' : 'usage',
        description: `Admin adjustment: ${description}`,
      });

    if (transactionError) throw transactionError;

    // Log admin action
    await this.logAdminAction(
      adminId,
      'update_user_credits',
      'user',
      user.id,
      { balance: oldBalance },
      { balance: newBalance, description }
    );
  }

  // Admin Logging
  static async logAdminAction(
    adminId: string,
    action: string,
    targetType: string,
    targetId?: string,
    oldValues?: any,
    newValues?: any
  ) {
    try {
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: adminId,
          action,
          target_type: targetType,
          target_id: targetId,
          old_values: oldValues,
          new_values: newValues,
        });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  // Get Admin Logs
  static async getAdminLogs(limit = 50) {
    const { data, error } = await supabase
      .from('admin_logs')
      .select(`
        *,
        admin_users!admin_logs_admin_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}