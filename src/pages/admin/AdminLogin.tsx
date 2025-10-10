import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Shield, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const adminLoginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { admin, login } = useAdmin();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  });

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (admin) {
      navigate('/admin');
    }
  }, [admin, navigate]);

  const onSubmit = async (data: AdminLoginFormData) => {
    setIsLoading(true);
    try {
      const { error } = await login(data.email, data.password);
      if (error) {
        toast.error('Geçersiz admin bilgileri');
      } else {
        toast.success('Admin paneline hoş geldiniz!');
        navigate('/admin');
      }
    } catch (error) {
      toast.error('Beklenmeyen bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center mb-6">
              <img src="/pixtrate-logo-v1.png" alt="Pixtrate" className="h-12 mb-3" />
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600" />
                <span className="text-lg font-semibold text-gray-700">Admin Panel</span>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Yönetici Girişi
            </h1>
            
            <p className="text-gray-600">
              Admin paneline erişmek için giriş yapın
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="admin@pixtrate.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                isLoading={isLoading} 
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                <Shield className="mr-2 h-5 w-5" />
                Admin Paneline Giriş
              </Button>
            </form>

            {/* Demo credentials info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>🔑 Admin Giriş:</strong>
              </p>
              <p className="text-xs text-gray-500">
                E-posta: admin@pixtrate.com<br/>
                Şifre: admin123
              </p>
            </div>
          </Card>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Ana siteye dönmek için{' '}
              <a href="/" className="text-red-600 hover:text-red-700 font-medium">
                buraya tıklayın
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};