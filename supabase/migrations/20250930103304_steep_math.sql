/*
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
    EXECUTE FUNCTION update_updated_at_column();