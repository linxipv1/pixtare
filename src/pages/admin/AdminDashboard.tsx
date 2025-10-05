import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, CreditCard, MessageSquare, FileText, TrendingUp, Activity } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { AdminService, DashboardStats } from '../../lib/admin';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const { admin } = useAdmin();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    creditsUsedThisMonth: 0,
    unreadMessages: 0,
    totalCreditsDistributed: 0,
    totalGenerations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardStats();
    setupRealTimeSubscriptions();
    
    // Fallback: reload data every 30 seconds if real-time fails
    const fallbackInterval = setInterval(() => {
      if (!isRealTimeConnected) {
        console.log('Real-time disconnected, fetching dashboard stats...');
        fetchDashboardStats();
      }
    }, 30000);

    return () => {
      clearInterval(fallbackInterval);
      supabase.removeAllChannels();
    };
  }, []);

  const setupRealTimeSubscriptions = () => {
    console.log('Setting up dashboard real-time subscriptions...');
    
    // Subscribe to all relevant table changes
    const dashboardChannel = supabase
      .channel('admin-dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile change detected in dashboard:', payload);
          handleUserChange(payload);
          updateStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          console.log('User credits change detected in dashboard:', payload);
          updateStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credit_transactions'
        },
        (payload) => {
          console.log('Credit transaction detected in dashboard:', payload);
          updateStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generations'
        },
        (payload) => {
          console.log('Generation change detected in dashboard:', payload);
          handleGenerationChange(payload);
          updateStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_messages'
        },
        (payload) => {
          console.log('Contact message change detected in dashboard:', payload);
          handleMessageChange(payload);
          updateStats();
        }
      )
      .subscribe((status) => {
        console.log('Dashboard real-time subscription status:', status);
        setIsRealTimeConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          console.log('Dashboard real-time updates connected');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Dashboard real-time connection failed');
          setIsRealTimeConnected(false);
        }
      });
  };

  const handleUserChange = (payload: any) => {
    const { eventType, new: newRecord } = payload;
    
    if (eventType === 'INSERT') {
      // Add to recent activities
      const newActivity = {
        id: Date.now(),
        type: 'user_registered',
        title: 'Yeni kullanıcı kaydı',
        description: `${newRecord.email} platformumuza katıldı`,
        time: 'Şimdi',
        icon: 'user'
      };
      
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 4)]);
      toast.success(`Yeni kullanıcı: ${newRecord.email}`);
    }
  };

  const handleGenerationChange = (payload: any) => {
    const { eventType, new: newRecord } = payload;
    
    if (eventType === 'INSERT') {
      const activityType = newRecord.type === 'image' ? 'image_generated' : 'video_generated';
      const title = newRecord.type === 'image' ? 'Fotoğraf üretimi' : 'Video üretimi';
      
      const newActivity = {
        id: Date.now(),
        type: activityType,
        title: title,
        description: `${newRecord.credits_used} kredi kullanıldı`,
        time: 'Şimdi',
        icon: newRecord.type
      };
      
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    } else if (eventType === 'UPDATE' && newRecord.status === 'completed') {
      const title = newRecord.type === 'image' ? 'Fotoğraf tamamlandı' : 'Video tamamlandı';
      
      const newActivity = {
        id: Date.now(),
        type: 'generation_completed',
        title: title,
        description: `${newRecord.outputs?.length || 0} çıktı oluşturuldu`,
        time: 'Şimdi',
        icon: 'check'
      };
      
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    }
  };

  const handleMessageChange = (payload: any) => {
    const { eventType, new: newRecord } = payload;
    
    if (eventType === 'INSERT') {
      const newActivity = {
        id: Date.now(),
        type: 'message_received',
        title: 'Yeni mesaj',
        description: `${newRecord.name} tarafından gönderildi`,
        time: 'Şimdi',
        icon: 'message'
      };
      
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 4)]);
      toast.info(`Yeni mesaj: ${newRecord.name}`);
    }
  };

  const updateStats = async () => {
    try {
      const dashboardStats = await AdminService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error updating dashboard stats:', error);
    }
  };
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await AdminService.getDashboardStats();
      setStats(dashboardStats);
      
      // Initialize recent activities
      setRecentActivities([
        {
          id: 1,
          type: 'system',
          title: 'Sistem başlatıldı',
          description: 'Admin paneli aktif',
          time: 'Şimdi',
          icon: 'system'
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'image_generated':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case 'video_generated':
        return <div className="w-2 h-2 bg-purple-500 rounded-full"></div>;
      case 'generation_completed':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'message_received':
        return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };
  const statCards = [
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="h-6 w-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Aktif Kullanıcı',
      value: stats.activeUsers.toLocaleString(),
      icon: <Activity className="h-6 w-6 text-green-600" />,
      bgColor: 'bg-green-50',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Bu Ay Kullanılan Kredi',
      value: stats.creditsUsedThisMonth.toLocaleString(),
      icon: <CreditCard className="h-6 w-6 text-purple-600" />,
      bgColor: 'bg-purple-50',
      change: '+25%',
      changeType: 'positive' as const,
    },
    {
      title: 'Toplam Üretim',
      value: stats.totalGenerations.toLocaleString(),
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
      bgColor: 'bg-orange-50',
      change: '+18%',
      changeType: 'positive' as const,
    },
    {
      title: 'Dağıtılan Kredi',
      value: stats.totalCreditsDistributed.toLocaleString(),
      icon: <FileText className="h-6 w-6 text-indigo-600" />,
      bgColor: 'bg-indigo-50',
      change: '+15%',
      changeType: 'positive' as const,
    },
    {
      title: 'Bekleyen Mesaj',
      value: stats.unreadMessages.toLocaleString(),
      icon: <MessageSquare className="h-6 w-6 text-red-600" />,
      bgColor: 'bg-red-50',
      change: '0',
      changeType: 'neutral' as const,
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Site yönetimi ve istatistikler</p>
          <div className="flex items-center space-x-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${isRealTimeConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isRealTimeConnected ? 'Real-time connected' : 'Real-time disconnected'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    {stat.icon}
                  </div>
                  <Badge 
                    variant={stat.changeType === 'positive' ? 'success' : 'secondary'}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Son Aktiviteler (Real-time)
            </h3>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">Henüz aktivite yok</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hızlı İşlemler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/admin/users" className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors block">
                <Users className="h-6 w-6 text-blue-600 mb-2" />
                <p className="font-medium text-gray-900">Kullanıcı Yönetimi</p>
                <p className="text-sm text-gray-600">Kullanıcıları görüntüle</p>
              </Link>
              <Link to="/admin/credits" className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors block">
                <CreditCard className="h-6 w-6 text-green-600 mb-2" />
                <p className="font-medium text-gray-900">Kredi Yönetimi</p>
                <p className="text-sm text-gray-600">Kredileri düzenle</p>
              </Link>
              <Link to="/admin/messages" className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors block">
                <MessageSquare className="h-6 w-6 text-purple-600 mb-2" />
                <p className="font-medium text-gray-900">Mesajlar</p>
                <p className="text-sm text-gray-600">İletişim mesajları</p>
              </Link>
              <Link to="/admin/content" className="p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors block">
                <FileText className="h-6 w-6 text-orange-600 mb-2" />
                <p className="font-medium text-gray-900">İçerik Yönetimi</p>
                <p className="text-sm text-gray-600">Site içeriğini düzenle</p>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
};