/*
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
ON CONFLICT (section, key) DO NOTHING;