import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star, CreditCard, Shield, Clock, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SEOHead } from '../components/seo/SEOHead';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const PricingPage: React.FC = () => {
  const { user } = useAuth();
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
      basic: `https://pixtrate.gumroad.com/l/temelpaket?prefill_email=${encodeURIComponent(userEmail)}`,
      standard: `https://pixtrate.gumroad.com/l/standartpaket?prefill_email=${encodeURIComponent(userEmail)}`,
      premium: `https://pixtrate.gumroad.com/l/premiumpaket?prefill_email=${encodeURIComponent(userEmail)}`,
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

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: 'Güvenli Ödeme',
      description: '256-bit SSL şifreleme ile güvenli ödeme işlemleri',
    },
    {
      icon: <Clock className="h-6 w-6 text-green-600" />,
      title: 'Hızlı Aktivasyon',
      description: 'Ödeme sonrası anında hesabınız aktif hale gelir',
    },
    {
      icon: <Headphones className="h-6 w-6 text-purple-600" />,
      title: '7/24 Destek',
      description: 'Tüm paketlerde e-posta desteği, premium\'da telefon desteği',
    },
    {
      icon: <CreditCard className="h-6 w-6 text-orange-600" />,
      title: 'Esnek Ödeme',
      description: 'Aylık veya yıllık ödeme seçenekleri, istediğiniz zaman iptal',
    },
  ];

  const faqs = [
    {
      question: 'Kredi sistemi nasıl çalışır?',
      answer: 'Her görsel üretimi için belirli miktarda kredi harcanır. Görsel üretimi 1 kredi, video üretimi 3-5 kredi arasında değişir. Krediler aylık olarak yenilenir.',
    },
    {
      question: 'Paketi değiştirebilir miyim?',
      answer: 'Evet, istediğiniz zaman paket yükseltmesi veya düşürme yapabilirsiniz. Değişiklik bir sonraki fatura döneminde geçerli olur.',
    },
    {
      question: 'Ücretsiz deneme süresi var mı?',
      answer: 'Evet, Deneme paketi ile 10 ücretsiz kredi alırsınız. Bu kredileri 7 gün içinde kullanmanız gerekir. Kredi kartı bilgisi gerekmez.',
    },
    {
      question: 'İptal edebilir miyim?',
      answer: 'Tabii ki! İstediğiniz zaman hesabınızdan aboneliğinizi iptal edebilirsiniz. İptal sonrası mevcut dönem sonuna kadar hizmet almaya devam edersiniz.',
    },
    {
      question: 'Fatura kesiliyor mu?',
      answer: 'Evet, tüm ödemeleriniz için e-fatura düzenlenir ve hesabınızdan indirebilirsiniz.',
    },
  ];

  return (
    <>
      <SEOHead
        title="Fiyatlandırma - Pixtrate"
        description="Pixtrate fiyatlandırması. Mobilya, aksesuar ve takı çekimi için en uygun paketi seçin. Ücretsiz deneme mevcut."
        keywords="ai görsel fiyatlandırma, fiyatlar, mobilya çekimi fiyat, aksesuar fotoğraf paketi, takı çekim ücreti"
      />

      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Fiyatlandırma
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              İşletmenizin büyüklüğüne göre tasarlanmış paketler. 
              10 ücretsiz görsel ile hemen başlayın, kredi kartı gerekmez.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  >
                    {plan.monthlyPrice === 0 ? 'Ücretsiz Başla' : 'Paketi Seç'}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Credit Information */}
          <div className="mt-16">
            <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  💡 Krediler Nasıl Çalışır?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">📸 Görsel Üretimi</p>
                      <p className="text-sm text-gray-600">1 ürün = 4 görsel = 1 kredi</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">🎬 Video Üretimi</p>
                      <p className="text-sm text-gray-600">1 ürün = 1 video = 6 kredi</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">📦 Tam Paket</p>
                      <p className="text-sm text-gray-600">4 görsel + 1 video = 7 kredi</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <p className="text-sm text-gray-600">
                    • Deneme paketi 7 gün içinde kullanılmalıdır<br/>
                    • Kredi tüketimi tüm paketlerde aynıdır<br/>
                    • Fiyatlar USD, vergiler dahildir<br/>
                    • Krediler aylık olarak yenilenir
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-gray-600">
              Paketler hakkında merak ettikleriniz
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Hala Kararsız mısınız?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              10 ücretsiz görsel üretimi ile risk almadan platformumuzu test edin. 
              Beğenmezseniz hiçbir ücret ödemeden ayrılabilirsiniz.
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-50 hover:text-blue-700 border-0"
              onClick={() => handlePackageSelection('trial')}
            >
              Ücretsiz Denemeye Başla
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};