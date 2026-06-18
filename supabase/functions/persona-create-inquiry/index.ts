// Creates a Persona inquiry for the signed-in user and returns a one-time
// hosted-flow URL they can be redirected to.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PERSONA_API = "https://api.withpersona.com/api/v1";
const PERSONA_VERSION = "2023-01-05";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get("PERSONA_API_KEY");
    const templateId = Deno.env.get("PERSONA_TEMPLATE_ID");
    if (!apiKey || !templateId) throw new Error("Persona is not configured");

    const auth = req.headers.get("Authorization") ?? "";
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Not signed in" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const redirectUri: string = body?.redirectUri || "";

    // 1. Create inquiry
    const inqRes = await fetch(`${PERSONA_API}/inquiries`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Persona-Version": PERSONA_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            "inquiry-template-id": templateId,
            "reference-id": user.id,
          },
        },
      }),
    });
    if (!inqRes.ok) {
      const t = await inqRes.text();
      throw new Error(`Persona create failed: ${inqRes.status} ${t}`);
    }
    const inqJson = await inqRes.json();
    const inquiryId: string = inqJson.data?.id;
    if (!inquiryId) throw new Error("Persona returned no inquiry id");

    // 2. Generate one-time link
    const linkRes = await fetch(`${PERSONA_API}/inquiries/${inquiryId}/generate-one-time-link`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Persona-Version": PERSONA_VERSION,
      },
    });
    if (!linkRes.ok) {
      const t = await linkRes.text();
      throw new Error(`Persona one-time-link failed: ${linkRes.status} ${t}`);
    }
    const linkJson = await linkRes.json();
    let url: string = linkJson.meta?.["one-time-link"] ?? `https://withpersona.com/verify?inquiry-id=${inquiryId}`;
    if (redirectUri) {
      url += (url.includes("?") ? "&" : "?") + "redirect-uri=" + encodeURIComponent(redirectUri);
    }

    // 3. Record submission
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    await admin.from("identity_verifications").insert({
      user_id: user.id,
      inquiry_id: inquiryId,
      status: "submitted",
      id_doc_path: "persona",
      selfie_path: "persona",
    });

    return new Response(JSON.stringify({ inquiryId, url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
