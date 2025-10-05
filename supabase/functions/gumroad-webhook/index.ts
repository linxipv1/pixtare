import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Gumroad ürün slug → kredi eşleme
const PRODUCT_MAP = {
  temelpaket: { credits: 60, plan: "basic" },
  standartpaket: { credits: 180, plan: "standard" },
  premiumpaket: { credits: 500, plan: "premium" },
};

function endOfThisMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Handle GET requests with info
    if (req.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "active",
          message: "Gumroad Webhook Endpoint",
          methods: ["POST"],
          note: "This endpoint only accepts POST requests from Gumroad"
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Only accept POST requests
    if (req.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    // Security check - validate webhook key from query params
    const url = new URL(req.url);
    const webhookKey = url.searchParams.get("key");
    const expectedKey = Deno.env.get("GUMROAD_WEBHOOK_KEY");

    if (!webhookKey || webhookKey !== expectedKey) {
      console.error("❌ Unauthorized webhook attempt");
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Parse request body
    const contentType = req.headers.get("content-type") || "";
    let body: any;

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      body = {};
      for (const [key, value] of formData.entries()) {
        body[key] = value;
      }
    } else {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    }

    console.log("📦 Gumroad webhook received:");
    console.log("   Headers:", Object.fromEntries(req.headers.entries()));
    console.log("   Body:", body);
    console.log("   Content-Type:", contentType);

    // Extract email
    const email = body.email || body?.purchase?.email || body?.buyer_email;
    if (!email) {
      console.error("❌ Email missing from webhook");
      return new Response("Email missing", {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Extract product permalink
    let permalink = body.permalink;

    // If permalink is a full URL, extract the slug
    if (permalink && permalink.includes("/l/")) {
      permalink = permalink.split("/l/")[1].split("?")[0];
    }

    // Fallback to product_permalink field
    if (!permalink && body.product_permalink) {
      if (body.product_permalink.includes("/l/")) {
        permalink = body.product_permalink.split("/l/")[1].split("?")[0];
      } else {
        permalink = body.product_permalink;
      }
    }

    if (!permalink) {
      console.error("❌ Product permalink missing");
      return new Response("Product permalink missing", {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Check if product is in our map
    const productDef = PRODUCT_MAP[permalink as keyof typeof PRODUCT_MAP];
    if (!productDef) {
      console.log(`ℹ️ Ignoring unknown product: ${permalink}`);
      return new Response("Ignored product", {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Idempotency check - use sale_id from Gumroad
    const rawEventKey = body.sale_id || body.order_number || `${email}:${permalink}:${Date.now()}`;
    const eventKey = String(rawEventKey);

    const { data: alreadyProcessed } = await supabase
      .from("processed_webhooks")
      .select("id")
      .eq("event_key", eventKey)
      .maybeSingle();

    if (alreadyProcessed) {
      console.log(`✅ Webhook already processed: ${eventKey}`);
      return new Response("Already processed", {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Find or create user
    let { data: user, error: userFetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (!user) {
      console.log(`👤 Creating new user: ${email}`);
      const { data: created, error: insErr } = await supabase
        .from("users")
        .insert({ email, credits_balance: 0 })
        .select()
        .single();

      if (insErr) {
        console.error("❌ Error creating user:", insErr);
        throw insErr;
      }
      user = created;
    }

    // Add credits to existing balance (additive system)
    const currentBalance = user.credits_balance || 0;
    const newBalance = currentBalance + productDef.credits;
    const expireAt = endOfThisMonth();

    const { error: updErr } = await supabase
      .from("users")
      .update({
        credits_balance: newBalance,
        credits_expire_at: expireAt.toISOString(),
        plan_code: productDef.plan,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updErr) {
      console.error("❌ Error updating user credits:", updErr);
      throw updErr;
    }

    console.log(`💰 Added ${productDef.credits} credits to ${email} (${currentBalance} → ${newBalance})`);

    // Log to credit ledger
    await supabase.from("credit_ledger").insert({
      user_id: user.id,
      delta: productDef.credits,
      reason: "gumroad_purchase",
      ref: permalink,
    });

    // Mark webhook as processed
    await supabase.from("processed_webhooks").insert({ event_key: eventKey });

    console.log(`✅ Webhook processed successfully for ${email}`);

    return new Response(
      JSON.stringify({
        success: true,
        email,
        credits: productDef.credits,
        plan: productDef.plan,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});