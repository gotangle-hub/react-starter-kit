/**
 * Pending checkout intent — set by an upgrade/boost CTA, consumed by the
 * Checkout summary screen, then handed off to Ziina hosted checkout.
 */
import type { NavigateFunction } from "react-router-dom";
import { routes } from "@/lib/routes";

export interface PendingCheckout {
  kind: "plan" | "boost";
  /** Stable identifier (e.g. designer-pro-monthly, boost-profile-7d). */
  reference: string;
  /** Short title shown on the Checkout summary. */
  label: string;
  /** Subline shown under the title (e.g. "Monthly · Designer Pro"). */
  sublabel?: string;
  /** ISO currency code (e.g. "AED"). */
  currency: string;
  /** VAT-inclusive total in minor units (e.g. AED fils = ×100). */
  total: number;
  /** Whether to charge in sandbox/test mode. */
  test?: boolean;
}

const KEY = "tangle:pendingCheckout";

export function setPendingCheckout(intent: PendingCheckout) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(intent));
  } catch {
    /* sessionStorage unavailable — caller will fall back to default */
  }
}

export function getPendingCheckout(): PendingCheckout | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingCheckout) : null;
  } catch {
    return null;
  }
}

export function clearPendingCheckout() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

export function startCheckout(navigate: NavigateFunction, intent: PendingCheckout) {
  setPendingCheckout(intent);
  navigate(routes.checkout);
}

/** Default fallback so direct visits to /checkout still work. */
export const DEFAULT_CHECKOUT: PendingCheckout = {
  kind: "plan",
  reference: "designer-pro-monthly",
  label: "Tangle Pro",
  sublabel: "Designer · Monthly",
  currency: "AED",
  total: 6000,
};
