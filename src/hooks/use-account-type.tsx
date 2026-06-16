import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { AccountType } from "@/lib/types";

/**
 * The signed-in account's type. Set when a journey's onboarding completes (the
 * tour lands in the app) and persisted, so the app shell — chiefly the bottom
 * tab bar — reflects who's using it. Defaults to "designer".
 */
const KEY = "tangle.accountType";

function read(): AccountType {
  try {
    const v = localStorage.getItem(KEY);
    if (v && ["designer", "studio", "client", "institution", "student", "collector"].includes(v)) {
      return v as AccountType;
    }
  } catch {
    /* ignore */
  }
  return "designer";
}

type Ctx = {
  accountType: AccountType;
  setAccountType: (t: AccountType) => void;
};

const AccountTypeContext = createContext<Ctx | null>(null);

export function AccountTypeProvider({ children }: { children: ReactNode }) {
  const [accountType, setType] = useState<AccountType>(read);

  const setAccountType = useCallback((t: AccountType) => {
    setType(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ accountType, setAccountType }), [accountType, setAccountType]);
  return <AccountTypeContext.Provider value={value}>{children}</AccountTypeContext.Provider>;
}

export function useAccountType(): Ctx {
  const ctx = useContext(AccountTypeContext);
  if (!ctx) throw new Error("useAccountType must be used within an <AccountTypeProvider>");
  return ctx;
}
