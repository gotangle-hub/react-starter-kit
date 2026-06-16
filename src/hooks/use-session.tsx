import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { authService } from "@/services/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * Session context (G1 — stay signed in).
 * Restores the persisted session on app open and keeps it in sync. When
 * Supabase isn't wired yet, it resolves to "no session" without error so the
 * foundation still runs.
 */
type SessionContextValue = {
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  backendReady: boolean;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    authService.getSession().then((s) => {
      if (active) {
        setSession(s);
        setLoading(false);
      }
    });

    const unsubscribe = authService.onAuthStateChange((s) => {
      if (active) setSession(s);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      loading,
      isAuthenticated: Boolean(session),
      backendReady: isSupabaseConfigured,
    }),
    [session, loading],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a <SessionProvider>");
  }
  return ctx;
}
