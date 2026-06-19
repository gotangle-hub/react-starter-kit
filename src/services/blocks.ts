// Blocking service. Reads/writes the `blocks` table and provides a cached
// "ids I shouldn't see" set used to filter feeds, search, profiles, comments,
// DMs, and notifications on the client.

import { supabase } from "@/integrations/supabase/client";

let cache: { uid: string | null; ids: Set<string>; at: number } | null = null;
const TTL = 30_000;

async function meId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** Set of user ids that are blocked in EITHER direction relative to me. */
export async function getBlockedIds(force = false): Promise<Set<string>> {
  const uid = await meId();
  if (!uid) return new Set();
  if (
    !force &&
    cache &&
    cache.uid === uid &&
    Date.now() - cache.at < TTL
  ) {
    return cache.ids;
  }
  const { data } = await supabase.rpc("my_block_user_ids");
  const ids = new Set<string>(((data as string[] | null) ?? []).filter(Boolean));
  cache = { uid, ids, at: Date.now() };
  return ids;
}

export function invalidateBlocksCache() {
  cache = null;
}

/** Filter an array of rows by an author/user-id field, dropping blocked users. */
export async function filterOutBlocked<T>(
  rows: T[],
  getId: (row: T) => string | null | undefined,
): Promise<T[]> {
  if (!rows.length) return rows;
  const blocked = await getBlockedIds();
  if (!blocked.size) return rows;
  return rows.filter((r) => {
    const id = getId(r);
    return !id || !blocked.has(id);
  });
}

export async function isBlockedEitherWay(otherId: string): Promise<boolean> {
  if (!otherId) return false;
  const blocked = await getBlockedIds();
  return blocked.has(otherId);
}

export interface BlockRow {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

/** Block another user (idempotent — duplicate is silently ignored). */
export async function blockUser(otherId: string): Promise<void> {
  const uid = await meId();
  if (!uid) throw new Error("Not signed in");
  if (!otherId || otherId === uid) throw new Error("Invalid target");
  const { error } = await supabase
    .from("blocks")
    .insert({ blocker_id: uid, blocked_id: otherId });
  if (error && !/duplicate key|unique/i.test(error.message)) throw error;
  invalidateBlocksCache();
}

export async function unblockUser(otherId: string): Promise<void> {
  const uid = await meId();
  if (!uid) throw new Error("Not signed in");
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", uid)
    .eq("blocked_id", otherId);
  if (error) throw error;
  invalidateBlocksCache();
}

/** List people I have blocked (one direction — for the settings screen). */
export async function listMyBlocks(): Promise<BlockRow[]> {
  const uid = await meId();
  if (!uid) return [];
  const { data } = await supabase
    .from("blocks")
    .select("id, blocker_id, blocked_id, created_at")
    .eq("blocker_id", uid)
    .order("created_at", { ascending: false });
  return (data as BlockRow[] | null) ?? [];
}
