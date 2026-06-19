// Match (work-first swipe) — server-driven deck, persisted preferences, daily cap.
import { supabase } from "@/integrations/supabase/client";

export type Intent = "connection" | "collaboration";

export interface MatchPreferences {
  intent: Intent;
  disciplines: string[];
  location: string | null;
  availability: string | null;
  experience_level: string | null;
  account_types: string[];
  recency_days: number | null;
}

export const DEFAULT_PREFERENCES: MatchPreferences = {
  intent: "connection",
  disciplines: [],
  location: null,
  availability: null,
  experience_level: null,
  account_types: [],
  recency_days: null,
};

export interface DeckCard {
  post_id: string;
  title: string | null;
  caption: string | null;
  media_paths: string[] | null;
  image_path: string | null;
  category: string | null;
  created_at: string;
  author_id: string;
  author_name: string | null;
  author_username: string | null;
  author_avatar_path: string | null;
  author_account_type: string;
  author_verified: boolean;
  author_location: string | null;
  author_disciplines: string[] | null;
}

export interface SwipeState {
  unlimited: boolean;
  cap: number | null;
  used?: number;
  remaining: number | null;
}

export async function loadPreferences(): Promise<MatchPreferences> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return DEFAULT_PREFERENCES;
  const { data } = await supabase
    .from("match_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return DEFAULT_PREFERENCES;
  return {
    intent: (data.intent as Intent) ?? "connection",
    disciplines: data.disciplines ?? [],
    location: data.location ?? null,
    availability: data.availability ?? null,
    experience_level: data.experience_level ?? null,
    account_types: data.account_types ?? [],
    recency_days: data.recency_days ?? null,
  };
}

export async function savePreferences(prefs: MatchPreferences): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("match_preferences").upsert(
    {
      user_id: user.id,
      intent: prefs.intent,
      disciplines: prefs.disciplines,
      location: prefs.location ?? undefined,
      availability: prefs.availability ?? undefined,
      experience_level: prefs.experience_level ?? undefined,
      account_types: prefs.account_types,
      recency_days: prefs.recency_days ?? undefined,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

}

export async function fetchDeck(prefs: MatchPreferences, limit = 40): Promise<DeckCard[]> {
  const { data, error } = await supabase.rpc("get_match_deck", {
    _intent: prefs.intent,
    _disciplines: prefs.disciplines,
    _location: prefs.location ?? undefined,
    _availability: prefs.availability ?? undefined,
    _experience: prefs.experience_level ?? undefined,
    _account_types: prefs.account_types,
    _recency_days: prefs.recency_days ?? undefined,
    _limit: limit,
  });
  if (error) {
    console.error("[match] fetchDeck failed", error);
    return [];
  }
  return (data ?? []) as unknown as DeckCard[];
}


export async function getSwipeState(): Promise<SwipeState> {
  const { data, error } = await supabase.rpc("get_swipe_state");
  if (error || !data) return { unlimited: false, cap: 15, used: 0, remaining: 15 };
  return data as unknown as SwipeState;
}

export interface SwipeResult {
  ok: boolean;
  reason?: "cap_reached" | "collab_cap_reached";
  cap?: number | null;
  remaining?: number | null;
  status?: string;
  mutual?: boolean;
  collab_id?: string | null;
  unlimited?: boolean;
}

export async function registerSwipe(
  targetUserId: string,
  intent: Intent,
  postId?: string,
): Promise<SwipeResult> {
  const { data, error } = await supabase.rpc("register_swipe", {
    _target_user_id: targetUserId,
    _intent: intent,
    _post_id: postId ?? null,
  });
  if (error) {
    console.error("[match] registerSwipe failed", error);
    return { ok: false };
  }
  return data as unknown as SwipeResult;
}

export function workUrl(card: DeckCard): string | null {
  const path = card.media_paths?.[0] ?? card.image_path ?? null;
  if (!path) return null;
  const { data } = supabase.storage.from("work").getPublicUrl(path);
  return data.publicUrl;
}

export function avatarUrl(path: string | null): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
