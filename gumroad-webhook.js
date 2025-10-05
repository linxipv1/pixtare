// backend/gumroad-webhook.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Gumroad ürün slug → kredi eşleme (ürünleri ayrı açtın)
const MAP = {
  temelpaket:   { credits: 60,  plan: 'basic'    },
  standartpaket:{ credits: 180, plan: 'standard' },
  premiumpaket: { credits: 500, plan: 'premium'  },
};

function endOfThisMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    // Basit güvenlik
    if (req.query.key !== process.env.GUMROAD_WEBHOOK_KEY) {
      return res.status(401).send('Unauthorized');
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    // 1) E-posta
    const email = body.email || body?.purchase?.email || body?.buyer_email;
    if (!email) return res.status(400).send('Email missing');

    // 2) Ürün slug (permalink)
    const permalink =
      body.product_permalink ||
      body.permalink ||
      body?.purchase?.permalink ||
      (body.short_url && body.short_url.includes('/l/') ? body.short_url.split('/l/')[1] : null);

    if (!permalink) return res.status(400).send('Product permalink missing');

    // 3) Paket eşleşmesi
    const def = MAP[permalink];
    if (!def) return res.status(200).send('Ignored product');

    // 4) Idempotency (aynı olayı iki kez işlememek için)
    const rawEventKey =
      body.sale_id || body.purchase_id || body.order_number || body.subscription_id ||
      `${email}:${permalink}:${body.price || ''}`;
    const eventKey = String(rawEventKey);

    const { data: already } = await supabase
      .from('processed_webhooks')
      .select('id')
      .eq('event_key', eventKey)
      .maybeSingle();

    if (already) return res.status(200).send('Already processed');

    // 5) Kullanıcıyı bul/olustur
    let { data: user } = await supabase.from('users').select('*').eq('email', email).single();
    if (!user) {
      const { data: created, error: insErr } = await supabase
        .from('users')
        .insert({ email, credits_balance: 0 })
        .select()
        .single();
      if (insErr) throw insErr;
      user = created;
    }

    // 6) Aylık krediyi set et (carry-over yok)
    const expireAt = endOfThisMonth();
    const { error: updErr } = await supabase
      .from('users')
      .update({
        credits_balance: def.credits,
        credits_expire_at: expireAt.toISOString(),
        plan_code: def.plan,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    if (updErr) throw updErr;

    // 7) Ledger (opsiyonel)
    await supabase.from('credit_ledger').insert({
      user_id: user.id, delta: def.credits, reason: 'gumroad_renew', ref: permalink
    });

    // 8) Webhook'u işledik olarak işaretle
    await supabase.from('processed_webhooks').insert({ event_key: eventKey });

    return res.status(200).send('OK');
  } catch (e) {
    console.error('gumroad-webhook error', e);
    return res.status(500).send('Error');
  }
}
