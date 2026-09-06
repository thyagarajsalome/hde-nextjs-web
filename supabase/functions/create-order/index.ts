import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Updated PLANS dictionary to match frontend IDs and amounts exactly
const PLANS: Record<string, { amount: number, currency: string }> = {
  // India Plans (INR - paise)
  "5_credits": { amount: 19900, currency: "INR" },
  "10_credits": { amount: 34900, currency: "INR" },
  "pro": { amount: 99900, currency: "INR" },
  
  // USA Plans (USD - cents)
  "usa_basic": { amount: 999, currency: "USD" }, // $9.99
  "usa_standard": { amount: 2499, currency: "USD" }, // $24.99
  "usa_pro": { amount: 5999, currency: "USD" } // $59.99
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header found');

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) throw new Error('Session expired. Please log out and log back in.');

    const body = await req.json().catch(() => ({}));
    const planId = body.planId;
    
    // Get the amount and currency from the PLANS object
    const plan = PLANS[planId as string];

    if (!plan) {
      throw new Error(`Invalid Plan ID: ${planId}. Please check your configuration.`);
    }

    const key_id = Deno.env.get('RAZORPAY_KEY_ID');
    const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!key_id || !key_secret) {
      throw new Error("Razorpay keys are missing in Supabase Secrets!");
    }

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + btoa(`${key_id}:${key_secret}`)
      },
      body: JSON.stringify({
        amount: plan.amount,
        currency: plan.currency,
        receipt: `rcpt_${user.id.slice(0, 10)}`
      })
    });

    const responseData = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error("Razorpay API failure:", responseData);
      throw new Error(`Razorpay API Error: ${responseData.error?.description || JSON.stringify(responseData)}`);
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Create Order Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // Error status
    });
  }
});
// Trigger deploy
