/*
  # Initial Schema for AI Visual Studio

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique, not null)
      - `full_name` (text)
      - `company_name` (text)
      - `phone` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `credit_wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `balance` (integer, default 0)
      - `package_type` (text, default 'trial')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `credit_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `wallet_id` (uuid, references credit_wallets)
      - `amount` (integer, not null)
      - `type` (text, check constraint for 'purchase', 'usage', 'refund')
      - `description` (text, not null)
      - `generation_id` (uuid, nullable)
      - `created_at` (timestamp)
      
    - `generations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `job_id` (text, not null, unique)
      - `type` (text, check constraint for 'image', 'video')
      - `status` (text, default 'queued', check constraint)
      - `credits_used` (integer, not null)
      - `parameters` (jsonb)
      - `outputs` (text array, nullable)
      - `error_message` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Create indexes for performance optimization
    - Add triggers for automatic profile creation and updated_at timestamps

  3. Functions
    - Auto-create profile and credit wallet on user registration
    - Update timestamps automatically
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  company_name text,
  phone text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create credit_wallets table
CREATE TABLE IF NOT EXISTS credit_wallets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  balance integer DEFAULT 10 NOT NULL, -- Start with 10 free credits
  package_type text DEFAULT 'trial' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id uuid REFERENCES credit_wallets(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('purchase', 'usage', 'refund')),
  description text NOT NULL,
  generation_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create generations table
CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'video')),
  status text DEFAULT 'queued' NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  credits_used integer NOT NULL,
  parameters jsonb NOT NULL DEFAULT '{}',
  outputs text[],
  error_message text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create RLS Policies for credit_wallets
CREATE POLICY "Users can read own wallet"
  ON credit_wallets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON credit_wallets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet"
  ON credit_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for credit_transactions
CREATE POLICY "Users can read own transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON credit_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for generations
CREATE POLICY "Users can read own generations"
  ON generations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON generations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations"
  ON generations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_credit_wallets_user_id ON credit_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_wallet_id ON credit_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_generation_id ON credit_transactions(generation_id);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_job_id ON generations(job_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_credit_wallets_updated_at
  BEFORE UPDATE ON credit_wallets
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_generations_updated_at
  BEFORE UPDATE ON generations
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Function to create profile and wallet on user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Create credit wallet with 10 free credits for trial
  INSERT INTO public.credit_wallets (user_id, balance, package_type)
  VALUES (NEW.id, 10, 'trial');
  
  -- Record the initial credit grant
  INSERT INTO public.credit_transactions (user_id, wallet_id, amount, type, description)
  SELECT 
    NEW.id,
    w.id,
    10,
    'purchase',
    'Hoş geldin! 10 ücretsiz kredi'
  FROM public.credit_wallets w
  WHERE w.user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW 
      EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;/*
  # Fix User Registration Issues

  1. Triggers
    - Create trigger to handle new user registration
    - Automatically create profile and credit wallet
    
  2. Functions
    - Update handle_new_user function
    - Add proper error handling
    
  3. Security
    - Ensure RLS policies work correctly
    - Fix any permission issues
*/

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, full_name, company_name, phone, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    NOW(),
    NOW()
  );

  -- Insert into credit_wallets table with 10 free credits
  INSERT INTO public.credit_wallets (id, user_id, balance, package_type, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    10,
    'trial',
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure RLS policies are correct for profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure RLS policies are correct for credit_wallets  
DROP POLICY IF EXISTS "Users can insert own wallet" ON credit_wallets;
CREATE POLICY "Users can insert own wallet"
  ON credit_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add policy to allow service role to insert (for triggers)
CREATE POLICY "Service role can insert profiles"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can insert wallets"
  ON credit_wallets
  FOR INSERT
  TO service_role
  WITH CHECK (true);/*
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
  
END $$;/*
  # Create Admin Panel Tables

  1. New Tables
    - `admin_users` - Fixed admin login credentials
    - `contact_messages` - Contact form messages
    - `site_content` - Editable site content
    - `admin_logs` - Track admin actions
  
  2. Security
    - Enable RLS on all tables
    - Add policies for admin access only
    
  3. Functions
    - Helper functions for admin operations
*/

-- Admin users table (fixed admin credentials)
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  subject text,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz,
  read_by uuid REFERENCES admin_users(id)
);

-- Site content table (editable content)
CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  key text NOT NULL,
  content_type text NOT NULL DEFAULT 'text', -- text, html, image, json
  value text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  updated_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(section, key)
);

-- Admin logs table (track admin actions)
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES admin_users(id),
  action text NOT NULL,
  target_type text NOT NULL, -- user, credit, message, content
  target_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Admin users policies (only admins can access)
CREATE POLICY "Admins can read admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.id = auth.uid() AND au.is_active = true
  ));

CREATE POLICY "Admins can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.id = auth.uid() AND au.is_active = true
  ));

-- Contact messages policies
CREATE POLICY "Admins can read contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.id = auth.uid() AND au.is_active = true
  ));

CREATE POLICY "Admins can update contact messages"
  ON contact_messages FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.id = auth.uid() AND au.is_active = true
  ));

CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Site content policies
CREATE POLICY "Anyone can read active site content"
  ON site_content FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage site content"
  ON site_content FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.id = auth.uid() AND au.is_active = true
  ));

-- Admin logs policies
CREATE POLICY "Admins can read admin logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.id = auth.uid() AND au.is_active = true
  ));

CREATE POLICY "Admins can insert admin logs"
  ON admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.id = auth.uid() AND au.is_active = true
  ));

-- Triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, full_name) VALUES 
('admin@aivisualstudio.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator')
ON CONFLICT (email) DO NOTHING;

-- Insert default site content
INSERT INTO site_content (section, key, content_type, value, description) VALUES 
('hero', 'title', 'text', 'AI ile Ürün Fotoğrafçılığı Artık Çok Kolay', 'Ana sayfa başlık'),
('hero', 'subtitle', 'text', 'Mobilya, aksesuar ve takı ürünlerinizi profesyonel kalitede görsellere dönüştürün. Yapay zeka teknolojisi ile saniyeler içinde e-ticaret siteniz için mükemmel fotoğraflar.', 'Ana sayfa alt başlık'),
('hero', 'cta_primary', 'text', '10 Ücretsiz Kredi ile Başla', 'Ana buton metni'),
('hero', 'cta_secondary', 'text', 'Fiyatlandırmayı İncele', 'İkincil buton metni'),
('features', 'title', 'text', 'Neden AI Visual Studio?', 'Özellikler başlığı'),
('features', 'subtitle', 'text', 'E-ticaret işletmeniz için özel olarak tasarlanmış AI teknolojisi', 'Özellikler alt başlığı'),
('contact', 'title', 'text', 'Bizimle İletişime Geçin', 'İletişim başlığı'),
('contact', 'subtitle', 'text', 'Sorularınız mı var? Size yardımcı olmaktan mutluluk duyarız', 'İletişim alt başlığı'),
('cta', 'title', 'text', 'E-ticaret Başarınızı Artırın', 'Son CTA başlığı'),
('cta', 'subtitle', 'text', 'Profesyonel ürün fotoğrafları ile satışlarınızı artırın. 10 ücretsiz kredi ile hemen başlayın!', 'Son CTA alt başlığı'),
('cta', 'button', 'text', 'Ücretsiz Hesap Oluştur', 'Son CTA buton metni')
ON CONFLICT (section, key) DO NOTHING;/*
  # Create settings table for admin panel

  1. New Tables
    - `settings`
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `value` (text)
      - `description` (text)
      - `updated_by` (uuid, references admin_users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `settings` table
    - Add policy for admin access only
*/

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Admin can manage all settings
CREATE POLICY "Admins can manage settings"
  ON settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('site_name', 'AI Visual Studio', 'Site adı'),
  ('site_description', 'Mobilya, aksesuar ve takı satıcıları için AI tabanlı görsel ve video üretim platformu', 'Site açıklaması'),
  ('support_email', 'destek@aivisualstudio.com', 'Destek e-postası'),
  ('max_credits_per_user', '1000', 'Kullanıcı başına maksimum kredi'),
  ('default_trial_credits', '10', 'Varsayılan deneme kredisi'),
  ('maintenance_mode', 'false', 'Bakım modu'),
  ('allow_registrations', 'true', 'Yeni kayıtlara izin ver'),
  ('email_notifications', 'true', 'E-posta bildirimleri')
ON CONFLICT (key) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();/*
  # Create Users Table for Credit System

  1. New Tables
    - `users`
      - `id` (uuid, primary key, auto-generated)
      - `email` (text, unique, not null)
      - `credits_balance` (integer, default 0)
      - `credits_expire_at` (timestamptz, nullable)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on users table
    - Add policies for user access
    
  3. Indexes
    - Email index for fast lookups
    - Credits balance index for queries
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  credits_balance integer DEFAULT 0 NOT NULL,
  credits_expire_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = email);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_credits_balance ON users(credits_balance);
CREATE INDEX IF NOT EXISTS idx_users_credits_expire_at ON users(credits_expire_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- Function to handle new user registration (gives 10 free credits)
CREATE OR REPLACE FUNCTION handle_new_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (email, credits_balance, created_at, updated_at)
  VALUES (
    NEW.email,
    10, -- 10 free credits for new users
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;
CREATE TRIGGER on_auth_user_created_simple
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user_registration();/*
  # Migrate to Single Credit System

  ## Overview
  This migration consolidates the dual credit system into a single `users` table.
  Previously, credits were split between `credit_wallets` and `users` tables,
  causing inconsistencies.

  ## Changes
  1. Data Migration
    - Copy all credit data from `credit_wallets` to `users` table
    - Match users by email from profiles table
    - Preserve existing credit balances
    
  2. Update References
    - Update `credit_transactions` to reference `users` table
    - Add user_email field to credit_transactions for easier tracking
    
  3. Cleanup
    - Drop `credit_wallets` table and related policies
    - Remove old trigger that creates credit_wallets
    
  4. Security
    - Update RLS policies for new structure
    - Ensure all access patterns work correctly
*/

-- Step 1: Ensure users table has all necessary data
-- Migrate credit_wallets data to users table
INSERT INTO users (email, credits_balance, created_at, updated_at)
SELECT 
  p.email,
  cw.balance,
  cw.created_at,
  cw.updated_at
FROM credit_wallets cw
JOIN profiles p ON p.id = cw.user_id
ON CONFLICT (email) 
DO UPDATE SET 
  credits_balance = EXCLUDED.credits_balance,
  updated_at = EXCLUDED.updated_at;

-- Step 2: Add user_email to credit_transactions for easier querying
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'credit_transactions' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE credit_transactions ADD COLUMN user_email text;
  END IF;
END $$;

-- Update existing credit_transactions with email
UPDATE credit_transactions ct
SET user_email = p.email
FROM profiles p
WHERE ct.user_id = p.id AND ct.user_email IS NULL;

-- Step 3: Drop old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Step 4: Create new unified user creation function
CREATE OR REPLACE FUNCTION handle_unified_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create user with 10 free credits
  INSERT INTO public.users (email, credits_balance, created_at, updated_at)
  VALUES (
    NEW.email,
    10,
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created_unified
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_unified_new_user();

-- Step 5: Update RLS policies for users table
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Step 6: Add anon/public policy for API access
CREATE POLICY "Allow anonymous read for API"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Step 7: Drop credit_wallets table and all related objects
DROP TRIGGER IF EXISTS update_credit_wallets_updated_at ON credit_wallets;
DROP POLICY IF EXISTS "Users can read own wallet" ON credit_wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON credit_wallets;
DROP POLICY IF EXISTS "Users can insert own wallet" ON credit_wallets;
DROP POLICY IF EXISTS "Service role can insert wallets" ON credit_wallets;

-- Make wallet_id nullable in credit_transactions (for backward compatibility)
ALTER TABLE credit_transactions ALTER COLUMN wallet_id DROP NOT NULL;

-- Drop the credit_wallets table
DROP TABLE IF EXISTS credit_wallets CASCADE;

-- Step 8: Create index on user_email in credit_transactions
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_email ON credit_transactions(user_email);

-- Step 9: Add helpful comment
COMMENT ON TABLE users IS 'Central users table with credit balance. This is the single source of truth for user credits.';/*
  # Fix Users Table RLS Policies

  ## Problem
  The RLS policies for the `users` table are causing issues because they reference
  `auth.users` in a subquery, which creates a table name conflict with the public.users table.

  ## Solution
  Update the RLS policies to use proper table aliasing and simpler authentication checks.

  ## Changes
  1. Drop existing RLS policies
  2. Create new policies with proper authentication checks
  3. Use auth.jwt() for email comparison to avoid subquery issues
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Allow anonymous read for API" ON users;

-- Create new policies with proper authentication
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'));

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'))
  WITH CHECK (email = (auth.jwt() ->> 'email'));

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (email = (auth.jwt() ->> 'email'));

-- Allow anonymous read for API (for external webhook access)
CREATE POLICY "Allow anonymous read for API"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role has full access"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE users IS 'Central users table with credit balance. Single source of truth for user credits. RLS enabled with email-based authentication.';/*
  # Add Admin Access Policies

  ## Overview
  Admin panel needs to read all users and profiles data.
  This migration adds anon read access to profiles table for admin functionality.

  ## Changes
  1. Add anon read policy to profiles table (for admin panel)
  2. Ensure users table already has anon read access
  
  ## Security Note
  - Anon access is read-only
  - Write operations still require authentication
  - This is needed for admin dashboard to function
*/

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Allow anon read for admin" ON profiles;

-- Add anon read policy to profiles table
CREATE POLICY "Allow anon read for admin"
  ON profiles
  FOR SELECT
  TO anon
  USING (true);

-- Ensure profiles has proper indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

COMMENT ON POLICY "Allow anon read for admin" ON profiles IS 'Allows admin panel to read all user profiles. Admin auth is handled at application level.';/*
  # Create processed_webhooks table for webhook idempotency
  
  1. New Tables
    - `processed_webhooks`
      - `id` (uuid, primary key)
      - `event_key` (text, unique) - Unique identifier for webhook event
      - `processed_at` (timestamptz) - When the webhook was processed
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `processed_webhooks` table
    - Add policy for service role to manage webhooks
  
  3. Purpose
    - Prevents duplicate webhook processing (idempotency)
    - Stores unique event keys from Gumroad webhooks
*/

CREATE TABLE IF NOT EXISTS processed_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key text UNIQUE NOT NULL,
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE processed_webhooks ENABLE ROW LEVEL SECURITY;

-- Service role can manage all webhook records
CREATE POLICY "Service role can manage webhooks"
  ON processed_webhooks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_event_key 
  ON processed_webhooks(event_key);/*
  # Create credit_ledger table for tracking credit movements
  
  1. New Tables
    - `credit_ledger`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `delta` (integer) - Credit change amount (positive or negative)
      - `reason` (text) - Reason for credit change
      - `ref` (text) - Reference identifier (e.g., product slug, transaction id)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `credit_ledger` table
    - Users can view their own ledger entries
    - Service role can insert entries
  
  3. Purpose
    - Track all credit movements for audit and history
    - Support Gumroad webhook credit assignments
*/

CREATE TABLE IF NOT EXISTS credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  reason text NOT NULL,
  ref text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

-- Users can view their own ledger entries
CREATE POLICY "Users can view own ledger"
  ON credit_ledger
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Service role can insert ledger entries
CREATE POLICY "Service role can insert ledger"
  ON credit_ledger
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_id 
  ON credit_ledger(user_id);

-- Create index for created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_credit_ledger_created_at 
  ON credit_ledger(created_at DESC);/*
  # Add Welcome Credits Trigger

  1. Changes
    - Creates a trigger function that automatically gives 10 free trial credits to new users
    - Trigger fires after INSERT on auth.users table
    - Credits are added to the users table
    - Transaction is logged in credit_ledger

  2. Security
    - Trigger runs with SECURITY DEFINER privileges
    - Only fires on INSERT events
    - Prevents duplicate credits with ON CONFLICT handling
*/

-- Create trigger function to assign welcome credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert new user with 10 trial credits
  INSERT INTO public.users (
    id,
    email,
    credits_balance,
    plan_code,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    10,
    'trial',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Log the welcome credits in ledger
  INSERT INTO public.credit_ledger (
    user_id,
    delta,
    reason,
    ref
  )
  VALUES (
    NEW.id,
    10,
    'welcome_bonus',
    'trial_signup'
  );

  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
/*
  # Content Management System Tables

  1. New Tables
    - `site_content` - Manages hero, features, CTA sections
    - `portfolio_items` - Manages reference works/showcase items
    - `testimonials` - Manages customer testimonials
    - `site_stats` - Manages statistics displayed on homepage
    - `features` - Manages feature items

  2. Security
    - Enable RLS on all tables
    - Public read access for all content
    - Admin-only write access

  3. Data Structure
    - All tables have proper timestamps
    - Support for ordering/sorting
    - Image URL storage
    - Active/inactive status flags
*/

-- Site Content Table (Hero, CTA, etc.)
CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  key text NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(section, key)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content"
  ON public.site_content FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can manage site content"
  ON public.site_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Portfolio/Reference Items Table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  before_image_url text NOT NULL,
  after_image_url text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active portfolio items"
  ON public.portfolio_items FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage portfolio items"
  ON public.portfolio_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL,
  image_url text,
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active testimonials"
  ON public.testimonials FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage testimonials"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Site Stats Table
CREATE TABLE IF NOT EXISTS public.site_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  number text NOT NULL,
  icon text NOT NULL,
  icon_color text DEFAULT 'blue',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active stats"
  ON public.site_stats FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage stats"
  ON public.site_stats FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Features Table
CREATE TABLE IF NOT EXISTS public.features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  icon_color text DEFAULT 'blue',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active features"
  ON public.features FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage features"
  ON public.features FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default site content
INSERT INTO public.site_content (section, key, value, description) VALUES
  ('hero', 'badge_text', 'Türkiye''nin #1 AI Görsel Platformu', 'Ana sayfa badge metni'),
  ('hero', 'title_gradient', 'AI ile Ürün Fotoğrafçılığı', 'Hero başlık (renkli kısım)'),
  ('hero', 'title_normal', 'Artık Çok Kolay', 'Hero başlık (normal kısım)'),
  ('hero', 'subtitle', 'Mobilya, aksesuar ve takı ürünlerinizi profesyonel kalitede görsellere dönüştürün. Yapay zeka teknolojisi ile saniyeler içinde e-ticaret siteniz için mükemmel fotoğraflar.', 'Hero alt başlık'),
  ('hero', 'cta_primary', '10 Ücretsiz Kredi ile Başla', 'Ana CTA butonu'),
  ('hero', 'cta_secondary', 'Fiyatlandırmayı İncele', 'İkincil CTA butonu'),
  ('portfolio', 'section_title', 'Referans Çalışmalarımız', 'Referans bölümü başlık'),
  ('portfolio', 'section_subtitle', 'AI Visual Studio ile dönüştürülen gerçek ürün fotoğrafları', 'Referans bölümü alt başlık'),
  ('testimonials', 'section_title', 'Müşterilerimiz Ne Diyor?', 'Testimonial bölümü başlık'),
  ('testimonials', 'section_subtitle', 'Binlerce e-ticaret işletmesi AI Visual Studio ile başarıya ulaştı', 'Testimonial bölümü alt başlık')
ON CONFLICT (section, key) DO NOTHING;

-- Insert default portfolio items
INSERT INTO public.portfolio_items (title, description, category, before_image_url, after_image_url, display_order) VALUES
  ('Modern Koltuk Takımı', 'Ev ortamından profesyonel stüdyo görünümüne dönüştürüldü', 'Mobilya', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2', 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2', 1),
  ('Altın Yüzük Koleksiyonu', 'Basit fotoğraftan lüks mücevher sunumuna', 'Takı', 'https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2', 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2', 2),
  ('Deri Çanta Koleksiyonu', 'Günlük fotoğraftan premium ürün görseline', 'Aksesuar', 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2', 'https://images.pexels.com/photos/1350560/pexels-photo-1350560.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2', 3)
ON CONFLICT DO NOTHING;

-- Insert default testimonials
INSERT INTO public.testimonials (name, company, image_url, rating, text, display_order) VALUES
  ('Ahmet Yılmaz', 'Mobilya Dünyası', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2', 5, 'AI Visual Studio sayesinde ürün fotoğraflarımızın kalitesi inanılmaz arttı. Müşteri memnuniyeti %40 yükseldi!', 1),
  ('Zeynep Kaya', 'Takı Atölyesi', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2', 5, 'Takılarımızın detaylarını mükemmel şekilde yakalıyor. Profesyonel fotoğrafçıya ihtiyacım kalmadı.', 2),
  ('Mehmet Özkan', 'Ev Dekorasyon', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2', 5, 'E-ticaret sitemizin dönüşüm oranı %60 arttı. Müşteriler artık ürünleri daha net görebiliyor.', 3)
ON CONFLICT DO NOTHING;

-- Insert default stats
INSERT INTO public.site_stats (label, number, icon, icon_color, display_order) VALUES
  ('Üretilen Görsel', '50,000+', 'Camera', 'blue', 1),
  ('Mutlu Müşteri', '5,000+', 'Users', 'green', 2),
  ('Video Üretimi', '15,000+', 'Video', 'purple', 3),
  ('Memnuniyet Oranı', '%95', 'TrendingUp', 'orange', 4)
ON CONFLICT DO NOTHING;

-- Insert default features
INSERT INTO public.features (title, description, icon, icon_color, display_order) VALUES
  ('Yapay Zeka Destekli', 'En son AI teknolojisi ile otomatik görsel iyileştirme', 'Sparkles', 'blue', 1),
  ('Hızlı İşlem', 'Saniyeler içinde profesyonel sonuçlar', 'Zap', 'green', 2),
  ('Güvenli Platform', 'Tüm verileriniz şifreli ve güvende', 'Shield', 'purple', 3),
  ('7/24 Erişim', 'İstediğiniz zaman, istediğiniz yerden', 'Clock', 'orange', 4)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_items_active_order ON public.portfolio_items(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_active_order ON public.testimonials(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_site_stats_active_order ON public.site_stats(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_features_active_order ON public.features(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_site_content_section ON public.site_content(section);
-- Site Content Table (Hero, CTA, etc.)
CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  key text NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(section, key)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content"
  ON public.site_content FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can manage site content"
  ON public.site_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Portfolio/Reference Items Table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  before_image_url text NOT NULL,
  after_image_url text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active portfolio items"
  ON public.portfolio_items FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage portfolio items"
  ON public.portfolio_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL,
  image_url text,
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active testimonials"
  ON public.testimonials FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage testimonials"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Site Stats Table
CREATE TABLE IF NOT EXISTS public.site_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  number text NOT NULL,
  icon text NOT NULL,
  icon_color text DEFAULT 'blue',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active stats"
  ON public.site_stats FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage stats"
  ON public.site_stats FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Features Table
CREATE TABLE IF NOT EXISTS public.features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  icon_color text DEFAULT 'blue',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active features"
  ON public.features FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage features"
  ON public.features FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default site content
INSERT INTO public.site_content (section, key, value, description) VALUES
  ('hero', 'badge_text', 'Türkiye''nin #1 AI Görsel Platformu', 'Ana sayfa badge metni'),
  ('hero', 'title_gradient', 'AI ile Ürün Fotoğrafçılığı', 'Hero başlık (renkli kısım)'),
  ('hero', 'title_normal', 'Artık Çok Kolay', 'Hero başlık (normal kısım)'),
  ('hero', 'subtitle', 'Mobilya, aksesuar ve takı ürünlerinizi profesyonel kalitede görsellere dönüştürün. Yapay zeka teknolojisi ile saniyeler içinde e-ticaret siteniz için mükemmel fotoğraflar.', 'Hero alt başlık'),
  ('hero', 'cta_primary', '10 Ücretsiz Kredi ile Başla', 'Ana CTA butonu'),
  ('hero', 'cta_secondary', 'Fiyatlandırmayı İncele', 'İkincil CTA butonu'),
  ('portfolio', 'section_title', 'Referans Çalışmalarımız', 'Referans bölümü başlık'),
  ('portfolio', 'section_subtitle', 'AI Visual Studio ile dönüştürülen gerçek ürün fotoğrafları', 'Referans bölümü alt başlık'),
  ('testimonials', 'section_title', 'Müşterilerimiz Ne Diyor?', 'Testimonial bölümü başlık'),
  ('testimonials', 'section_subtitle', 'Binlerce e-ticaret işletmesi AI Visual Studio ile başarıya ulaştı', 'Testimonial bölümü alt başlık')
ON CONFLICT (section, key) DO NOTHING;

-- Insert default portfolio items
INSERT INTO public.portfolio_items (title, description, category, before_image_url, after_image_url, display_order) VALUES
  ('Modern Koltuk Takımı', 'Ev ortamından profesyonel stüdyo görünümüne dönüştürüldü', 'Mobilya', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2', 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2', 1),
  ('Altın Yüzük Koleksiyonu', 'Basit fotoğraftan lüks mücevher sunumuna', 'Takı', 'https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2', 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2', 2),
  ('Deri Çanta Koleksiyonu', 'Günlük fotoğraftan premium ürün görseline', 'Aksesuar', 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2', 'https://images.pexels.com/photos/1350560/pexels-photo-1350560.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2', 3)
ON CONFLICT DO NOTHING;

-- Insert default testimonials
INSERT INTO public.testimonials (name, company, image_url, rating, text, display_order) VALUES
  ('Ahmet Yılmaz', 'Mobilya Dünyası', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2', 5, 'AI Visual Studio sayesinde ürün fotoğraflarımızın kalitesi inanılmaz arttı. Müşteri memnuniyeti %40 yükseldi!', 1),
  ('Zeynep Kaya', 'Takı Atölyesi', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2', 5, 'Takılarımızın detaylarını mükemmel şekilde yakalıyor. Profesyonel fotoğrafçıya ihtiyacım kalmadı.', 2),
  ('Mehmet Özkan', 'Ev Dekorasyon', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2', 5, 'E-ticaret sitemizin dönüşüm oranı %60 arttı. Müşteriler artık ürünleri daha net görebiliyor.', 3)
ON CONFLICT DO NOTHING;

-- Insert default stats
INSERT INTO public.site_stats (label, number, icon, icon_color, display_order) VALUES
  ('Üretilen Görsel', '50,000+', 'Camera', 'blue', 1),
  ('Mutlu Müşteri', '5,000+', 'Users', 'green', 2),
  ('Video Üretimi', '15,000+', 'Video', 'purple', 3),
  ('Memnuniyet Oranı', '%95', 'TrendingUp', 'orange', 4)
ON CONFLICT DO NOTHING;

-- Insert default features
INSERT INTO public.features (title, description, icon, icon_color, display_order) VALUES
  ('Yapay Zeka Destekli', 'En son AI teknolojisi ile otomatik görsel iyileştirme', 'Sparkles', 'blue', 1),
  ('Hızlı İşlem', 'Saniyeler içinde profesyonel sonuçlar', 'Zap', 'green', 2),
  ('Güvenli Platform', 'Tüm verileriniz şifreli ve güvende', 'Shield', 'purple', 3),
  ('7/24 Erişim', 'İstediğiniz zaman, istediğiniz yerden', 'Clock', 'orange', 4)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_items_active_order ON public.portfolio_items(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_active_order ON public.testimonials(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_site_stats_active_order ON public.site_stats(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_features_active_order ON public.features(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_site_content_section ON public.site_content(section);