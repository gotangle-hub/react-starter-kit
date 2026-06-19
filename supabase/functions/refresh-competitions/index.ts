// G5 · Competition discovery — live world scan.
//
// Two passes per run:
//   1. audience="all"      — worldwide design competitions, open to anyone.
//   2. audience="students" — worldwide design competitions open to students.
//
// Both passes call Lovable AI (Gemini) with structured JSON output to produce a
// fresh, deduplicated list of real, currently-open competitions. Results are
// UPSERTed into public.competitions (matched on external_id). A small curated
// seed list is always merged in so the page is never empty if the model fails.
//
// Triggered by:
//   • pg_cron every 6h (server-side, no auth required — verify_jwt off).
//   • Client invocation when the user opens the Competitions / Student
//     Competitions page (visible "scanning…" indicator).

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

type RawCompetition = {
  external_id: string;
  title: string;
  organiser: string;
  field: string;
  location: string;
  deadline?: string;
  deadline_label?: string;
  prize?: string;
  prize_kind?: string;
  eligibility?: string;
  audience?: string;
  source_url?: string;
  source?: string;
  is_official?: boolean;
};

// ---------- Curated seed list (always merged) -----------------------------
const CURATED: RawCompetition[] = [
  {
    external_id: "riba-adaptive-reuse-prize",
    title: "Adaptive Reuse Prize",
    organiser: "RIBA",
    field: "Architecture",
    location: "Global",
    deadline: "2026-10-02",
    deadline_label: "Oct 02",
    prize: "£8,000",
    prize_kind: "Cash",
    eligibility: "all",
    audience: "all",
    source_url: "https://riba.org",
    source: "curated",
  },
  {
    external_id: "architizer-a-plus-awards",
    title: "A+ Awards",
    organiser: "Architizer",
    field: "Architecture",
    location: "Global",
    deadline: "2026-12-15",
    deadline_label: "Dec 15",
    prize: "Publication + cash",
    prize_kind: "Publication",
    eligibility: "all",
    audience: "all",
    source_url: "https://architizer.com/awards",
    source: "curated",
  },
];

// ---------- AI live-scan ---------------------------------------------------
async function aiScan(audience: "all" | "students"): Promise<RawCompetition[]> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) {
    console.warn("[refresh-competitions] LOVABLE_API_KEY missing — skipping AI scan");
    return [];
  }

  const today = new Date().toISOString().slice(0, 10);
  const studentClause =
    audience === "students"
      ? "Only include competitions open to DESIGN STUDENTS (university, college, or recent graduates). Skip professional-only calls."
      : "Include open calls for designers (any level). Skip student-only calls.";

  const systemPrompt = `You are a research agent for a design competition platform. Today is ${today}. Return ONLY real, currently-open design competitions worldwide whose deadline is after today. Cover architecture, interior, product/industrial, graphic, type, material, fashion, UX, and other design disciplines. Geographic spread: include competitions from multiple continents. ${studentClause} Never invent organisers — only competitions you are confident exist. Output valid JSON.`;

  const userPrompt = `List 20 real ${audience === "students" ? "student" : "open"} design competitions worldwide that are currently accepting entries. For each, return:
- title: official name
- organiser: hosting organisation
- field: ONE of Architecture, Interiors, Product, Graphic, Type, Material, Fashion, UX, Other
- location: country or "Global"
- deadline: YYYY-MM-DD (after ${today})
- deadline_label: short like "Oct 12"
- prize: short text (e.g. "$10,000", "Publication + €5,000", "Exhibition")
- prize_kind: ONE of Cash, Publication, Exhibition, Mentorship, Build, Other
- source_url: official URL`;

  const schema = {
    type: "object",
    properties: {
      competitions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            organiser: { type: "string" },
            field: { type: "string" },
            location: { type: "string" },
            deadline: { type: "string" },
            deadline_label: { type: "string" },
            prize: { type: "string" },
            prize_kind: { type: "string" },
            source_url: { type: "string" },
          },
          required: ["title", "organiser", "field", "location", "deadline"],
        },
      },
    },
    required: ["competitions"],
  };

  try {
    const res = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_competitions",
              description: "Return the list of competitions",
              parameters: schema,
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_competitions" } },
      }),
    });
    if (!res.ok) {
      console.error("[refresh-competitions] AI gateway error", res.status, await res.text());
      return [];
    }
    const data = await res.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return [];
    const parsed = JSON.parse(args);
    const list: any[] = parsed?.competitions ?? [];
    const today2 = new Date().toISOString().slice(0, 10);
    return list
      .filter((c) => c?.title && c?.organiser && c?.deadline && c.deadline >= today2)
      .map((c) => ({
        external_id: `ai:${audience}:${slug(c.title)}:${slug(c.organiser)}`,
        title: String(c.title).slice(0, 200),
        organiser: String(c.organiser).slice(0, 160),
        field: normaliseField(c.field),
        location: String(c.location ?? "Global").slice(0, 80),
        deadline: c.deadline,
        deadline_label: c.deadline_label ?? prettyDate(c.deadline),
        prize: c.prize ?? null,
        prize_kind: normalisePrizeKind(c.prize_kind),
        eligibility: audience === "students" ? "students" : "all",
        audience,
        source_url: c.source_url ?? null,
        source: "ai-scan",
        is_official: false,
      }));
  } catch (e) {
    console.error("[refresh-competitions] AI scan failed", e);
    return [];
  }
}

function slug(s: string): string {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}
function prettyDate(d: string): string {
  try {
    const dt = new Date(d);
    return dt.toLocaleString("en-GB", { month: "short", day: "2-digit" });
  } catch {
    return d;
  }
}
const FIELDS = ["Architecture", "Interiors", "Product", "Graphic", "Type", "Material", "Fashion", "UX", "Other"];
function normaliseField(f?: string): string {
  if (!f) return "Other";
  const hit = FIELDS.find((x) => x.toLowerCase() === f.toLowerCase());
  return hit ?? "Other";
}
const PRIZE_KINDS = ["Cash", "Publication", "Exhibition", "Mentorship", "Build", "Other"];
function normalisePrizeKind(p?: string): string {
  if (!p) return "Other";
  const hit = PRIZE_KINDS.find((x) => x.toLowerCase() === p.toLowerCase());
  return hit ?? "Other";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Optional body lets the caller request a single audience only; default = both.
    let audiences: ("all" | "students")[] = ["all", "students"];
    try {
      const body = await req.json().catch(() => ({}));
      if (body?.audience === "all" || body?.audience === "students") audiences = [body.audience];
    } catch { /* no body */ }

    const [allRows, studentRows] = await Promise.all(
      audiences.map((a) => aiScan(a)),
    );
    const aiRows = [...(allRows ?? []), ...(studentRows ?? [])];

    const merged = [...CURATED.filter((c) => audiences.includes(c.audience as any)), ...aiRows];

    const rows = merged.map((c) => ({
      external_id: c.external_id,
      title: c.title,
      organiser: c.organiser,
      field: c.field,
      location: c.location,
      deadline: c.deadline ?? null,
      deadline_label: c.deadline_label ?? null,
      prize: c.prize ?? null,
      prize_kind: c.prize_kind ?? null,
      eligibility: c.eligibility ?? "all",
      audience: c.audience ?? "all",
      source_url: c.source_url ?? null,
      source: c.source ?? "curated",
      is_official: c.is_official ?? false,
      last_seen_at: new Date().toISOString(),
    }));

    if (rows.length) {
      const { error } = await admin
        .from("competitions")
        .upsert(rows, { onConflict: "external_id" });
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ ok: true, upserted: rows.length, audiences, at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error)?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
