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