# 🎨 Admin Panel Content Management Dokümantasyonu

## 📋 Genel Bakış

Admin paneli artık ana sayfadaki **tüm içerikleri** yönetebiliyor:
- ✅ Hero bölümü metinleri
- ✅ Referans çalışmaları (önce/sonra görselleri)
- ✅ Müşteri yorumları (testimonials)
- ✅ İstatistikler
- ✅ Özellik kartları
- ✅ CTA metinleri

## 🗄️ Database Yapısı

### 1. `site_content` Tablosu
Genel metinsel içerikleri saklar (hero, CTA, vb.)

```sql
- id (uuid)
- section (text) - hero, portfolio, testimonials, vb.
- key (text) - badge_text, title_gradient, vb.
- value (text) - Görüntülenecek metin
- description (text) - Açıklama
```

**Örnek veri:**
| Section | Key | Value |
|---------|-----|-------|
| hero | badge_text | Türkiye'nin #1 AI Görsel Platformu |
| hero | title_gradient | AI ile Ürün Fotoğrafçılığı |
| hero | cta_primary | 10 Ücretsiz Kredi ile Başla |

### 2. `portfolio_items` Tablosu
Referans çalışmaları (before/after görselleri)

```sql
- id (uuid)
- title (text) - Modern Koltuk Takımı
- description (text) - Açıklama
- category (text) - Mobilya, Takı, Aksesuar, vb.
- before_image_url (text) - Öncesi görsel URL
- after_image_url (text) - Sonrası görsel URL
- display_order (integer) - Sıralama
- is_active (boolean) - Aktif/Gizli
```

### 3. `testimonials` Tablosu
Müşteri yorumları

```sql
- id (uuid)
- name (text) - Ahmet Yılmaz
- company (text) - Mobilya Dünyası
- image_url (text) - Profil fotoğrafı
- rating (integer) - 1-5 yıldız
- text (text) - Yorum metni
- display_order (integer)
- is_active (boolean)
```

### 4. `site_stats` Tablosu
Ana sayfadaki istatistikler

```sql
- id (uuid)
- label (text) - Üretilen Görsel
- number (text) - 50,000+
- icon (text) - Camera, Users, vb.
- icon_color (text) - blue, green, purple
- display_order (integer)
- is_active (boolean)
```

### 5. `features` Tablosu
Özellik kartları

```sql
- id (uuid)
- title (text) - Yapay Zeka Destekli
- description (text) - Açıklama
- icon (text) - Sparkles, Zap, vb.
- icon_color (text)
- display_order (integer)
- is_active (boolean)
```

## 🖥️ Admin Panel Sayfaları

### 1. İçerik Yönetimi (`/admin/content`)
**Genel metinleri düzenleyin:**
- Hero bölümü başlık ve alt başlık
- CTA buton metinleri
- Badge metinleri
- Bölüm başlıkları

**Özellikler:**
- ✅ Değişiklik takibi
- ✅ Otomatik kaydetme
- ✅ Canlı önizleme
- ✅ Section bazlı gruplama

### 2. Referanslar (`/admin/portfolio`)
**Referans çalışmalarını yönetin:**
- ✅ Önce/sonra görselleri
- ✅ Kategori seçimi (Mobilya, Takı, Aksesuar, vb.)
- ✅ Sıralama
- ✅ Aktif/Gizli durumu

**İşlemler:**
- Yeni referans ekle
- Mevcut referansı düzenle
- Referans sil
- Görünürlük ayarla

**Form Alanları:**
- Başlık
- Açıklama
- Kategori
- Öncesi görsel URL
- Sonrası görsel URL
- Gösterim sırası
- Aktif/Pasif

### 3. Yorumlar (`/admin/testimonials`)
**Müşteri yorumlarını yönetin:**
- ✅ İsim ve şirket bilgisi
- ✅ Profil fotoğrafı
- ✅ Yıldız değerlendirmesi (1-5)
- ✅ Yorum metni
- ✅ Sıralama ve görünürlük

**İşlemler:**
- Yeni yorum ekle
- Yorumu düzenle
- Yorum sil
- Görünürlük ayarla

**Form Alanları:**
- İsim
- Şirket
- Profil fotoğrafı URL
- Yorum metni
- Yıldız sayısı (1-5)
- Gösterim sırası
- Aktif/Pasif

### 4. Krediler (`/admin/credits`)
**Manuel kredi işlemleri:**
- ✅ Kullanıcı bazlı kredi ekleme/çıkarma
- ✅ İşlem geçmişi
- ✅ Credit ledger entegrasyonu

### 5. Webhook Logları (`/admin/webhooks`)
**Gumroad webhook takibi:**
- ✅ İşlenmiş webhook'lar
- ✅ Kredi hareketleri
- ✅ Kullanıcı detayları

## 🚀 Kurulum ve Kullanım

### 1. Migration Çalıştırma

**Adım 1:** Supabase Dashboard'a gidin
```
https://supabase.com/dashboard
```

**Adım 2:** Projenizi seçin

**Adım 3:** SQL Editor → New Query

**Adım 4:** Migration dosyasını yapıştırın
```
supabase/migrations/20251002140000_create_content_management_tables.sql
```

**Adım 5:** "Run" butonuna basın

**Alternatif:** `run-content-migration.html` dosyasını tarayıcıda açın

### 2. Admin Panele Giriş

```
URL: /admin/login
Email: admin@aivisualstudio.com
Şifre: admin123
```

### 3. İçerik Ekleme/Düzenleme

#### Referans Eklemek:
1. `/admin/portfolio` sayfasına gidin
2. "Yeni Referans Ekle" butonuna tıklayın
3. Formu doldurun:
   - Başlık: "Modern Ofis Mobilyası"
   - Kategori: "Mobilya"
   - Öncesi görsel: Pexels veya kendi URL'iniz
   - Sonrası görsel: Pexels veya kendi URL'iniz
4. "Kaydet" butonuna tıklayın

#### Yorum Eklemek:
1. `/admin/testimonials` sayfasına gidin
2. "Yeni Yorum Ekle" butonuna tıklayın
3. Formu doldurun:
   - İsim: "Ali Veli"
   - Şirket: "E-ticaret A.Ş."
   - Profil fotoğrafı: Pexels URL
   - Yorum: "Harika bir deneyim..."
   - Yıldız: 5
4. "Kaydet" butonuna tıklayın

#### Metin Düzenlemek:
1. `/admin/content` sayfasına gidin
2. İlgili metni bulun
3. Değişiklik yapın
4. "Değişiklikleri Kaydet" butonuna tıklayın

## 🎯 Özellikler ve Avantajlar

### Tam Kontrol
- ✅ Tüm ana sayfa içerikleri tek yerden yönetiliyor
- ✅ Code değişikliği gerektirmiyor
- ✅ Anında güncelleme

### Kolay Kullanım
- ✅ Sürükle-bırak değil ama basit formlar
- ✅ Görsel önizleme
- ✅ Canlı validasyon

### Güvenlik
- ✅ RLS politikaları aktif
- ✅ Sadece authenticated kullanıcılar yazabilir
- ✅ Public okuma erişimi (aktif içerikler için)

### Performans
- ✅ Database indexleri
- ✅ Sıralı sorgular
- ✅ Sadece aktif içerikler çekiliyor

## 📊 Frontend Entegrasyonu

### Custom Hooks Kullanımı

HomePage artık custom hook'lar kullanıyor:

```typescript
import {
  useSiteContent,
  usePortfolioItems,
  useTestimonials,
  useSiteStats,
  useFeatures
} from '../hooks/useContent';

function HomePage() {
  const { getContent } = useSiteContent();
  const { items: portfolioItems } = usePortfolioItems();
  const { items: testimonials } = useTestimonials();

  // Kullanım
  const heroTitle = getContent('hero', 'title_gradient', 'Default Title');

  return (
    <div>
      <h1>{heroTitle}</h1>

      {portfolioItems.map(item => (
        <PortfolioCard key={item.id} {...item} />
      ))}

      {testimonials.map(item => (
        <TestimonialCard key={item.id} {...item} />
      ))}
    </div>
  );
}
```

### Varsayılan Değerler (Fallback)

Database boş veya erişilemiyor ise, kod içinde fallback değerleri var:

```typescript
getContent('hero', 'title', 'AI ile Ürün Fotoğrafçılığı')
```

## 🔧 Bakım ve Güncelleme

### İçerik Güncelleme Sıklığı
- **Referanslar:** Ayda 1-2 kez yeni eklemeler
- **Yorumlar:** Her yeni müşteri sonrası
- **Metinler:** Kampanya dönemlerinde
- **İstatistikler:** 3 ayda bir güncelleme

### Görsel Yönetimi

**Önerilen Görsel Kaynakları:**
1. **Pexels.com** - Ücretsiz stok fotoğraflar
2. **Unsplash.com** - Yüksek kalite görseller
3. **Kendi görselleriniz** - Supabase Storage'a upload

**Görsel Boyutları:**
- Portfolio before/after: 600x400px
- Testimonial profil: 150x150px (kare)
- Özellik ikonları: SVG (Lucide React)

### SEO Optimizasyonu

Tüm içerikler SEO dostu:
- ✅ Anlamlı başlıklar
- ✅ Alt text desteği
- ✅ Semantic HTML
- ✅ Meta description'lar

## 🐛 Sorun Giderme

### İçerikler görünmüyor
1. Migration çalıştırıldı mı kontrol edin
2. RLS politikaları aktif mi?
3. `is_active = true` mi?
4. Browser console'da hata var mı?

### Admin panelde CRUD işlemleri çalışmıyor
1. Authenticated kullanıcı mı?
2. Supabase bağlantısı aktif mi?
3. RLS politikaları doğru mu?

### Görseller yüklenmiyor
1. URL'ler geçerli mi?
2. CORS ayarları doğru mu?
3. HTTPS kullanılıyor mu?

## 📞 Destek

Sorun yaşarsanız:
1. Browser console loglarını kontrol edin
2. Supabase Dashboard → Logs
3. Admin panel → Webhook Logları

## 🎓 Best Practices

### İçerik Yazımı
- ✅ Kısa ve öz başlıklar
- ✅ Harekete geçirici CTA'lar
- ✅ Sosyal kanıt kullanımı
- ✅ Sayısal veriler

### Görsel Seçimi
- ✅ Yüksek kalite
- ✅ Hızlı yüklenen (optimize edilmiş)
- ✅ Mobil uyumlu
- ✅ Marka kimliğine uygun

### Güncelleme Stratejisi
- ✅ A/B testing
- ✅ Kullanıcı geri bildirimleri
- ✅ Metrik takibi
- ✅ Düzenli gözden geçirme
