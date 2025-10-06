# 🚀 Migration'ları Şimdi Uygulayın!

✅ **.env dosyası güncellendi** - Gerçek Supabase credentials'ları eklendi
⚠️ **Veritabanı boş** - Migration'ları çalıştırmanız gerekiyor

## Hızlı Yöntem: Tek SQL Dosyasıyla

### Adım 1: SQL Dosyasını Açın
Proje klasöründe `COMPLETE_MIGRATION.sql` dosyasını bir text editör ile açın.

### Adım 2: Supabase SQL Editor'e Gidin
1. **Tarayıcınızda açın:** https://supabase.com/dashboard/project/rbezqujczgetsoaehfrh/sql/new
2. Veya manuel: Dashboard > SQL Editor > "New Query"

### Adım 3: SQL'i Kopyalayıp Yapıştırın
1. `COMPLETE_MIGRATION.sql` dosyasının **tüm içeriğini** kopyalayın (1582 satır)
2. SQL Editor'e yapıştırın
3. **"Run"** butonuna tıklayın (veya Ctrl+Enter)

### Adım 4: Başarıyı Kontrol Edin
SQL çalıştıktan sonra:
- ✅ "Success. No rows returned" mesajını görmelisiniz
- ⚠️ Hata görürseniz, hatayı buraya yapıştırın

### Adım 5: Tabloları Doğrulayın
1. Dashboard > **Table Editor**'e gidin
2. Sol menüde şu tabloları görmelisiniz:
   - profiles
   - users
   - generations
   - credit_transactions
   - credit_ledger
   - processed_webhooks
   - content_management

---

## Alternatif Yöntem: Tek Tek Migration Dosyaları

Eğer tek seferde hata alırsanız, migration'ları tek tek çalıştırın:

### Sırayla Çalıştırın:

```sql
1. supabase/migrations/20250927221857_tender_sunset.sql
2. supabase/migrations/20250928103628_small_coral.sql
3. supabase/migrations/20250928103838_copper_thunder.sql
4. supabase/migrations/20250930102235_twilight_torch.sql
5. supabase/migrations/20250930103304_steep_math.sql
6. supabase/migrations/20250930160147_winter_mud.sql
7. supabase/migrations/20251001191140_migrate_to_single_credit_system.sql
8. supabase/migrations/20251001203058_fix_users_rls_policies.sql
9. supabase/migrations/20251001203822_add_admin_access_policies.sql
10. supabase/migrations/20251002001238_create_processed_webhooks_table.sql
11. supabase/migrations/20251002001308_create_credit_ledger_table.sql
12. supabase/migrations/20251002120000_add_welcome_credits_trigger.sql
13. supabase/migrations/20251002140000_create_content_management_tables.sql
14. supabase/migrations/20251002140746_create_content_management_tables.sql
```

Her birini SQL Editor'de çalıştırın, sonrakine geçmeden önce başarılı olduğunu doğrulayın.

---

## ✅ Migration'lar Tamamlandıktan Sonra

### 1. Authentication Ayarları
Dashboard > **Authentication** > **Providers**:
- ✅ Email provider aktif olsun
- ⚠️ "Confirm email" kapalı olsun (development için)

### 2. Projeyi Test Edin
```bash
npm run dev
```

Tarayıcıda:
1. http://localhost:5173 adresine gidin
2. **Sign Up** ile yeni kullanıcı oluşturun
3. Otomatik **10 kredi** verildiğini kontrol edin
4. Dashboard'a giriş yapın

### 3. Admin Kullanıcı Oluşturun

İlk kullanıcınızı oluşturduktan sonra, onu admin yapmak için:

```sql
-- SQL Editor'de çalıştırın:
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

`your-email@example.com` yerine kendi email'inizi yazın.

---

## 🐛 Sorun Giderme

### "relation does not exist" hatası
- Migration'ları doğru sırada çalıştırdığınızdan emin olun
- İlk migration'dan (20250927221857_tender_sunset.sql) başlayın

### "duplicate key value" hatası
- Bazı migration'lar zaten çalışmış olabilir
- `IF NOT EXISTS` kontrollerine bakın
- O migration'ı atlayıp sonrakine geçin

### RLS policy hataları
- Migration'lar tüm RLS policy'leri otomatik kurar
- `ENABLE ROW LEVEL SECURITY` her tablo için otomatik çalışır

### Krediler verilmiyor
- `handle_unified_new_user` trigger'ının çalıştığını kontrol edin:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created_trigger';
  ```
- Trigger yoksa, `20251002120000_add_welcome_credits_trigger.sql`'i tekrar çalıştırın

---

## 📊 Veritabanı Yapısını Kontrol

SQL Editor'de çalıştırın:

```sql
-- Tüm tabloları listele
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- RLS durumunu kontrol et
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Trigger'ları listele
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

Şu sonuçları görmelisiniz:
- ✅ 7 tablo (profiles, users, generations, vs.)
- ✅ Tüm tablolarda `rowsecurity = true`
- ✅ 1 trigger (`on_auth_user_created_trigger`)

---

## ✨ Başarı Kontrol Listesi

Migration'lar başarıyla uygulandıysa:

- [ ] SQL Editor'de hata almadan çalıştı
- [ ] Table Editor'de 7 tablo görünüyor
- [ ] Yeni kullanıcı kaydı yapılabiliyor
- [ ] Yeni kullanıcıya otomatik 10 kredi veriliyor
- [ ] Login/Logout çalışıyor
- [ ] Dashboard'a erişim başarılı
- [ ] RLS tüm tablolarda aktif

---

## 🆘 Yardım Gerekirse

Hata mesajını ve hangi adımda takıldığınızı bildirin:
- SQL Editor'de aldığınız tam hata mesajı
- Hangi migration dosyasını çalıştırırken hata aldınız
- Console'da gösterilen JavaScript hataları (varsa)

**Hızlı link:** https://supabase.com/dashboard/project/rbezqujczgetsoaehfrh/sql/new
