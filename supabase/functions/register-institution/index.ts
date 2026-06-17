// G13 · Register-an-institution submission.
//
// Persists the request to public.institution_registration_requests. We use the
// service role to bypass RLS and to capture submissions even from signed-out
// visitors. A real email notification to the Tangle team can be wired by
// uncommenting the `notifyTangleTeam` block once you've configured the email
// domain (Lovable Emails — free, requires a verified sender domain).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const TANGLE_TEAM_EMAIL = Deno.env.get("TANGLE_TEAM_EMAIL") ?? "team@tangle.app";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const required = ["institution_name", "contact_email"] as const;
    for (const k of required) {
      if (!body?.[k] || typeof body[k] !== "string") {
        return new Response(JSON.stringify({ error: `Missing ${k}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Best-effort: capture the signed-in user id if a bearer was sent.
    let submitted_by: string | null = null;
    const auth = req.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) {
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: auth } } },
      );
      const { data } = await userClient.auth.getUser();
      submitted_by = data.user?.id ?? null;
    }

    const { data, error } = await admin
      .from("institution_registration_requests")
      .insert({
        institution_name: String(body.institution_name).slice(0, 200),
        location: body.location?.toString().slice(0, 200) ?? null,
        contact_name: body.contact_name?.toString().slice(0, 200) ?? null,
        contact_email: String(body.contact_email).slice(0, 200),
        role: body.role?.toString().slice(0, 80) ?? null,
        approx_students: Number.isFinite(body.approx_students) ? Math.max(0, Math.floor(body.approx_students)) : null,
        notes: body.notes?.toString().slice(0, 2000) ?? null,
        submitted_by,
      })
      .select("id")
      .single();
    if (error) throw error;

    // OPTIONAL — notify the Tangle team by email.
    // Wire by deploying `send-transactional-email` (Lovable Emails) and
    // uncommenting:
    // await admin.functions.invoke("send-transactional-email", {
    //   body: {
    //     to: TANGLE_TEAM_EMAIL,
    //     templateName: "institution-registration",
    //     data: { ...body, requestId: data.id },
    //   },
    // });

    console.log(`[register-institution] new request ${data.id} for "${body.institution_name}" (notify ${TANGLE_TEAM_EMAIL})`);

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[register-institution] failed", e);
    return new Response(JSON.stringify({ error: String((e as Error)?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
