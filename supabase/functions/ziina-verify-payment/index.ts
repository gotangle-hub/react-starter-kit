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

    // ---- Require an authenticated user. ----
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    // Accept ?id=… (GET) or { id } (POST).
    let intentId: string | null = null;
    const url = new URL(req.url);
    intentId = url.searchParams.get('id');
    if (!intentId && req.method !== 'GET') {
      try {
        const body = await req.json();
        if (typeof body?.id === 'string') intentId = body.id;
      } catch { /* no body */ }
    }
    if (!intentId) {
      return new Response(JSON.stringify({ error: 'Missing id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- Scope to the caller's own order. ----
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .select('id, user_id, status')
      .eq('ziina_intent_id', intentId)
      .maybeSingle();
    if (orderErr) throw orderErr;
    if (!order || order.user_id !== userId) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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

    const status = intent.status === 'completed' ? 'paid'
      : intent.status === 'failed' ? 'failed'
      : intent.status === 'canceled' ? 'canceled'
      : 'pending';

    await admin.from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('ziina_intent_id', intentId)
      .eq('user_id', userId);

    if (status === 'paid') {
      await admin.rpc('activate_boost_by_intent', { _intent_id: intentId });
    } else if (status === 'failed' || status === 'canceled') {
      await admin.rpc('fail_boost_by_intent', { _intent_id: intentId, _status: status });
    }

    return new Response(JSON.stringify({ status }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
