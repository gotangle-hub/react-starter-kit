import { supabase } from "@/integrations/supabase/client";

export const USERNAME_REGEX = /^[a-z0-9_.-]{3,20}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateUsernameFormat(name: string): string | null {
  const v = normalizeUsername(name);
  if (v.length < 3) return "At least 3 characters.";
  if (v.length > 20) return "Up to 20 characters.";
  if (!USERNAME_REGEX.test(v)) return "Lowercase letters, digits, _ . and - only.";
  return null;
}

export async function checkUsernameAvailable(name: string): Promise<boolean> {
  const v = normalizeUsername(name);
  if (validateUsernameFormat(v)) return false;
  const { data, error } = await supabase.rpc("check_username_available", { _name: v });
  if (error) return false;
  return !!data;
}

export async function suggestUsernames(base: string, count = 5): Promise<string[]> {
  const { data, error } = await supabase.rpc("suggest_usernames", { _base: base, _count: count });
  if (error || !data) return [];
  return data as string[];
}

export async function lookupProfileIdByUsername(name: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("profile_id_by_username", { _name: normalizeUsername(name) });
  if (error || !data) return null;
  return data as string;
}

/** Resolve handles -> user_ids in a single call. */
export async function resolveHandlesToIds(handles: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const unique = Array.from(new Set(handles.map(normalizeUsername).filter(Boolean)));
  if (!unique.length) return map;
  const { data } = await supabase
    .from("profiles")
    .select("id, username")
    .in("username", unique);
  for (const row of (data ?? []) as { id: string; username: string }[]) {
    map.set(row.username, row.id);
  }
  return map;
}

/** For @mention autocomplete — prefix search across all profiles. */
export async function searchHandles(prefix: string, limit = 6): Promise<Array<{ id: string; username: string; display_name: string | null; avatar_path: string | null }>> {
  const v = normalizeUsername(prefix);
  if (v.length === 0) return [];
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_path")
    .ilike("username", `${v}%`)
    .order("username", { ascending: true })
    .limit(limit);
  return (data ?? []) as Array<{ id: string; username: string; display_name: string | null; avatar_path: string | null }>;
}
