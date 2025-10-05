import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SEOHead } from '../components/seo/SEOHead';

const contactSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  company: z.string().optional(),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalıdır'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Contact form data:', data);
    toast.success('Mesajınız başarıyla gönderildi! 24 saat içinde size geri döneceğiz.');
    reset();
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6 text-white" />,
      title: 'E-posta',
      value: 'info@pixtrate.com',
      bgColor: 'bg-blue-500',
    },
    {
      icon: <Phone className="h-6 w-6 text-white" />,
      title: 'Telefon',
      value: '+90 (212) 555-0123',
      bgColor: 'bg-purple-500',
    },
    {
      icon: <MapPin className="h-6 w-6 text-white" />,
      title: 'Adres',
      value: 'Maslak, İstanbul, Türkiye',
      bgColor: 'bg-green-500',
    },
  ];

  const demoFeatures = [
    { text: 'Ücretsiz', icon: '✓' },
    { text: '24 saat içinde', icon: '✓' },
    { text: 'Kişiye özel', icon: '✓' },
  ];

  return (
    <>
      <SEOHead
        title="İletişim - Pixtrate"
        description="Pixtrate ile iletişime geçin. E-ticaret görsellerinizi dönüştürmek için özel çözümler hakkında bilgi alın."
        keywords="iletişim, ai görsel destek, müşteri hizmetleri, demo talep"
      />

      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                İletişime Geçin
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              E-ticaret görsellerinizi dönüştürmek için hazır mısınız? Size özel çözümler için bizimle 
              iletişime geçin.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Bizimle İletişime Geçin
              </h2>

              <div className="space-y-6 mb-12">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${info.bgColor}`}>
                      {info.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{info.title}</p>
                      <p className="text-gray-600">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Demo Card */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">🚀 Ücretsiz Demo</h3>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">
                  Pixtrate'nun gücünü deneyimlemek için ücretsiz demo talebinde bulunun. 
                  Size özel örnek çalışmalar hazırlayalım.
                </p>

                <div className="flex flex-wrap gap-3 mb-4">
                  {demoFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <span className="text-green-600 font-bold">{feature.icon}</span>
                      <span className="text-gray-700">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İsim Soyisim *
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Adınız ve soyadınız"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-posta *
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="ornek@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şirket Adı
                    </label>
                    <input
                      {...register('company')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Şirket adınız (isteğe bağlı)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mesajınız *
                    </label>
                    <textarea
                      {...register('message')}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Projeniz hakkında bize bilgi verin..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="lg"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Mesaj Gönder
                  </Button>

                  <p className="text-sm text-gray-500 text-center">
                    Mesajınızı aldıktan sonra 24 saat içinde size geri döneceğiz.
                  </p>
                </form>
              </Card>
            </motion.div>
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
              İletişim hakkında merak ettikleriniz
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: 'Demo talebim ne kadar sürede karşılanır?',
                answer: 'Demo talepleriniz 24 saat içerisinde karşılanır. Size özel örnek çalışmalar hazırlayıp e-posta ile gönderiyoruz.',
              },
              {
                question: 'Teknik destek nasıl alırım?',
                answer: 'Tüm paketlerde e-posta desteği mevcuttur. Premium paket kullanıcıları 7/24 telefon desteği alabilir.',
              },
              {
                question: 'Özel entegrasyon mümkün mü?',
                answer: 'Evet, Premium paket ile özel entegrasyonlar ve API çözümleri sunuyoruz. İhtiyaçlarınızı bizimle paylaşın.',
              },
              {
                question: 'Fiyat teklifi nasıl alabilirim?',
                answer: 'İletişim formunu doldurarak özel fiyat tekliflerimizden yararlanabilirsiniz. Kurumsal müşterilerimize özel indirimler sunuyoruz.',
              },
            ].map((faq, index) => (
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
    </>
  );
};