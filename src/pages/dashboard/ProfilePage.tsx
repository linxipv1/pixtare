import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { User, Mail, Building2, Phone, Save, CreditCard as Edit3, Bell, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
  company_name: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setValue('full_name', data.full_name || '');
        setValue('company_name', data.company_name || '');
        setValue('phone', data.phone || '');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: data.full_name,
          company_name: data.company_name || null,
          phone: data.phone || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Profil bilgileriniz başarıyla güncellendi!');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Profil güncellenirken bir hata oluştu');
    }
    setLoading(false);
  };

  return (
    <DashboardLayout 
      title="Profil Bilgileri" 
      subtitle="Hesap bilgilerinizi görüntüleyin ve düzenleyin"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Account Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Hesap Bilgileri</h2>
                <p className="text-gray-600">Kişisel bilgilerinizi yönetin</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">E-posta</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Üyelik Durumu</p>
                  <p className="text-sm text-green-600">Aktif</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Edit3 className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Profil Düzenle</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('full_name')}
                    type="text"
                    placeholder="Adınız ve soyadınız"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şirket Adı
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('company_name')}
                    type="text"
                    placeholder="Şirket adınız (isteğe bağlı)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="+90 (5xx) xxx xx xx"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={loading}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Değişiklikleri Kaydet</span>
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bildirimler</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Hoş Geldiniz!</p>
                  <p className="text-sm text-blue-700">Pixtrate'ya katıldığınız için teşekkürler. 10 ücretsiz kredi hesabınıza tanımlandı.</p>
                  <p className="text-xs text-blue-600 mt-1">Şimdi</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-900">Hesap Doğrulandı</p>
                  <p className="text-sm text-green-700">E-posta adresiniz başarıyla doğrulandı. Artık tüm özellikleri kullanabilirsiniz.</p>
                  <p className="text-xs text-green-600 mt-1">2 dakika önce</p>
                </div>
              </div>
              
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Tüm bildirimler görüntülendi</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hesap İşlemleri</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Şifre Değiştir</p>
                  <p className="text-sm text-gray-600">Hesap güvenliğiniz için şifrenizi güncelleyin</p>
                </div>
                <Button variant="outline" size="sm">
                  Değiştir
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-red-900">Hesabı Sil</p>
                  <p className="text-sm text-red-600">Bu işlem geri alınamaz</p>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 bg-white">
                  Sil
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};