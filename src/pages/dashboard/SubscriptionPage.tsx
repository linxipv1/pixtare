import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Star, CheckCircle, ArrowRight, Sparkles, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCredits } from '../../hooks/useCredits';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import toast from 'react-hot-toast';

export const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { wallet, loading } = useCredits();
  const navigate = useNavigate();

  const handlePackageSelection = (planId: string) => {
    if (!user) {
      toast.error('Paket satın almak için lütfen giriş yapın veya üye olun');
      setTimeout(() => {
        navigate('/auth');
      }, 1500);
      return;
    }

    const userEmail = user.email || '';
    const gumroadLinks: Record<string, string> = {
      trial: '/app',
      basic: `https://goruntulabs.gumroad.com/l/temelpaket?prefill_email=${encodeURIComponent(userEmail)}`,
      standard: `https://goruntulabs.gumroad.com/l/standartpaket?prefill_email=${encodeURIComponent(userEmail)}`,
      premium: `https://goruntulabs.gumroad.com/l/premiumpaket?prefill_email=${encodeURIComponent(userEmail)}`,
    };

    const targetUrl = gumroadLinks[planId];

    if (planId === 'trial') {
      navigate(targetUrl);
    } else {
      window.open(targetUrl, '_blank');
    }
  };

  const plans = [
    {
      id: 'trial',
      name: 'Deneme',
      description: 'Ücretsiz deneme paketi',
      monthlyPrice: 0,
      credits: 10,
      features: [
        'Görsel ve video üretimi',
        'Yüksek çözünürlükte çıktı',
        'Filigransız ticari kullanım',
        'Kredi tabanlı kullanım',
        'Panelden kredi takibi',
        'Hızlı teslim',
        'E-posta desteği',
        '7 gün süre sınırı',
      ],
      limitations: ['7 gün içinde kullanılmalı'],
      popular: false,
      color: 'gray',
    },
    {
      id: 'basic',
      name: 'Temel',
      description: 'Küçük işletmeler için',
      monthlyPrice: 79,
      credits: 60,
      features: [
        'Görsel ve video üretimi',
        'Yüksek çözünürlükte çıktı',
        'Filigransız ticari kullanım',
        'Kredi tabanlı kullanım',
        'Panelden kredi takibi',
        'Hızlı teslim',
        'E-posta/sohbet desteği',
      ],
      limitations: [],
      popular: false,
      color: 'blue',
    },
    {
      id: 'standard',
      name: 'Standart',
      description: 'Büyüyen işletmeler için',
      monthlyPrice: 179,
      credits: 180,
      features: [
        'Görsel ve video üretimi',
        'Yüksek çözünürlükte çıktı',
        'Filigransız ticari kullanım',
        'Kredi tabanlı kullanım',
        'Panelden kredi takibi',
        'Hızlı teslim',
        'E-posta/sohbet desteği',
      ],
      limitations: [],
      popular: true,
      color: 'green',
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Kurumsal çözümler',
      monthlyPrice: 399,
      credits: 500,
      features: [
        'Görsel ve video üretimi',
        'Yüksek çözünürlükte çıktı',
        'Filigransız ticari kullanım',
        'Kredi tabanlı kullanım',
        'Panelden kredi takibi',
        'Hızlı teslim',
        'E-posta/sohbet desteği',
      ],
      limitations: [],
      popular: false,
      color: 'purple',
    },
  ];

  return (
    <DashboardLayout 
      title="Abonelik Detayları" 
      subtitle="Mevcut paketinizi görüntüleyin ve yeni paket seçin"
    >
      <div className="space-y-8">
        {/* Current Subscription */}
        {wallet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Bell className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-2">📢 Önemli Duyuru</h3>
                  <p className="text-sm text-green-700 mb-2">
                    Yeni AI video üretim özelliği aktif! Artık ürünlerinizin 360° videolarını oluşturabilirsiniz.
                  </p>
                  <p className="text-xs text-green-600">
                    Video üretimi: 8 kredi | Fotoğraf üretimi: 1 kredi (4 adet)
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Mevcut Paketiniz</h3>
                    <p className="text-gray-600">
                      {wallet.package_type === 'trial' ? 'Deneme Paketi' : wallet.package_type} - 
                      {' '}{wallet.balance} kredi kaldı
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="success" className="mb-2">Aktif</Badge>
                  <p className="text-sm text-gray-600">Sonraki yenileme: 30 gün</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Available Plans */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Paket Seçenekleri
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              İhtiyaçlarınıza en uygun paketi seçin ve Pixtrate'nun tüm özelliklerinden yararlanın
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      En Popüler
                    </div>
                  </div>
                )}

                <Card className={`p-6 h-full ${plan.popular ? 'ring-2 ring-blue-600 shadow-xl' : ''}`}>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    
                    <div className="mb-2">
                      <div className="flex items-baseline justify-center space-x-1">
                        <span className="text-4xl font-bold text-gray-900">
                          ${plan.monthlyPrice}
                        </span>
                        {plan.monthlyPrice > 0 && (
                          <span className="text-gray-600">
                            /ay
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      {plan.credits} kredi dahil
                      {plan.monthlyPrice > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          ${(plan.monthlyPrice / plan.credits).toFixed(2)}/kredi
                        </div>
                      )}
                      {plan.id === 'trial' && (
                        <div className="text-xs text-orange-600 mt-1 font-medium">
                          ⏰ 7 gün içinde kullanın
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations && plan.limitations.length > 0 && (
                      <div className="pt-3 border-t border-gray-200">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <div key={limitIndex} className="flex items-start space-x-2">
                            <div className="h-5 w-5 flex-shrink-0 mt-0.5 flex items-center justify-center">
                              <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                            </div>
                            <span className="text-orange-600 text-sm font-medium">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    className="w-full"
                    onClick={() => handlePackageSelection(plan.id)}
                    disabled={wallet?.package_type === plan.id}
                  >
                    {wallet?.package_type === plan.id ? 'Mevcut Paket' : (plan.monthlyPrice === 0 ? 'Ücretsiz Başla' : 'Paketi Seç')}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Usage Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-orange-600" />
              Kullanım İstatistikleri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
                <div className="text-sm text-gray-600">Bu Ay Kullanılan Kredi</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">0</div>
                <div className="text-sm text-gray-600">Toplam Görsel</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">0</div>
                <div className="text-sm text-gray-600">Toplam Video</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Billing Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Fatura Bilgileri</h3>
              <Button variant="outline" size="sm" as={Link} to="/app/billing">
                Tüm Faturaları Görüntüle
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Henüz fatura geçmişiniz bulunmuyor</p>
              <p className="text-sm">İlk paket satın alımınızdan sonra faturalarınız burada görünecek</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};