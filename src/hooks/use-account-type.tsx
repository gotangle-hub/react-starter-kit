import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AccountType } from "@/lib/types";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";

/**
 * The signed-in account's type. Authoritative value comes from the secure
 * `profiles` table (RLS-protected, account_type column is locked server-side
 * so it cannot be self-modified). LocalStorage is used ONLY as a transient
 * UI hint during the signup flow (which option the user picked on the
 * AccountType screen) — it is never trusted for access control.
 *
 * Defaults to "designer" until a session resolves.
 */
const PENDING_KEY = "tangle.pendingAccountType";
const VALID: readonly AccountType[] = ["designer", "studio", "client", "institution", "student", "collector"];

function readPending(): AccountType {
  try {
    const v = localStorage.getItem(PENDING_KEY);
    if (v && (VALID as readonly string[]).includes(v)) return v as AccountType;
  } catch {
    /* ignore */
  }
  return "designer";
}

type Ctx = {
  accountType: AccountType;
  /** Records the user's onboarding choice locally so signup can submit it. */
  setAccountType: (t: AccountType) => void;
};

const AccountTypeContext = createContext<Ctx | null>(null);

export function AccountTypeProvider({ children }: { children: ReactNode }) {
  const { session, isAuthenticated } = useSession();
  const [pending, setPending] = useState<AccountType>(readPending);
  const [serverType, setServerType] = useState<AccountType | null>(null);

  // Fetch authoritative account_type from server when signed in.
  useEffect(() => {
    let active = true;
    if (!isAuthenticated || !session?.user) {
      setServerType(null);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", session.user.id)
        .maybeSingle();
      if (active && data?.account_type && (VALID as readonly string[]).includes(data.account_type)) {
        setServerType(data.account_type as AccountType);
      }
    })();
    return () => {
      active = false;
    };
  }, [isAuthenticated, session?.user?.id]);

  const setAccountType = useCallback((t: AccountType) => {
    setPending(t);
    try {
      localStorage.setItem(PENDING_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ accountType: serverType ?? pending, setAccountType }),
    [serverType, pending, setAccountType],
  );
  return <AccountTypeContext.Provider value={value}>{children}</AccountTypeContext.Provider>;
}

export function useAccountType(): Ctx {
  const ctx = useContext(AccountTypeContext);
  if (!ctx) throw new Error("useAccountType must be used within an <AccountTypeProvider>");
  return ctx;
}
