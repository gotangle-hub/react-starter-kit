import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

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
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data ?? null;
}

export async function updateMyProfile(patch: ProfileUpdate): Promise<ProfileRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  // Do not allow account_type changes (DB trigger also blocks it).
  const safe = { ...patch };
  delete (safe as { account_type?: unknown }).account_type;
  const { data, error } = await supabase
    .from("profiles")
    .update(safe)
    .eq("id", user.id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}
