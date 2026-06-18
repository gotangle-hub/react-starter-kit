import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

/** Columns any signed-in user is allowed to read (RLS + column grants). */
const PUBLIC_PROFILE_COLUMNS =
  "id, account_type, display_name, username, disciplines, bio, location, links, avatar_path, banner_path, verified_at, created_at, updated_at";

/** Public URL helper for any path stored under the `work` bucket. */
export function workPublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from("work").getPublicUrl(path);
  return data.publicUrl;
}

export async function getMyProfile(): Promise<ProfileRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();
  return (data as ProfileRow | null) ?? null;
}

export async function getProfileById(id: string): Promise<ProfileRow | null> {
  if (!id) return null;
  const { data } = await supabase
    .from("profiles")
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return (data as ProfileRow | null) ?? null;
}

export async function getProfilesByIds(ids: string[]): Promise<Map<string, ProfileRow>> {
  const map = new Map<string, ProfileRow>();
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return map;
  const { data } = await supabase
    .from("profiles")
    .select(PUBLIC_PROFILE_COLUMNS)
    .in("id", unique);
  for (const row of (data ?? []) as ProfileRow[]) map.set(row.id, row);
  return map;
}

/** List recently-active profiles (used by talent/feed surfaces that want
 * real people, not fixtures). */
export async function listProfiles(opts: { limit?: number; excludeSelf?: boolean } = {}): Promise<ProfileRow[]> {
  const limit = opts.limit ?? 20;
  let me: string | null = null;
  if (opts.excludeSelf) {
    const { data: { user } } = await supabase.auth.getUser();
    me = user?.id ?? null;
  }
  let q = supabase
    .from("profiles")
    .select(PUBLIC_PROFILE_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (me) q = q.neq("id", me);
  const { data } = await q;
  return (data ?? []) as ProfileRow[];
}

export async function updateMyProfile(patch: ProfileUpdate): Promise<ProfileRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  // Do not allow account_type changes (DB trigger also blocks it).
  const safe = { ...patch };
  delete (safe as { account_type?: unknown }).account_type;
  delete (safe as { verified_at?: unknown }).verified_at;
  const { data, error } = await supabase
    .from("profiles")
    .update(safe)
    .eq("id", user.id)
    .select(PUBLIC_PROFILE_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  return (data as ProfileRow | null) ?? null;
}

/** Derive a stable colour for an avatar when the profile has no avatar image. */
export function tintForId(id: string | null | undefined): string {
  const palette = ["#A85C3A", "#161514", "#0107FF", "#6E665B", "#6B4EFF", "#3A6E5C"];
  if (!id) return palette[0];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export function initialsFor(name: string | null | undefined, fallback = "·"): string {
  const s = (name ?? "").trim();
  if (!s) return fallback;
  return s
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Build the shape Avatar/UI components expect from a profile row. */
export function makerFromProfile(p: Partial<Pick<ProfileRow, "id" | "display_name" | "avatar_path" | "account_type" | "username" | "verified_at">> | null | undefined) {
  const name = p?.display_name || (p?.username ? `@${p.username}` : "Member");
  return {
    id: p?.id ?? "unknown",
    name,
    handle: p?.username ?? null,
    role: (p?.account_type as string | undefined) ?? "Designer",
    initials: initialsFor(name),
    tint: tintForId(p?.id),
    verified: Boolean(p?.verified_at),
    avatarUrl: workPublicUrl(p?.avatar_path) ?? undefined,
  };
}
