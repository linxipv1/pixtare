import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Video, History, Sparkles, TrendingUp, Clock, Users, User, CreditCard, Receipt, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCredits } from '../../hooks/useCredits';
import { useDashboardStats } from '../../hooks/useContent';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';

export const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const { wallet, loading } = useCredits();
  const { stats: dashboardStats, loading: statsLoading } = useDashboardStats(user?.id);

  const quickActions = [
    {
      title: 'Fotoğraf Oluştur',
      description: 'Ürün fotoğraflarınızı AI ile profesyonel görsellere dönüştürün',
      icon: <Camera className="h-8 w-8 text-blue-600" />,
      href: '/app/generate-image',
      color: 'blue',
      credits: '1 kredi',
      bgGradient: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Video Oluştur',
      description: 'Ürünlerinizin 360° görünümlerini ve animasyonlarını oluşturun',
      icon: <Video className="h-8 w-8 text-purple-600" />,
      href: '/app/generate-video',
      color: 'purple',
      credits: '8 kredi',
      bgGradient: 'from-purple-50 to-purple-100',
    },
    {
      title: 'Geçmiş',
      description: 'Daha önce oluşturduğunuz tüm görselleri ve videoları görüntüleyin',
      icon: <History className="h-8 w-8 text-green-600" />,
      href: '/app/history',
      color: 'green',
      credits: 'Ücretsiz',
      bgGradient: 'from-green-50 to-green-100',
    },
  ];

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '+0%';
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
  };

  const imagesChange = calculatePercentageChange(
    dashboardStats.imagesThisMonth,
    dashboardStats.imagesLastMonth
  );

  const videosChange = calculatePercentageChange(
    dashboardStats.totalVideos,
    dashboardStats.videosLastMonth
  );

  const savingsChange = calculatePercentageChange(
    dashboardStats.totalSavings,
    dashboardStats.savingsLastMonth
  );

  const stats = [
    {
      title: 'Bu Ay Üretilen',
      value: statsLoading ? '...' : dashboardStats.imagesThisMonth.toString(),
      subtitle: 'görsel',
      icon: <Camera className="h-6 w-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
      change: imagesChange,
      changeType: imagesChange.startsWith('+') && imagesChange !== '+0%' ? 'positive' : 'neutral',
    },
    {
      title: 'Toplam Video',
      value: statsLoading ? '...' : dashboardStats.totalVideos.toString(),
      subtitle: 'video',
      icon: <Video className="h-6 w-6 text-purple-600" />,
      bgColor: 'bg-purple-50',
      change: videosChange,
      changeType: videosChange.startsWith('+') && videosChange !== '+0%' ? 'positive' : 'neutral',
    },
    {
      title: 'Kalan Kredi',
      value: loading ? '...' : wallet?.balance.toString() || '0',
      subtitle: 'kredi',
      icon: <Sparkles className="h-6 w-6 text-orange-600" />,
      bgColor: 'bg-orange-50',
      change: 'Aktif',
      changeType: 'positive',
    },
    {
      title: 'Toplam Tasarruf',
      value: statsLoading ? '...' : `₺${dashboardStats.totalSavings}`,
      subtitle: 'bu ay',
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      bgColor: 'bg-green-50',
      change: savingsChange,
      changeType: savingsChange.startsWith('+') && savingsChange !== '+0%' ? 'positive' : 'neutral',
    },
  ];

  const navigationLinks = [
    { title: 'Profil Bilgileri', icon: <User className="h-6 w-6 text-indigo-600" />, href: '/app/profile' },
    { title: 'Abonelik Detayları', icon: <CreditCard className="h-6 w-6 text-pink-600" />, href: '/app/subscription' },
    { title: 'Ödemeler', icon: <Receipt className="h-6 w-6 text-teal-600" />, href: '/app/billing' },
    { title: 'Ayarlar', icon: <Settings className="h-6 w-6 text-gray-600" />, href: '/app/settings' },
  ];

  const recentActivity = [
    {
      type: 'welcome',
      title: 'Hoş Geldiniz!',
      description: 'Pixtrate\'ya katıldığınız için teşekkürler.',
      time: 'Şimdi',
      icon: <Users className="h-5 w-5 text-blue-600" />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-center justify-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Merhaba, {user?.email?.split('@')[0]}! 👋
                </h2>
                <p className="text-gray-600 mt-1">
                  Pixtrate ile ürün görsellerinizi profesyonel kalitede oluşturmaya başlayın.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
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
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.subtitle}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Hızlı İşlemler</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <Link to={action.href} className="block h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-4 rounded-xl bg-gradient-to-r ${action.bgGradient} group-hover:scale-110 transition-transform`}>
                          {action.icon}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {action.credits}
                        </Badge>
                      </div>
                      
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h4>
                      
                      <p className="text-gray-600 flex-1 mb-4 text-sm">
                        {action.description}
                      </p>
                      
                      <Button
                        variant="outline"
                        className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors"
                      >
                        Başla
                      </Button>
                    </div>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity & Credit Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-600" />
                Son Aktiviteler
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Credit Info */}
          {wallet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-orange-600" />
                  Kredi Bilgileri
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Mevcut Bakiye</span>
                    <span className="text-2xl font-bold text-orange-600">{wallet.balance} kredi</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Paket Türü</span>
                    <Badge variant="secondary">
                      {wallet.package_type === 'trial' ? 'Deneme' : wallet.package_type}
                    </Badge>
                  </div>
                  {wallet.balance < 10 && (
                    <div className="pt-4 border-t border-orange-200">
                      <p className="text-sm text-gray-600 mb-3">
                        Kredi bakiyeniz azalıyor. Yeni kredi satın almayı düşünün.
                      </p>
                      <Button 
                        as={Link} 
                        to="/pricing" 
                        variant="primary" 
                        size="sm"
                        className="w-full"
                      >
                        Kredi Satın Al
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {navigationLinks.map((link, index) => (
            <Link key={index} to={link.href} className="block">
              <Card className="p-4 hover:shadow-md transition-shadow text-center">
                <div className="flex justify-center mb-2">
                  {link.icon}
                </div>
                <p className="text-sm font-medium text-gray-900">{link.title}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};