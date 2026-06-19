// G2 · Personalised feed ranker.
// Takes a set of post candidates {id, author_id|maker, category} from the client
// and returns them re-ordered for the signed-in user. Scoring blends:
//   • interest overlap (user_interests tag vs candidate category)
//   • follow boost (candidate authored by someone you follow)
//   • recent interaction affinity (categories you've engaged with, decayed by age)
//   • recency (real posts only, falls back to neutral)
//   • mild engagement prior (uses provided base_score if given)
// Cold start: a brand-new user with disciplines but no follows/interactions still
// gets ranking via interest overlap; users without disciplines get the candidate
// order untouched plus a tiny boost on promoted/recent items.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface Candidate {
  id: string;
  author_id?: string | null;
  category?: string | null;
  base_score?: number | null;
  created_at?: string | null;
  promoted?: boolean | null;
}
interface Body {
  kind: "posts" | "makers";
  candidates: Candidate[];
}

const HALF_LIFE_DAYS = 14;
function recency(ts?: string | null): number {
  if (!ts) return 0.5;
  const days = (Date.now() - new Date(ts).getTime()) / 86_400_000;
  return Math.pow(0.5, days / HALF_LIFE_DAYS);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );

    let userId: string | null = null;
    if (auth.startsWith("Bearer ")) {
      const token = auth.slice(7);
      const { data } = await supabase.auth.getClaims(token);
      userId = (data?.claims?.sub as string | undefined) ?? null;
    }

    const body = (await req.json()) as Body;
    if (!body?.candidates || !Array.isArray(body.candidates)) {
      return new Response(JSON.stringify({ error: "candidates required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Anonymous → return as-is with a tiny promoted/recency nudge so output is stable.
    if (!userId) {
      const ranked = [...body.candidates]
        .map((c, i) => ({ c, i, s: (c.promoted ? 0.05 : 0) + 0.2 * recency(c.created_at) - i * 1e-4 }))
        .sort((a, b) => b.s - a.s)
        .map(({ c }) => c.id);
      return new Response(JSON.stringify({ ranked, personalised: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull signals in parallel.
    const candidateIds = body.candidates.map((c) => c.id);
    const [interestsRes, followsRes, interactionsRes, metricsRes, boostsRes, creatorBoostsRes, postsRes] = await Promise.all([
      supabase.from("user_interests").select("tag, weight").eq("user_id", userId),
      supabase.from("follows").select("followee_id").eq("follower_id", userId),
      supabase
        .from("interactions")
        .select("category, kind, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("post_metrics").select("post_id, reach_tier, score").in("post_id", candidateIds),
      // G6 · active boosts — mark candidates promoted + record impressions.
      supabase.rpc("list_active_boosted_post_ids"),
      supabase.rpc("list_active_boosted_creator_ids"),
      // Server-side author lookup so client-supplied author_id can't be spoofed
      // to inflate boost impressions for unrelated creators.
      supabase.from("posts").select("id, author_id").in("id", candidateIds),
    ]);
    const reachByPost = new Map<string, { tier: number; score: number }>();
    for (const m of metricsRes.data ?? []) {
      reachByPost.set(m.post_id, { tier: Number(m.reach_tier) || 0, score: Number(m.score) || 0 });
    }
    // Trusted author map (server-derived). Anything not in this map is treated
    // as having no author for boost / impression purposes.
    const serverAuthorByPost = new Map<string, string>();
    for (const p of (postsRes.data ?? []) as Array<{ id: string; author_id: string | null }>) {
      if (p.author_id) serverAuthorByPost.set(p.id, p.author_id);
    }
    const boostedPosts = new Map<string, string>(); // post_id → boost_id
    for (const b of (boostsRes.data ?? []) as Array<{ post_id: string; boost_id: string; owner_id: string }>) {
      if (b.owner_id !== userId) boostedPosts.set(b.post_id, b.boost_id);
    }
    const boostedCreators = new Map<string, string>(); // owner_id → boost_id
    for (const b of (creatorBoostsRes.data ?? []) as Array<{ owner_id: string; boost_id: string }>) {
      if (b.owner_id !== userId) boostedCreators.set(b.owner_id, b.boost_id);
    }

    const interestWeight = new Map<string, number>();
    for (const r of interestsRes.data ?? []) {
      if (r.tag) interestWeight.set(r.tag.toLowerCase(), Number(r.weight) || 1);
    }
    const follows = new Set((followsRes.data ?? []).map((f) => f.followee_id));

    // Recent affinity per category, time-decayed.
    const kindWeight: Record<string, number> = {
      connect: 4, save: 3, pin: 3, like: 2, comment: 2, dwell: 1, view: 0.4,
    };
    const affinity = new Map<string, number>();
    for (const it of interactionsRes.data ?? []) {
      if (!it.category) continue;
      const w = (kindWeight[it.kind] ?? 1) * recency(it.created_at);
      affinity.set(it.category.toLowerCase(), (affinity.get(it.category.toLowerCase()) ?? 0) + w);
    }

    function scoreCandidate(c: Candidate): number {
      const cat = (c.category ?? "").toLowerCase();
      let s = 0;
      if (cat) {
        s += 1.6 * (interestWeight.get(cat) ?? 0);
        s += 0.6 * (affinity.get(cat) ?? 0);
      }
      if (c.author_id && follows.has(c.author_id)) s += 2.0;
      s += 0.4 * recency(c.created_at);
      if (typeof c.base_score === "number") s += 0.05 * c.base_score;
      // G6 · paid boost lifts the candidate above organic. Use server-derived
      // author_id only — client-supplied author_id is NOT trusted here.
      const trustedAuthor = serverAuthorByPost.get(c.id) ?? null;
      const boosted = boostedPosts.has(c.id) || (trustedAuthor ? boostedCreators.has(trustedAuthor) : false);
      if (c.promoted || boosted) s += 2.4;
      const reach = reachByPost.get(c.id);
      if (reach) s += 0.9 * reach.tier;
      return s;
    }

    const ranked = body.candidates
      .map((c, i) => ({ c, i, s: scoreCandidate(c) }))
      .sort((a, b) => (b.s - a.s) || (a.i - b.i))
      .map(({ c }) => c.id);

    // Interleave so boosted items are spaced ~1-in-5 instead of all stacked at top.
    const boostedIds = new Set<string>();
    for (const c of body.candidates) {
      const trustedAuthor = serverAuthorByPost.get(c.id) ?? null;
      if (boostedPosts.has(c.id) || (trustedAuthor && boostedCreators.has(trustedAuthor))) boostedIds.add(c.id);
    }
    const boostedQ = ranked.filter((id) => boostedIds.has(id));
    const organicQ = ranked.filter((id) => !boostedIds.has(id));
    const woven: string[] = [];
    while (boostedQ.length || organicQ.length) {
      for (let i = 0; i < 4 && organicQ.length; i++) woven.push(organicQ.shift()!);
      if (boostedQ.length) woven.push(boostedQ.shift()!);
    }

    // Record impressions only for candidates that resolved to real posts on the
    // server. This prevents fake author_id payloads from inflating boost stats.
    const impressionBoostIds: string[] = [];
    for (const c of body.candidates) {
      if (!serverAuthorByPost.has(c.id)) continue; // unknown / fake post id
      const trustedAuthor = serverAuthorByPost.get(c.id)!;
      const bid = boostedPosts.get(c.id) ?? boostedCreators.get(trustedAuthor);
      if (bid) impressionBoostIds.push(bid);
    }
    if (impressionBoostIds.length) {
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: auth } } },
      );
      userClient.rpc("record_boost_impressions", { _boost_ids: impressionBoostIds }).then(() => {}, () => {});
    }

    return new Response(
      JSON.stringify({ ranked: woven, personalised: true, boosted: Array.from(boostedIds), signals: {
        interests: interestWeight.size, follows: follows.size, interactions: interactionsRes.data?.length ?? 0,
      } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
