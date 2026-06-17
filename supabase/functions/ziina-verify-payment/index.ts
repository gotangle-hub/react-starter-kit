import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('ZIINA_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ZIINA_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const intentId = url.searchParams.get('id');
    if (!intentId) {
      return new Response(JSON.stringify({ error: 'Missing id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(`https://api-v2.ziina.com/api/payment_intent/${intentId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const intent = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Ziina lookup failed', detail: intent }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Map Ziina status → order status. Ziina uses statuses like
    // requires_payment_instrument / pending / completed / failed / canceled.
    const status = intent.status === 'completed' ? 'paid'
      : intent.status === 'failed' ? 'failed'
      : intent.status === 'canceled' ? 'canceled'
      : 'pending';

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    await admin.from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('ziina_intent_id', intentId);

    return new Response(JSON.stringify({ status, intent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
