import { supabase } from "@/integrations/supabase/client";
import { getProfilesByIds, type ProfileRow } from "@/services/profile";

export type ConnectionStatus = "pending" | "accepted" | "declined" | "dismissed";

export interface ConnectionRequestRow {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
}

/** Like → server decides: pending or instant mutual-accept. */
export async function likeToConnect(targetId: string): Promise<{ status: ConnectionStatus; mutual: boolean }> {
  const { data, error } = await supabase.rpc("like_to_connect", { _target: targetId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    status: (row?.status ?? "pending") as ConnectionStatus,
    mutual: !!row?.mutual,
  };
}

/** Pass → write a 'dismissed' row so they don't come back. */
export async function passOnMaker(targetId: string): Promise<void> {
  const { error } = await supabase.rpc("pass_on_maker", { _target: targetId });
  if (error) console.warn("[connections] pass failed", error);
}

/** All ids the current user has interacted with (any status) — for filtering decks. */
export async function listSeenIds(): Promise<Set<string>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("connection_requests")
    .select("requester_id, recipient_id")
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);
  const seen = new Set<string>();
  for (const r of (data ?? []) as ConnectionRequestRow[]) {
    seen.add(r.requester_id === user.id ? r.recipient_id : r.requester_id);
  }
  return seen;
}

/** Accepted connections — returns the OTHER user's id with profile. */
export async function listAcceptedConnections(): Promise<{ otherId: string; profile: ProfileRow | null }[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("connection_requests")
    .select("requester_id, recipient_id, status, created_at")
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[connections] list accepted failed", error);
    return [];
  }
  const others = (data ?? []).map((r) =>
    r.requester_id === user.id ? r.recipient_id : r.requester_id,
  );
  // De-dupe (mutual produces two rows).
  const ids = Array.from(new Set(others));
  const map = await getProfilesByIds(ids);
  return ids.map((id) => ({ otherId: id, profile: map.get(id) ?? null }));
}

/** Incoming pending requests (others → me). */
export async function listIncomingRequests(): Promise<{ row: ConnectionRequestRow; profile: ProfileRow | null }[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("connection_requests")
    .select("*")
    .eq("recipient_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[connections] list incoming failed", error);
    return [];
  }
  const rows = (data ?? []) as ConnectionRequestRow[];
  const map = await getProfilesByIds(rows.map((r) => r.requester_id));
  return rows.map((row) => ({ row, profile: map.get(row.requester_id) ?? null }));
}

export async function acceptRequest(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  // Accept their request, and ensure my reciprocal row exists as accepted too.
  const { data: req } = await supabase
    .from("connection_requests")
    .select("requester_id, recipient_id")
    .eq("id", id)
    .maybeSingle();
  if (!req) return;
  await supabase.from("connection_requests").update({ status: "accepted" }).eq("id", id);
  await supabase
    .from("connection_requests")
    .upsert(
      { requester_id: user.id, recipient_id: (req as ConnectionRequestRow).requester_id, status: "accepted" },
      { onConflict: "requester_id,recipient_id" },
    );
}

export async function ignoreRequest(id: string): Promise<void> {
  await supabase.from("connection_requests").update({ status: "declined" }).eq("id", id);
}
