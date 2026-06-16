import { useCallback, useSyncExternalStore } from "react";

/**
 * G12 — the welcome dialog and coachmark tour show EXACTLY ONCE, right after
 * sign-up. We persist a per-user "onboarding seen" flag the moment they finish
 * or skip, and never show either again. (Local for now; moves to the user's
 * profile row in Supabase once the backend is wired.)
 */
const KEY = "tangle.onboardingSeen";

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useOnboarding() {
  const seen = useSyncExternalStore(subscribe, read, () => false);

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(KEY, "true");
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  }, []);

  return { seen, markSeen, reset };
}
