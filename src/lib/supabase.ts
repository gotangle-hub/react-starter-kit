import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client (provided by Lovable's native Supabase integration).
 *
 * The app is designed so the UI runs even before credentials are wired:
 * `isSupabaseConfigured` is false until env vars exist, and `getSupabase()`
 * throws a clear error only when something actually tries to use the backend.
 * Auth (G1), database, and storage (G9, salary DB) all flow through here.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  client = createClient(url, anonKey, {
    auth: {
      // G1 — stay signed in: persist the session on the device and restore it
      // on every app open, refreshing the token in the background.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "tangle.auth",
    },
  });
}

export function getSupabase(): SupabaseClient {
  if (!client) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY " +
        "(Lovable provides these via its Supabase integration).",
    );
  }
  return client;
}

/** Safe accessor — returns null instead of throwing when unconfigured. */
export function maybeSupabase(): SupabaseClient | null {
  return client;
}
