import { supabase as integrationClient } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client — re-exports the auto-generated integration client so the
 * rest of the app can keep importing from "@/lib/supabase" unchanged.
 * Auth (G1), database, and storage all flow through here.
 */
export const isSupabaseConfigured = true;

export function getSupabase(): SupabaseClient {
  return integrationClient as unknown as SupabaseClient;
}

export function maybeSupabase(): SupabaseClient | null {
  return integrationClient as unknown as SupabaseClient;
}
