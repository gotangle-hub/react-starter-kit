import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * G12 — the welcome dialog and coachmark tour show EXACTLY ONCE per ACCOUNT,
 * forever. Source of truth is `profiles.onboarding_seen_at` on the server;
 * localStorage is only a fast cache so the first paint doesn't flash welcome
 * for a returning user. The server value always wins on resolve.
 */
const KEY = "tangle.onboardingSeen";

function readCache(): boolean {
  try {
    return localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}
function writeCache(v: boolean) {
  try {
    if (v) localStorage.setItem(KEY, "true");
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function useOnboarding() {
  const [seen, setSeen] = useState<boolean>(readCache);
  const [loaded, setLoaded] = useState<boolean>(false);

  // Fetch server truth and defer to it.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) {
        if (!cancelled) setLoaded(true);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("onboarding_seen_at")
        .eq("id", uid)
        .maybeSingle();
      if (cancelled) return;
      if (!error) {
        const serverSeen = !!data?.onboarding_seen_at;
        setSeen(serverSeen);
        writeCache(serverSeen);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const markSeen = useCallback(async () => {
    setSeen(true);
    writeCache(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    await supabase
      .from("profiles")
      .update({ onboarding_seen_at: new Date().toISOString() })
      .eq("id", uid)
      .is("onboarding_seen_at", null); // idempotent: first stamp wins
  }, []);

  const reset = useCallback(() => {
    setSeen(false);
    writeCache(false);
  }, []);

  return { seen, loaded, markSeen, reset };
}
