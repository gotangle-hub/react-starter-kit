import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const ZIINA_API = 'https://api-v2.ziina.com/api/payment_intent';

/**
 * Server-side price catalog (AED minor units / "fils").
 * Mirrors src/lib/plans.ts and src/pages/studio/PlansCombined.tsx.
 * Any client-supplied amount is IGNORED — only the value here is charged.
 */
const PLAN_PRICES_MINOR: Record<string, { amount: number; currency: string }> = {
  'designer-pro-monthly': { amount: 6000,  currency: 'AED' },
  'designer-pro-annual':  { amount: 69000, currency: 'AED' },
  'studio-lite-monthly':  { amount: 19900, currency: 'AED' },
  'studio-monthly':       { amount: 39900, currency: 'AED' },
  'studio-plus-monthly':  { amount: 69900, currency: 'AED' },
  'client-pro-monthly':   { amount: 12000, currency: 'AED' },
  'business-monthly':     { amount: 32000, currency: 'AED' },
};

/** Boost pricing formula — must match src/pages/app/Promote.tsx. */
const BOOST_DURATION_MULT: Record<number, number> = {
  3: 0.5,
  7: 1,
  14: 1.8,
};
const BOOST_BASE_AED = 40;

function priceForBoost(durationDays: number, dailyBudgetMinor: number): number | null {
  const mult = BOOST_DURATION_MULT[durationDays];
  if (mult === undefined) return null;
  const budgetMajor = Math.round(dailyBudgetMinor / 100);
  // base * mult + budget * 0.2 (AED) → minor units
  const totalAed = Math.round(BOOST_BASE_AED * mult + budgetMajor * 0.2);
  return totalAed * 100;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('ZIINA_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ZIINA_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { kind, reference, message, success_url, cancel_url, failure_url, test, boost } = body;

    if (!kind || !reference || (kind !== 'plan' && kind !== 'boost')) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- Resolve server-authoritative price + currency ----
    let amount: number;
    let currency: string;

    if (kind === 'plan') {
      const entry = PLAN_PRICES_MINOR[reference];
      if (!entry) {
        return new Response(JSON.stringify({ error: 'Unknown plan reference' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      amount = entry.amount;
      currency = entry.currency;
    } else {
      // boost
      if (!boost || typeof boost !== 'object' ||
          !['profile','post','callout','community','creator'].includes(boost.boost_kind) ||
          !boost.product_id || !boost.product_name ||
          !Number.isInteger(boost.duration_days) || boost.duration_days <= 0 ||
          !Number.isInteger(boost.daily_budget_minor) || boost.daily_budget_minor < 0) {
        return new Response(JSON.stringify({ error: 'Invalid boost payload' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const computed = priceForBoost(boost.duration_days, boost.daily_budget_minor);
      if (computed === null || computed <= 0) {
        return new Response(JSON.stringify({ error: 'Unsupported boost configuration' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      amount = computed;
      currency = 'AED';
    }

    // If client sent an amount, it must match — defence in depth.
    if (body.amount !== undefined && body.amount !== amount) {
      return new Response(JSON.stringify({ error: 'Amount mismatch' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (body.currency !== undefined && body.currency !== currency) {
      return new Response(JSON.stringify({ error: 'Currency mismatch' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ziinaRes = await fetch(ZIINA_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency_code: currency,
        message: message ?? `Tangle · ${reference}`,
        success_url,
        cancel_url,
        failure_url: failure_url ?? cancel_url,
        test: test ?? false,
      }),
    });

    const intent = await ziinaRes.json();
    if (!ziinaRes.ok) {
      console.error('Ziina error', intent);
      return new Response(JSON.stringify({ error: 'Ziina request failed', detail: intent }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert order using service role to bypass RLS for write of intent id
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    await admin.from('orders').insert({
      user_id: user.id,
      kind, reference, currency, amount,
      status: 'pending',
      ziina_intent_id: intent.id,
      ziina_redirect_url: intent.redirect_url,
      metadata: { embedded_url: intent.embedded_url, boost: boost ?? null },
    });

    // For boost payments, create a pending boost row linked to this intent.
    if (kind === 'boost' && boost) {
      const { error: boostErr } = await admin.from('boosts').insert({
        owner_id: user.id,
        kind: boost.boost_kind,
        target_id: boost.target_id ?? null,
        product_id: boost.product_id,
        product_name: boost.product_name,
        audience: boost.audience ?? 'Everyone',
        duration_days: boost.duration_days,
        daily_budget_minor: boost.daily_budget_minor ?? 0,
        total_minor: amount,
        currency,
        status: 'pending',
        ziina_intent_id: intent.id,
      });
      if (boostErr) console.error('boost insert error', boostErr);
    }

    return new Response(JSON.stringify({
      id: intent.id,
      redirect_url: intent.redirect_url,
      amount,
      currency,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
