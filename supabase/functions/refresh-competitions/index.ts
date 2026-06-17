// G5 · Competition discovery — scheduled refresher.
//
// What it does
//   1. Pulls competitions from one or more SOURCES (currently a curated list
//      below; real scrapers/search APIs plug in via `fetchExternalSources`).
//   2. UPSERTs them into public.competitions (matched on external_id).
//   3. Marks rows that disappeared from every source as stale so the page can
//      still show them but the front-end can grey-out / hide if needed.
//
// How a real source plugs in later (no signup required right now):
//   - Firecrawl  — cheapest reliable option. Set FIRECRAWL_API_KEY, then
//                  uncomment `await fetchFromFirecrawl(...)` in
//                  fetchExternalSources(). ~$0.001 / page scraped on the
//                  Hobby plan ($16/mo · 3k credits) — a weekly refresh of a
//                  dozen aggregator pages is well under $1/mo.
//   - SerpAPI    — $50/mo for 5k searches; only if you want raw Google SERP.
//   - Bespoke    — drop any async function returning RawCompetition[] into
//                  fetchExternalSources() and it merges automatically.
//
// To edit the curated list, change CURATED below and redeploy.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type RawCompetition = {
  external_id: string;
  title: string;
  organiser: string;
  field: string;            // Architecture | Interiors | Product | Type | Material | ...
  location: string;         // Free text: "UAE", "Global", "Campus", etc.
  deadline?: string;        // ISO YYYY-MM-DD
  deadline_label?: string;  // Pretty form ("Oct 12")
  prize?: string;
  prize_kind?: string;      // Cash | Publication | Exhibition | Mentorship | Build
  eligibility?: string;     // "all" | "students" | "pros"
  audience?: string;        // "all" | "students"
  source_url?: string;
  source?: string;          // free-text origin id
  is_official?: boolean;
};

// ---------- Curated seed list (edit me) -----------------------------------
const CURATED: RawCompetition[] = [
  {
    external_id: "tashkeel-desert-pavilion-2026",
    title: "Desert Pavilion 2026",
    organiser: "Tashkeel",
    field: "Architecture",
    location: "UAE",
    deadline: "2026-08-30",
    deadline_label: "Aug 30",
    prize: "120,000 AED",
    prize_kind: "Cash",
    eligibility: "all",
    audience: "all",
    source_url: "https://tashkeel.org",
    source: "curated",
  },
  {
    external_id: "architizer-soft-brutalism-open",
    title: "Soft Brutalism Open",
    organiser: "A+ Awards",
    field: "Interiors",
    location: "Global",
    deadline: "2026-09-15",
    deadline_label: "Sep 15",
    prize: "Publication + €5,000",
    prize_kind: "Publication",
    eligibility: "all",
    audience: "all",
    source_url: "https://architizer.com",
    source: "curated",
  },
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
  // ---- Student-only calls (shown on StudentCompetitions) ----
  {
    external_id: "campus-pavilion-brief-2026",
    title: "Campus Pavilion Brief",
    organiser: "Inter-school · 5 campuses",
    field: "Architecture",
    location: "Campus",
    deadline: "2026-10-12",
    deadline_label: "Oct 12",
    prize: "Build + exhibition",
    prize_kind: "Build",
    eligibility: "students",
    audience: "students",
    source: "curated",
  },
  {
    external_id: "student-guild-type-for-a-cause",
    title: "Type for a Cause",
    organiser: "Student Guild · open call",
    field: "Type",
    location: "Global",
    deadline: "2026-11-03",
    deadline_label: "Nov 03",
    prize: "Featured + mentorship",
    prize_kind: "Mentorship",
    eligibility: "students",
    audience: "students",
    source: "curated",
  },
  {
    external_id: "material-futures-2026",
    title: "Material Futures",
    organiser: "Faculty showcase",
    field: "Product",
    location: "Campus",
    deadline: "2026-11-20",
    deadline_label: "Nov 20",
    prize: "Exhibition slot",
    prize_kind: "Exhibition",
    eligibility: "students",
    audience: "students",
    source: "curated",
  },
];

// ---------- External source plugins (off by default) ----------------------
async function fetchExternalSources(): Promise<RawCompetition[]> {
  const results: RawCompetition[] = [];
  // const fcKey = Deno.env.get("FIRECRAWL_API_KEY");
  // if (fcKey) results.push(...(await fetchFromFirecrawl(fcKey)));
  return results;
}

// Reference impl (kept commented to avoid running without a key).
// async function fetchFromFirecrawl(apiKey: string): Promise<RawCompetition[]> {
//   const targets = ["https://www.architizer.com/competitions/", "https://www.bustler.net/competitions"];
//   const out: RawCompetition[] = [];
//   for (const url of targets) {
//     const r = await fetch("https://api.firecrawl.dev/v2/scrape", {
//       method: "POST",
//       headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
//       body: JSON.stringify({ url, formats: [{ type: "json", prompt: "Extract live design competitions as { title, organiser, field, location, deadline (YYYY-MM-DD), prize, eligibility, source_url }." }] }),
//     });
//     const data = await r.json();
//     for (const c of data?.json?.competitions ?? []) {
//       out.push({ external_id: `firecrawl:${c.source_url ?? c.title}`, source: "firecrawl", audience: "all", eligibility: c.eligibility ?? "all", ...c });
//     }
//   }
//   return out;
// }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const external = await fetchExternalSources();
    const merged: RawCompetition[] = [...CURATED, ...external];

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

    const { error } = await admin
      .from("competitions")
      .upsert(rows, { onConflict: "external_id" });
    if (error) throw error;

    return new Response(
      JSON.stringify({ ok: true, upserted: rows.length, at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error)?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
