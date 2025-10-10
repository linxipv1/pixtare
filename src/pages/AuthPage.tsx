import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Building2, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SEOHead } from '../components/seo/SEOHead';

const signInSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

const signUpSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
  companyName: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerSignIn,
    handleSubmit: handleSubmitSignIn,
    formState: { errors: signInErrors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    formState: { errors: signUpErrors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const onSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('E-posta veya şifre hatalı');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('E-posta adresinizi doğrulamanız gerekiyor');
        } else if (error.message.includes('Too many requests')) {
          toast.error('Çok fazla deneme. Lütfen biraz bekleyin');
        } else if (error.name === 'NetworkError') {
          toast.error('Bağlantı hatası: Lütfen internet bağlantınızı kontrol edin');
        } else if (error.message.includes('Network error')) {
          toast.error('Sunucuya bağlanılamıyor. Lütfen daha sonra tekrar deneyin.');
        } else {
          toast.error(`Giriş hatası: ${error.message}`);
        }
      } else {
        toast.success('Başarıyla giriş yapıldı');
        navigate('/app');
      }
    } catch (error) {
      toast.error('Beklenmeyen bir hata oluştu');
    }
    setIsLoading(false);
  };

  const onSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, {
        full_name: data.fullName,
        company_name: data.companyName || null,
        phone: data.phone || null,
      });
      
      if (error) {
        console.error('SignUp error details:', error);
        if (error.message.includes('User already registered')) {
          toast.error('Bu e-posta adresi zaten kayıtlı');
        } else if (error.message.includes('Password should be at least')) {
          toast.error('Şifre en az 6 karakter olmalıdır');
        } else if (error.message.includes('Invalid email')) {
          toast.error('Geçersiz e-posta adresi');
        } else if (error.message.includes('Signup is disabled')) {
          toast.error('Yeni kayıt şu anda kapalı');
        } else {
          toast.error(`Hesap oluşturulurken bir hata oluştu: ${error.message}`);
        }
      } else {
        toast.success('Hesabınız başarıyla oluşturuldu! E-posta doğrulaması gerekebilir.');
        navigate('/app');
      }
    } catch (error) {
      console.error('SignUp exception:', error);
      toast.error('Beklenmeyen bir hata oluştu');
    }
    setIsLoading(false);
  };

  return (
    <>
      <SEOHead
        title={mode === 'signup' ? 'Hesap Oluştur - Pixtrate' : 'Giriş Yap - Pixtrate'}
        description={mode === 'signup' 
          ? 'Pixtrate\'ya ücretsiz hesap oluşturun. 10 ücretsiz görsel üretimi ile başlayın.'
          : 'Pixtrate hesabınıza giriş yapın. Ürün görsellerinizi AI ile dönüştürün.'
        }
        keywords="giriş yap, hesap oluştur, kayıt ol, ai görsel platform"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-block mb-6">
                <img src="/pixtrate-logo-v2.png" alt="Pixtrate" className="h-12 mx-auto" />
              </Link>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {mode === 'signup' ? 'Hesap Oluştur' : 'Giriş Yap'}
              </h1>
              
              <p className="text-gray-600">
                {mode === 'signup' 
                  ? '10 ücretsiz görsel ile hemen başlayın' 
                  : 'Hesabınıza erişin ve üretmeye devam edin'
                }
              </p>
            </div>

            <Card className="p-8">
              {/* Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setMode('signin')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    mode === 'signin'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    mode === 'signup'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Hesap Oluştur
                </button>
              </div>

              {/* Sign In Form */}
              {mode === 'signin' && (
                <form onSubmit={handleSubmitSignIn(onSignIn)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...registerSignIn('email')}
                        type="email"
                        placeholder="ornek@email.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    {signInErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{signInErrors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Şifre
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...registerSignIn('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {signInErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{signInErrors.password.message}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-600">Beni hatırla</span>
                    </label>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                      Şifremi unuttum
                    </a>
                  </div>

                  <Button type="submit" isLoading={isLoading} className="w-full">
                    Giriş Yap
                  </Button>
                </form>
              )}

              {/* Sign Up Form */}
              {mode === 'signup' && (
                <form onSubmit={handleSubmitSignUp(onSignUp)} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ad Soyad *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...registerSignUp('fullName')}
                          type="text"
                          placeholder="Ad Soyad"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      {signUpErrors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{signUpErrors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Firma Adı
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...registerSignUp('companyName')}
                          type="text"
                          placeholder="Firma Adı (isteğe bağlı)"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...registerSignUp('phone')}
                          type="tel"
                          placeholder="+90 (5xx) xxx xx xx"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-posta *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...registerSignUp('email')}
                          type="email"
                          placeholder="ornek@email.com"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      {signUpErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{signUpErrors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Şifre *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...registerSignUp('password')}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {signUpErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{signUpErrors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Şifre Tekrar *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...registerSignUp('confirmPassword')}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      {signUpErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{signUpErrors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-start">
                      <input type="checkbox" required className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5" />
                      <span className="ml-2 text-sm text-gray-600">
                        <a href="#" className="text-blue-600 hover:text-blue-700">Kullanım Koşulları</a> ve{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-700">Gizlilik Politikası</a>'nı kabul ediyorum.
                      </span>
                    </label>
                  </div>

                  <Button type="submit" isLoading={isLoading} className="w-full">
                    Hesap Oluştur
                  </Button>
                </form>
              )}
            </Card>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Hesabınıza erişimde sorun mu yaşıyorsunuz?{' '}
                <a href="mailto:destek@pixtrate.com" className="text-blue-600 hover:text-blue-700">
                  Destek ekibiyle iletişime geçin
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};