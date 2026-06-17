import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface Body {
  kind: "plan" | "boost";
  reference: string;
  currency?: string;
  total: number; // minor units (fils)
  description?: string;
  success_url?: string;
  cancel_url?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("ZIINA_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Payment provider not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    if (!body || typeof body.total !== "number" || body.total <= 0 || !body.reference) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const origin = req.headers.get("origin") ?? "";
    const successUrl = body.success_url ?? `${origin}/app/payment-success?ref=${encodeURIComponent(body.reference)}`;
    const cancelUrl = body.cancel_url ?? `${origin}/app/checkout?cancelled=1`;

    const ziinaRes = await fetch("https://api-v2.ziina.com/api/payment_intent", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: body.total,
        currency_code: (body.currency ?? "AED").toUpperCase(),
        message: body.description ?? `Tangle ${body.kind}: ${body.reference}`,
        success_url: successUrl,
        cancel_url: cancelUrl,
        failure_url: cancelUrl,
        test: false,
      }),
    });

    const data = await ziinaRes.json().catch(() => ({}));
    if (!ziinaRes.ok) {
      return new Response(
        JSON.stringify({ error: data?.message ?? "Payment provider error", details: data }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        id: data.id,
        redirect_url: data.redirect_url,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
