# 💳 Kredi Sistemi Dokümantasyonu

## 🎯 Sistem Özeti

Kredi sistemi **additif (birikimli)** olarak çalışır. Yeni paket alımları mevcut kredilerin üzerine eklenir.

## 📊 Kredi Akışı

### 1. Yeni Kullanıcı Kaydı
- ✅ Otomatik **10 deneme kredisi** verilir
- Plan: `trial`
- Trigger: `handle_new_user()` (auth.users tablosunda)
- Log: `credit_ledger` → reason: `welcome_bonus`

### 2. Paket Satın Alma (Gumroad)
- ✅ **Mevcut kredilerin üzerine eklenir** (additif sistem)
- Webhook: `gumroad-webhook` edge function
- İşlem mantığı:
  ```
  Yeni Bakiye = Mevcut Bakiye + Satın Alınan Kredi
  ```

#### Paket Fiyatlandırması
| Paket | Slug | Kredi | Plan Code |
|-------|------|-------|-----------|
| Temel Paket | `temelpaket` | 60 | `basic` |
| Standart Paket | `standartpaket` | 180 | `standard` |
| Premium Paket | `premiumpaket` | 500 | `premium` |

### 3. Örnek Senaryo

```
1. Kullanıcı kaydolur
   → +10 kredi (deneme)
   → Toplam: 10 kredi

2. Temel Paket satın alır
   → +60 kredi
   → Toplam: 70 kredi

3. 50 kredi harcar
   → -50 kredi
   → Toplam: 20 kredi

4. Standart Paket satın alır
   → +180 kredi
   → Toplam: 200 kredi ✅
```

## 🔧 Teknik Detaylar

### Database Tabloları

#### `users` Tablosu
```sql
- id (uuid, pk)
- email (text, unique)
- credits_balance (integer) -- Güncel kredi bakiyesi
- plan_code (text) -- Aktif plan
- credits_expire_at (timestamptz) -- Kredi bitiş tarihi
```

#### `credit_ledger` Tablosu
```sql
- id (uuid, pk)
- user_id (uuid, fk → users)
- delta (integer) -- Kredi değişimi (+/-)
- reason (text) -- Sebep (welcome_bonus, gumroad_purchase, vb.)
- ref (text) -- Referans bilgisi
- created_at (timestamptz)
```

#### `processed_webhooks` Tablosu
```sql
- id (uuid, pk)
- event_key (text, unique) -- Gumroad sale_id
- created_at (timestamptz)
```

### Edge Functions

#### `gumroad-webhook`
**URL:** `https://rbezqujczgetsoaehfrh.supabase.co/functions/v1/gumroad-webhook?key=Zk8vQ9tP4sR6uM2xH7bYw3nLf5Cq1D0aS_V-J`

**Özellikler:**
- ✅ Form-data parse (`application/x-www-form-urlencoded`)
- ✅ Permalink extraction (URL'den slug çıkarma)
- ✅ Idempotency (aynı satış ID'si tekrar işlenmez)
- ✅ Additif kredi sistemi
- ✅ Otomatik kullanıcı oluşturma
- ✅ Credit ledger logging

**Request Format:**
```
POST /functions/v1/gumroad-webhook?key=XXX
Content-Type: application/x-www-form-urlencoded

email=user@example.com
permalink=temelpaket
sale_id=1234567890
product_name=Temel Paket
```

**Response:**
```json
{
  "success": true,
  "email": "user@example.com",
  "credits": 60,
  "plan": "basic"
}
```

### Database Triggers

#### `handle_new_user()`
```sql
-- Yeni kullanıcı kaydı sonrası çalışır
-- 10 deneme kredisi + credit_ledger kaydı
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

## 🎨 Admin Paneli

### Webhook Logları (`/admin/webhooks`)
- ✅ İşlenmiş webhook'ları görüntüle
- ✅ Kredi hareketlerini takip et
- ✅ Kullanıcı bazlı detaylar

### Kullanıcı Kredileri (`/admin/credits`)
- ✅ Manuel kredi ekleme/çıkarma
- ✅ Credit ledger entegrasyonu
- ✅ İşlem geçmişi

## 🧪 Test Senaryoları

### 1. Webhook Testi
```bash
curl -X POST "https://rbezqujczgetsoaehfrh.supabase.co/functions/v1/gumroad-webhook?key=Zk8vQ9tP4sR6uM2xH7bYw3nLf5Cq1D0aS_V-J" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "email=test@example.com" \
  --data-urlencode "permalink=temelpaket" \
  --data-urlencode "sale_id=test-123" \
  --data-urlencode "product_name=Temel Paket"
```

### 2. Additif Sistem Testi
```bash
# İlk satın alma: 60 kredi
curl ... --data-urlencode "sale_id=test-1"

# İkinci satın alma: +180 kredi = 240 toplam
curl ... --data-urlencode "permalink=standartpaket" --data-urlencode "sale_id=test-2"
```

### 3. Web Testi
`run-migration.html` dosyasını tarayıcıda açın ve "Sistemi Test Et" butonuna basın.

## 🚀 Deployment

### Gumroad Webhook Ayarları
1. Gumroad Dashboard → Settings → Advanced → Webhooks
2. URL: `https://rbezqujczgetsoaehfrh.supabase.co/functions/v1/gumroad-webhook?key=Zk8vQ9tP4sR6uM2xH7bYw3nLf5Cq1D0aS_V-J`
3. "Send test ping to URL" ile test edin

### Database Migration
1. Supabase Dashboard → SQL Editor
2. `supabase/migrations/20251002120000_add_welcome_credits_trigger.sql` dosyasını yapıştırın
3. Run butonuna basın

## 📈 İzleme ve Raporlama

### Admin Dashboard
- Toplam krediler
- Aktif kullanıcılar
- Günlük satışlar
- Webhook başarı oranı

### Credit Ledger Sorguları
```sql
-- Tüm kredi hareketleri
SELECT * FROM credit_ledger ORDER BY created_at DESC;

-- Kullanıcı bazlı özet
SELECT
  user_id,
  SUM(delta) as total_credits,
  COUNT(*) as transaction_count
FROM credit_ledger
GROUP BY user_id;

-- Sebep bazlı analiz
SELECT
  reason,
  COUNT(*) as count,
  SUM(delta) as total_credits
FROM credit_ledger
GROUP BY reason;
```

## 🔒 Güvenlik

- ✅ Webhook authentication (URL key)
- ✅ Idempotency (duplicate prevention)
- ✅ RLS policies on all tables
- ✅ Service role only for admin operations
- ✅ CORS properly configured

## 🐛 Troubleshooting

### Webhook çalışmıyor
1. Gumroad URL'inin doğru olduğunu kontrol edin
2. Webhook key'in eşleştiğini doğrulayın
3. Edge function loglarını kontrol edin: Supabase Dashboard → Edge Functions → Logs

### Krediler eklenmiyor
1. `processed_webhooks` tablosunu kontrol edin (duplikasyon?)
2. `credit_ledger` tablosuna kayıt düşüyor mu?
3. `users` tablosunda `credits_balance` güncelleniyor mu?

### Yeni kullanıcılara kredi verilmiyor
1. Trigger'ın aktif olduğunu kontrol edin:
   ```sql
   SELECT * FROM information_schema.triggers
   WHERE trigger_name = 'on_auth_user_created';
   ```
2. `handle_new_user()` fonksiyonunun var olduğunu doğrulayın
3. `credit_ledger` tablosuna `welcome_bonus` kaydı düşüyor mu?

## 📞 Destek

Sorun yaşarsanız:
1. Admin paneli → Webhook Logları → Son işlemleri kontrol edin
2. Browser console'da hata var mı bakın
3. Supabase Dashboard → Logs → Hataları inceleyin
