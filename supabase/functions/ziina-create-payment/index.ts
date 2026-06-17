import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const ZIINA_API = 'https://api-v2.ziina.com/api/payment_intent';

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
    const { kind, reference, currency, amount, message, success_url, cancel_url, failure_url, test } = body;

    if (!kind || !reference || !currency || !Number.isInteger(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
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
      metadata: { embedded_url: intent.embedded_url },
    });

    return new Response(JSON.stringify({
      id: intent.id,
      redirect_url: intent.redirect_url,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
