import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Shield, Clock, Star, CheckCircle, Camera, Video, TrendingUp, Users, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SEOHead } from '../components/seo/SEOHead';
import { usePortfolioItems, useTestimonials, useSiteStats, useFeatures } from '../hooks/useContent';

export const HomePage: React.FC = () => {
  const { items: portfolioItems, loading: portfolioLoading } = usePortfolioItems();
  const { items: testimonials, loading: testimonialsLoading } = useTestimonials();
  const { stats: siteStats, loading: statsLoading } = useSiteStats();
  const { features, loading: featuresLoading } = useFeatures();

  const fallbackTestimonials = [
    {
      name: 'Ahmet Yılmaz',
      company: 'Mobilya Dünyası',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      rating: 5,
      text: 'Pixtrate sayesinde ürün fotoğraflarımızın kalitesi inanılmaz arttı. Müşteri memnuniyeti %40 yükseldi!'
    },
    {
      name: 'Zeynep Kaya',
      company: 'Takı Atölyesi',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      rating: 5,
      text: 'Takılarımızın detaylarını mükemmel şekilde yakalıyor. Profesyonel fotoğrafçıya ihtiyacım kalmadı.'
    },
    {
      name: 'Mehmet Özkan',
      company: 'Ev Dekorasyon',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      rating: 5,
      text: 'E-ticaret sitemizin dönüşüm oranı %60 arttı. Müşteriler artık ürünleri daha net görebiliyor.'
    }
  ];

  const fallbackStats = [
    { number: '50,000+', label: 'Üretilen Görsel', icon: <Camera className="h-6 w-6 text-blue-600" /> },
    { number: '5,000+', label: 'Mutlu Müşteri', icon: <Users className="h-6 w-6 text-green-600" /> },
    { number: '15,000+', label: 'Video Üretimi', icon: <Video className="h-6 w-6 text-purple-600" /> },
    { number: '%95', label: 'Memnuniyet Oranı', icon: <TrendingUp className="h-6 w-6 text-orange-600" /> }
  ];

  const getIconComponent = (iconName: string, color: string) => {
    const iconProps = { className: `h-6 w-6 ${color}` };
    switch (iconName) {
      case 'Camera': return <Camera {...iconProps} />;
      case 'Users': return <Users {...iconProps} />;
      case 'Video': return <Video {...iconProps} />;
      case 'TrendingUp': return <TrendingUp {...iconProps} />;
      case 'Zap': return <Zap {...iconProps} />;
      case 'Shield': return <Shield {...iconProps} />;
      case 'Clock': return <Clock {...iconProps} />;
      case 'Sparkles': return <Sparkles {...iconProps} />;
      default: return <Camera {...iconProps} />;
    }
  };

  const fallbackFeatures = [
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      title: 'Hızlı Üretim',
      description: 'Saniyeler içinde profesyonel kalitede ürün fotoğrafları',
      color: 'blue'
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: 'Ticari Kullanım',
      description: 'Filigransız, e-ticaret sitenizde özgürce kullanın',
      color: 'green'
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-600" />,
      title: '7/24 Erişim',
      description: 'İstediğiniz zaman, istediğiniz yerden üretin',
      color: 'purple'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-orange-600" />,
      title: 'Yüksek Kalite',
      description: '4K çözünürlükte, profesyonel standartlarda çıktılar',
      color: 'orange'
    }
  ];

  return (
    <>
      <SEOHead
        title="Pixtrate - Mobilya, Aksesuar ve Takı için AI Görsel Üretimi"
        description="Türkiye'nin en gelişmiş AI tabanlı görsel ve video üretim platformu. Mobilya, aksesuar ve takı ürünlerinizi profesyonel görsellere dönüştürün."
        keywords="ai görsel üretimi, mobilya fotoğrafları, aksesuar çekimi, takı fotoğrafları, e-ticaret görselleri, türkiye"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 bg-grid-pattern">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
          <div className="relative max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4 mr-2" />
                Türkiye'nin #1 AI Görsel Platformu
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                  AI ile Ürün Fotoğrafçılığı
                </span>
                <br />
                <span className="text-gray-900">Artık Çok Kolay</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Mobilya, aksesuar ve takı ürünlerinizi profesyonel kalitede görsellere dönüştürün. 
                Yapay zeka teknolojisi ile saniyeler içinde e-ticaret siteniz için mükemmel fotoğraflar.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  as={Link} 
                  to="/auth?mode=signup" 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg btn-hover-lift"
                >
                  10 Ücretsiz Kredi ile Başla
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  as={Link}
                  to="/pricing"
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg"
                >
                  Fiyatlandırmayı İncele
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Kredi kartı gerekmez
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Anında aktivasyon
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Ticari kullanım
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statsLoading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : siteStats.length > 0 ? (
                siteStats.map((stat, index) => (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div className="flex justify-center mb-3">
                      {getIconComponent(stat.icon, stat.icon_color)}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </motion.div>
                ))
              ) : (
                fallbackStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div className="flex justify-center mb-3">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Neden Pixtrate?
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  E-ticaret işletmeniz için özel olarak tasarlanmış AI teknolojisi
                </p>
              </motion.div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuresLoading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : features.length > 0 ? (
                features.map((feature, index) => {
                  const colorMap: Record<string, { bg: string; border: string }> = {
                    'text-blue-600': { bg: 'bg-blue-50', border: 'border-blue-200' },
                    'text-green-600': { bg: 'bg-green-50', border: 'border-green-200' },
                    'text-purple-600': { bg: 'bg-purple-50', border: 'border-purple-200' },
                    'text-orange-600': { bg: 'bg-orange-50', border: 'border-orange-200' }
                  };
                  const colors = colorMap[feature.icon_color] || { bg: 'bg-gray-50', border: 'border-gray-200' };

                  return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className={`p-8 text-center card-hover h-full border-2 ${colors.border} ${colors.bg}`}>
                      <div className="flex justify-center mb-4">
                        {getIconComponent(feature.icon, feature.icon_color)}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </Card>
                  </motion.div>
                )})
              ) : (
                fallbackFeatures.map((feature, index) => {
                  const colorMap: Record<string, { bg: string; border: string }> = {
                    'blue': { bg: 'bg-blue-50', border: 'border-blue-200' },
                    'green': { bg: 'bg-green-50', border: 'border-green-200' },
                    'purple': { bg: 'bg-purple-50', border: 'border-purple-200' },
                    'orange': { bg: 'bg-orange-50', border: 'border-orange-200' }
                  };
                  const colors = colorMap[feature.color] || { bg: 'bg-gray-50', border: 'border-gray-200' };

                  return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className={`p-8 text-center card-hover h-full border-2 ${colors.border} ${colors.bg}`}>
                      <div className="flex justify-center mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </Card>
                  </motion.div>
                )})
              )}
            </div>
          </div>
        </section>

        {/* Referans Çalışmalarımız Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="relative inline-block">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Referans Çalışmalarımız
                  </h2>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-600 to-green-600 rounded-full"></div>
                </div>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-8">
                  Pixtrate ile dönüştürülen gerçek ürün fotoğrafları
                </p>
              </motion.div>
            </div>

            {/* References Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {portfolioLoading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : portfolioItems.length > 0 ? (
                portfolioItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-all duration-300 group">
                    {/* Category Badge */}
                    <div className="p-6 pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <Badge
                          variant="secondary"
                          className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700"
                        >
                          {item.category}
                        </Badge>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          AI Dönüştürülmüş
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {item.description}
                      </p>
                    </div>

                    {/* Before/After Comparison */}
                    <div className="relative h-64 bg-gray-100 overflow-hidden">
                      <div className="absolute inset-0 grid grid-cols-2">
                        {/* Before Image */}
                        <div className="relative overflow-hidden">
                          <img
                            src={item.before_image_url}
                            alt={`${item.title} - Öncesi`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                            Öncesi
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10"></div>
                        </div>
                        
                        {/* After Image */}
                        <div className="relative overflow-hidden">
                          <img
                            src={item.after_image_url}
                            alt={`${item.title} - Sonrası`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                            Sonrası
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/10"></div>
                        </div>
                      </div>
                      
                      {/* Divider Line */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-white shadow-lg z-10"></div>
                      
                      {/* VS Badge */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-green-600 text-white p-2 rounded-full shadow-lg z-20">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-6 pt-4 bg-gray-50">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>✨ AI ile dönüştürüldü</span>
                        <span className="text-green-600 font-medium">%300 daha profesyonel</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">Henüz referans çalışması eklenmemiş</p>
                </div>
              )}
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <Button 
                as={Link} 
                to="/auth?mode=signup" 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Siz de Başlayın
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Müşterilerimiz Ne Diyor?
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Binlerce işletme Pixtrate ile başarıya ulaştı
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonialsLoading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : testimonials.length > 0 ? (
                testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="p-8 text-center card-hover h-full">
                      <div className="flex justify-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-6 italic">
                        "{testimonial.text}"
                      </p>
                      <div className="flex items-center justify-center space-x-3">
                        {testimonial.image_url && (
                          <img
                            src={testimonial.image_url}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{testimonial.name}</p>
                          <p className="text-sm text-gray-600">{testimonial.company}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                fallbackTestimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="p-8 text-center card-hover h-full">
                      <div className="flex justify-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-6 italic">
                        "{testimonial.text}"
                      </p>
                      <div className="flex items-center justify-center space-x-3">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{testimonial.name}</p>
                          <p className="text-sm text-gray-600">{testimonial.company}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Bizimle İletişime Geçin
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Sorularınız mı var? Size yardımcı olmaktan mutluluk duyarız
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Mail className="w-8 h-8 text-blue-600" />,
                  title: 'E-posta',
                  content: 'support@pixtrate.com',
                  description: '24 saat içinde yanıtlıyoruz'
                },
                {
                  icon: <Phone className="w-8 h-8 text-green-600" />,
                  title: 'Telefon',
                  content: '+90 506 110 65 97',
                  description: 'Pazartesi-Cuma 09:00-18:00'
                },
                {
                  icon: <MapPin className="w-8 h-8 text-purple-600" />,
                  title: 'Adres',
                  content: 'İstanbul',
                  description: 'Türkiye'
                }
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-8 text-center card-hover h-full">
                    <div className="flex justify-center mb-4">
                      {contact.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {contact.title}
                    </h3>
                    <p className="text-lg text-gray-900 font-medium mb-2">
                      {contact.content}
                    </p>
                    <p className="text-gray-600">
                      {contact.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Button
                  as="a"
                  href="mailto:info@pixtrate.com"
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  E-posta Gönder
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-green-600">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                E-ticaret Başarınızı Artırın
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Profesyonel ürün fotoğrafları ile satışlarınızı artırın. 
                10 ücretsiz kredi ile hemen başlayın!
              </p>
              <Button 
                as={Link} 
                to="/auth?mode=signup" 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-50 px-10 py-5 text-xl font-bold rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Ücretsiz Hesap Oluştur
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};