// G2 · Client helper around the `rank-feed` edge function.
// Pass any list of items that have an `id` and optional `category`/`author_id`/
// `created_at`/`promoted` fields — get back the same list, reordered for the
// signed-in user. Falls back to the original order if the call fails or the
// user is signed out, so the UI never breaks.
import { supabase } from "@/integrations/supabase/client";

export interface Rankable {
  id: string;
  category?: string | null;
  author_id?: string | null;
  created_at?: string | null;
  promoted?: boolean | null;
  base_score?: number | null;
}

export async function rankItems<T extends Rankable>(
  kind: "posts" | "makers",
  items: T[],
): Promise<T[]> {
  if (!items.length) return items;
  try {
    const { data, error } = await supabase.functions.invoke("rank-feed", {
      body: { kind, candidates: items.map(stripForWire) },
    });
    if (error || !data?.ranked) return items;
    const byId = new Map(items.map((it) => [it.id, it]));
    const ordered = (data.ranked as string[]).map((id) => byId.get(id)).filter(Boolean) as T[];
    // Append any candidates the ranker dropped (defensive).
    for (const it of items) if (!data.ranked.includes(it.id)) ordered.push(it);
    return ordered;
  } catch {
    return items;
  }
}

function stripForWire(it: Rankable) {
  return {
    id: it.id,
    category: it.category ?? null,
    author_id: it.author_id ?? null,
    created_at: it.created_at ?? null,
    promoted: it.promoted ?? null,
    base_score: it.base_score ?? null,
  };
}

/** Fire-and-forget — record an interaction signal that feeds the ranker. */
export async function logInteraction(args: {
  target_kind: "post" | "maker";
  target_id: string;
  kind: "view" | "save" | "pin" | "connect" | "dwell" | "like" | "comment";
  category?: string | null;
  weight?: number;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("interactions").insert({
      user_id: user.id,
      target_kind: args.target_kind,
      target_id: args.target_id,
      kind: args.kind,
      category: args.category ?? null,
      weight: args.weight ?? 1,
    });
  } catch { /* ignore */ }
}
