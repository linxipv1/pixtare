/*
  # Admin Hesabı Oluşturma

  Bu dosyayı Supabase Dashboard > SQL Editor'de çalıştırın.

  Admin Bilgileri:
  - Email: admin@pixtrate.com
  - Şifre: pX78563214++
  - Kredi: 999999 (Sınırsız)

  NOT: Şifre hash'i bcrypt ile oluşturulmuştur.
*/

-- 1. Admin kullanıcısını admin_users tablosuna ekle
-- Şifre: pX78563214++ (bcrypt hash)
INSERT INTO admin_users (
  email,
  password_hash,
  full_name,
  is_active
) VALUES (
  'admin@pixtrate.com',
  '$2a$10$YZ9qhXvV3kFq8WQE7xKLn.rKN8h9lVjCzGxBqPFdKBm3h5tKJxKVG',
  'Admin User',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 2. Supabase Auth için kullanıcı bilgisini göster
-- NOT: Supabase Auth kullanıcısını Dashboard'dan manuel oluşturmanız gerekiyor
-- Dashboard > Authentication > Users > Invite User
-- Veya aşağıdaki bilgilerle kayıt olun:
-- Email: admin@pixtrate.com
-- Password: pX78563214++

-- 3. Kullanıcı oluştuktan sonra, bu SQL'i çalıştırarak sınırsız kredi ekleyin:
-- (USER_ID yerine gerçek UUID'yi koyun)

/*
-- Önce kullanıcının ID'sini bulun:
SELECT id, email FROM auth.users WHERE email = 'admin@pixtrate.com';

-- Sonra bu ID ile users tablosuna ekleyin:
INSERT INTO users (id, email, credits_balance)
VALUES (
  'USER_ID_BURAYA',  -- Yukarıda bulduğunuz UUID
  'admin@pixtrate.com',
  999999
)
ON CONFLICT (id) DO UPDATE SET
  credits_balance = 999999,
  updated_at = NOW();

-- Credit ledger'a kayıt ekleyin:
INSERT INTO credit_ledger (user_id, delta, reason, ref)
VALUES (
  'USER_ID_BURAYA',  -- Aynı UUID
  999999,
  'Admin hesabı - Sınırsız kredi',
  'ADMIN_SETUP'
);
*/

SELECT 'Admin users tablosuna kayıt eklendi. Şimdi Supabase Dashboard''dan auth kullanıcısını oluşturun.' as status;
