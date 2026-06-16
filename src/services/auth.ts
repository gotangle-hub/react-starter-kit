import type { Session } from "@supabase/supabase-js";
import { getSupabase, maybeSupabase } from "@/lib/supabase";

/**
 * Auth service (G1 — stay signed in).
 * Thin, typed wrapper over Supabase auth so screens never touch the client
 * directly. Session persistence/refresh is configured on the client itself.
 */
export const authService = {
  async getSession(): Promise<Session | null> {
    const sb = maybeSupabase();
    if (!sb) return null;
    const { data } = await sb.auth.getSession();
    return data.session;
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    const sb = maybeSupabase();
    if (!sb) return () => {};
    const { data } = sb.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return () => data.subscription.unsubscribe();
  },

  async signInWithPassword(email: string, password: string) {
    return getSupabase().auth.signInWithPassword({ email, password });
  },

  async signUpWithPassword(email: string, password: string) {
    return getSupabase().auth.signUp({ email, password });
  },

  async signInWithOAuth(provider: "google" | "apple" | "azure") {
    return getSupabase().auth.signInWithOAuth({ provider });
  },

  // Only path back to the sign-in screen (G1).
  async signOut() {
    return getSupabase().auth.signOut();
  },
};
