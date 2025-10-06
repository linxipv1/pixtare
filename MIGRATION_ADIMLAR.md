# 🚀 Migration Uygulama Rehberi

## Hazır Dosya: `COMPLETE_MIGRATION.sql`

Tüm 14 migration dosyası tek bir SQL dosyasında birleştirildi.
**Toplam:** 1582 satır SQL kodu

---

## 📋 Adım Adım Uygulama

### Adım 1: SQL Editor'ü Açın

**Seçenek A - Direkt Link (Tavsiye Edilen):**
```
https://supabase.com/dashboard/project/rbezqujczgetsoaehfrh/sql/new
```
Bu linke tıklayın, direkt SQL Editor açılacak.

**Seçenek B - Manuel:**
1. https://supabase.com/dashboard adresine gidin
2. Sol menüden "SQL Editor" seçeneğine tıklayın
3. Sağ üstteki "+ New Query" butonuna tıklayın

---

### Adım 2: SQL Dosyasını Açın

**Windows:**
```
Dosya Gezgini'ni açın
Proje klasörünüze gidin
COMPLETE_MIGRATION.sql dosyasına çift tıklayın
(Notepad veya herhangi bir text editör ile açılacak)
```

**Mac:**
```
Finder'ı açın
Proje klasörünüze gidin
COMPLETE_MIGRATION.sql'e sağ tıklayın
"Open With" > "TextEdit" seçin
```

**Linux:**
```bash
cd [proje-klasörü]
gedit COMPLETE_MIGRATION.sql
# veya
nano COMPLETE_MIGRATION.sql
```

---

### Adım 3: Tüm İçeriği Kopyalayın

1. Text editörde `Ctrl+A` (Mac: `Cmd+A`) - Tümünü Seç
2. `Ctrl+C` (Mac: `Cmd+C`) - Kopyala

**Veya:**
- Dosyayı açın
- Mouse ile baştan sona kadar seçin
- Sağ tık > Copy

---

### Adım 4: SQL Editor'e Yapıştırın

1. Supabase SQL Editor sayfasına geri dönün
2. Büyük metin kutusuna tıklayın
3. `Ctrl+V` (Mac: `Cmd+V`) - Yapıştır

**Kontrol:**
- Sol altta "Lines: 1582" yazıyor olmalı
- SQL kodu editörde görünüyor olmalı

---

### Adım 5: Çalıştırın

1. Sağ alttaki **"RUN"** butonuna tıklayın (veya `Ctrl+Enter`)
2. İşlem 10-30 saniye sürebilir
3. Bekleyin...

**Başarılı Sonuç:**
```
✅ Success. No rows returned
```

**VEYA**

```
✅ Success
```

**Eğer Hata Alırsanız:**
- Hata mesajını kopyalayın
- Bana gönderin
- Birlikte çözeriz

---

### Adım 6: Tabloları Kontrol Edin

**Yöntem 1 - Table Editor:**
```
1. Sol menüden "Table Editor" seçin
2. Şu tabloları görmelisiniz:
   ✓ profiles
   ✓ users
   ✓ credit_wallets
   ✓ credit_transactions
   ✓ generations
   ✓ processed_webhooks
   ✓ credit_ledger
   ✓ site_content
   ✓ portfolio_items
   ✓ testimonials
   ✓ site_stats
   ✓ features
   ✓ contact_messages
   ✓ admin_users
   ✓ admin_logs
   ✓ settings
```

**Yöntem 2 - SQL Query:**
```sql
-- SQL Editor'de çalıştırın:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Sonuçta yukarıdaki tabloları görmelisiniz.

---

## ✅ Başarı Kontrolü

Migration başarılıysa:

### 1. Test Kullanıcısı Oluşturun

```
npm run dev
```

Tarayıcıda:
1. http://localhost:5173 açın
2. "Sign Up" tıklayın
3. Bir email ve şifre girin
4. Kayıt olun

**Beklenen:**
- ✅ Kayıt başarılı
- ✅ Dashboard açılır
- ✅ Sağ üstte "10 Kredi" görünür
- ✅ Console'da hata yok

### 2. Dashboard Kontrol

Dashboard'da şunları görmelisiniz:
- ✅ Kullanıcı adınız
- ✅ Kredi bakiyeniz (10)
- ✅ "Görsel Oluştur" butonu
- ✅ "Video Oluştur" butonu

### 3. Database Kontrolü

SQL Editor'de:
```sql
-- Kullanıcı oluştu mu?
SELECT * FROM auth.users;

-- Profil oluştu mu?
SELECT * FROM profiles;

-- Kredi verildi mi?
SELECT * FROM users;

-- Trigger çalıştı mı?
SELECT * FROM credit_transactions WHERE description LIKE '%Hoş geldin%';
```

Hepsinde veri görmelisiniz.

---

## 🐛 Sorun Giderme

### Hata: "relation already exists"

**Çözüm:** Bazı tablolar zaten var. Normal, devam edin.

### Hata: "syntax error"

**Çözüm:**
1. SQL'i tekrar kopyalayın
2. Tüm içeriği seçtiğinizden emin olun
3. Tekrar yapıştırın

### Hata: "permission denied"

**Çözüm:**
1. https://supabase.com/dashboard/project/rbezqujczgetsoaehfrh/settings/api
2. "Reset Database Password" yapın
3. Tekrar deneyin

### Tablolar görünmüyor

**Kontrol:**
1. Sol menüde "Table Editor" tıklayın
2. Üstteki dropdown'da "public" seçili mi?
3. Yenile (F5) yapın

### "No rows returned" görüyorum ama emin değilim

**Bu BAŞARILI demektir!** Migration'lar INSERT yapmaz, sadece tablo oluşturur.

Kontrol için:
```sql
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
```

Sonuç 15+ ise başarılı.

---

## 📊 Migration'ların Yaptıkları

### Migration 1-6: Temel Tablolar
- profiles, credit_wallets, generations
- RLS policies
- Indexes
- Triggers

### Migration 7: Kredi Sistemi Güncellemesi
- `users` tablosu eklendi
- `credit_wallets` deprecated edildi
- Tek tablo sistemi

### Migration 8-9: RLS Güncellemeleri
- Admin politikaları
- Kullanıcı politikaları

### Migration 10-12: Webhook & Ledger
- Gumroad webhook tablosu
- Credit ledger tablosu
- Welcome credits trigger

### Migration 13-14: İçerik Yönetimi
- Site content
- Portfolio items
- Testimonials
- Stats
- Features
- Contact messages
- Admin logs

---

## 🎯 Sonuç

Migration başarılıysa:
- ✅ 16 tablo oluşturuldu
- ✅ Tüm RLS policies aktif
- ✅ Trigger'lar çalışıyor
- ✅ Indexes optimized
- ✅ Sistem kullanıma hazır

---

## 🆘 Hala Sorun Yaşıyorsanız

1. **Screenshot alın:**
   - SQL Editor ekranı
   - Hata mesajı
   - Table Editor ekranı

2. **Bilgileri gönderin:**
   - Hangi adımda takıldınız?
   - Tam hata mesajı nedir?
   - Console'da ne görüyorsunuz?

3. **Log kontrol:**
```bash
# Terminal'de:
npm run dev

# Browser console:
Sağ tık > Inspect > Console
Hataları kopyalayın
```

---

**Hızlı Erişim:**
- SQL Editor: https://supabase.com/dashboard/project/rbezqujczgetsoaehfrh/sql/new
- Table Editor: https://supabase.com/dashboard/project/rbezqujczgetsoaehfrh/editor
- API Settings: https://supabase.com/dashboard/project/rbezqujczgetsoaehfrh/settings/api

**Dosya:** `COMPLETE_MIGRATION.sql` (proje klasöründe)
