// Polls Persona for the latest status of a given inquiry. When approved,
// flips the user's identity_verifications row + profiles.verified_at so the
// yellow tick appears across the app.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PERSONA_API = "https://api.withpersona.com/api/v1";
const PERSONA_VERSION = "2023-01-05";

type Outcome = "submitted" | "verified" | "rejected";

function mapStatus(personaStatus: string): Outcome {
  const s = (personaStatus || "").toLowerCase();
  if (s === "approved" || s === "completed") return "verified";
  if (s === "declined" || s === "failed" || s === "expired") return "rejected";
  return "submitted"; // created, pending, needs_review, etc.
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get("PERSONA_API_KEY");
    if (!apiKey) throw new Error("Persona is not configured");

    const auth = req.headers.get("Authorization") ?? "";
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Not signed in" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const inquiryId: string | undefined = body?.inquiryId;
    if (!inquiryId) throw new Error("Missing inquiryId");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Make sure the inquiry belongs to this user
    const { data: row } = await admin
      .from("identity_verifications")
      .select("id, user_id")
      .eq("inquiry_id", inquiryId)
      .maybeSingle();
    if (!row || row.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Inquiry not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch latest from Persona
    const res = await fetch(`${PERSONA_API}/inquiries/${inquiryId}`, {
      headers: { Authorization: `Bearer ${apiKey}`, "Persona-Version": PERSONA_VERSION },
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Persona fetch failed: ${res.status} ${t}`);
    }
    const json = await res.json();
    const personaStatus: string = json.data?.attributes?.status ?? "pending";
    const status = mapStatus(personaStatus);

    const updates: Record<string, unknown> = {
      status,
      reason: personaStatus,
      updated_at: new Date().toISOString(),
    };
    if (status === "verified") updates.verified_at = new Date().toISOString();
    await admin.from("identity_verifications").update(updates).eq("id", row.id);

    if (status === "verified") {
      await admin
        .from("profiles")
        .update({ verified_at: new Date().toISOString() })
        .eq("id", user.id);
    }

    return new Response(JSON.stringify({ status, personaStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
