/*
  # Sınırsız Kredili Normal Hesap Oluştur

  1. Özel Hesap
    - Normal kayıt sistemi üzerinden
    - Sınırsız kredi (999,999)
    - Premium paket
  
  2. Güvenlik
    - Normal auth sistemi kullanılıyor
    - RLS policy'leri geçerli
    - Standart giriş işlemi
*/

-- Önce mevcut hesabı temizle (varsa)
DELETE FROM auth.users WHERE email = 'premium@aivisualstudio.com';

-- Normal auth sistemi üzerinden hesap oluştur
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'premium@aivisualstudio.com',
  crypt('Premium2025!@#', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Kullanıcı ID'sini al
DO $$
DECLARE
  user_uuid uuid;
  wallet_uuid uuid;
BEGIN
  -- Kullanıcı ID'sini bul
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = 'premium@aivisualstudio.com';
  
  -- Profil oluştur
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    company_name,
    phone,
    created_at,
    updated_at
  ) VALUES (
    user_uuid,
    'premium@aivisualstudio.com',
    'Premium User',
    'AI Visual Studio Premium',
    '+90 (212) 555-9999',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    phone = EXCLUDED.phone,
    updated_at = NOW();
  
  -- Kredi cüzdanı oluştur (sınırsız kredi)
  INSERT INTO public.credit_wallets (
    id,
    user_id,
    balance,
    package_type,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    user_uuid,
    999999, -- Sınırsız kredi
    'premium',
    NOW(),
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    balance = 999999,
    package_type = 'premium',
    updated_at = NOW();
  
  -- İlk kredi işlemi kaydet
  SELECT id INTO wallet_uuid 
  FROM public.credit_wallets 
  WHERE user_id = user_uuid;
  
  INSERT INTO public.credit_transactions (
    id,
    user_id,
    wallet_id,
    amount,
    type,
    description,
    created_at
  ) VALUES (
    gen_random_uuid(),
    user_uuid,
    wallet_uuid,
    999999,
    'purchase',
    'Premium hesap - Sınırsız kredi paketi',
    NOW()
  ) ON CONFLICT DO NOTHING;
  
END $$;