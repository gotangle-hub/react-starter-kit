// G5 · Competition discovery client wrapper.
import { supabase } from "@/integrations/supabase/client";

export interface Competition {
  id: string;
  title: string;
  organiser: string;
  field: string;
  location: string;
  deadline: string | null;
  deadline_label: string | null;
  prize: string | null;
  prize_kind: string | null;
  eligibility: string;
  audience: string;
  source_url: string | null;
  is_official: boolean;
  interested_count: number;
}

export interface CompetitionFilters {
  field?: string;       // "Any field" treated as no filter
  location?: string;
  deadline?: string;    // "Any deadline" | "This month" | "Next 3 months"
  prize?: string;
  eligibility?: string;
  audience?: "all" | "students";
}

function deadlineCutoff(label?: string): Date | null {
  if (!label || label.startsWith("Any")) return null;
  const now = new Date();
  if (label === "This month") return new Date(now.getFullYear(), now.getMonth() + 1, 0);
  if (label === "Next 3 months") return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
  return null;
}

export async function listCompetitions(f: CompetitionFilters = {}): Promise<Competition[]> {
  let q = supabase.from("competitions").select("*").order("deadline", { ascending: true, nullsFirst: false });
  if (f.audience === "students") q = q.eq("audience", "students");
  const { data, error } = await q;
  if (error) {
    console.error("[competitions] list failed", error);
    return [];
  }
  let rows = (data ?? []) as Competition[];

  if (f.field && !f.field.startsWith("Any")) rows = rows.filter((r) => r.field === f.field);
  if (f.location && !f.location.startsWith("Any") && f.location !== "Anywhere")
    rows = rows.filter((r) => r.location.toLowerCase().includes(f.location!.toLowerCase()));
  if (f.prize && !f.prize.startsWith("Any"))
    rows = rows.filter((r) => (r.prize_kind ?? "").toLowerCase().includes(f.prize!.toLowerCase()));
  if (f.eligibility && !f.eligibility.startsWith("Any"))
    rows = rows.filter((r) => r.eligibility === f.eligibility);

  const cutoff = deadlineCutoff(f.deadline);
  if (cutoff) rows = rows.filter((r) => r.deadline && new Date(r.deadline) <= cutoff);
  return rows;
}

/** Fire-and-forget refresh; UI shows scanning state regardless. */
export async function refreshCompetitions(): Promise<void> {
  try {
    await supabase.functions.invoke("refresh-competitions", { body: {} });
  } catch (e) {
    console.warn("[competitions] refresh failed", e);
  }
}

/** Per-user pin/interested state. */
export async function getUserState(): Promise<Record<string, { pinned: boolean; interested: boolean }>> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session) return {};
  const { data } = await supabase.from("competition_user_state").select("competition_id, pinned, interested");
  const map: Record<string, { pinned: boolean; interested: boolean }> = {};
  (data ?? []).forEach((r: any) => {
    map[r.competition_id] = { pinned: !!r.pinned, interested: !!r.interested };
  });
  return map;
}

export async function setUserState(
  competition_id: string,
  patch: { pinned?: boolean; interested?: boolean },
): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return;
  await supabase
    .from("competition_user_state")
    .upsert({ user_id: uid, competition_id, ...patch }, { onConflict: "user_id,competition_id" });
}
