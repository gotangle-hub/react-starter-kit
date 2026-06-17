import { useCallback, useState } from "react";

/**
 * Payment seam (Plans, Billing, Checkout, Promote).
 *
 * The full payment UI is built, but the money-moving action lives behind this
 * one clean hook with NO real processing. Lovable wires `checkout()` to Stripe
 * later by replacing the body of `processPayment` — the call sites don't change.
 */

export interface CheckoutLineItem {
  label: string;
  amount: number; // minor units (e.g. fils/cents)
}

export interface CheckoutRequest {
  /** What is being paid for. */
  kind: "plan" | "boost";
  /** Stable identifier for the plan or boost being purchased. */
  reference: string;
  currency: string; // e.g. "AED"
  lineItems: CheckoutLineItem[];
  /** VAT-inclusive total in minor units. */
  total: number;
}

export type CheckoutStatus = "idle" | "processing" | "success" | "error";

export interface CheckoutResult {
  ok: boolean;
  /** Reference returned by the processor — placeholder until Stripe is wired. */
  receiptId?: string;
  error?: string;
}

import { supabase } from "@/integrations/supabase/client";

async function processPayment(request: CheckoutRequest): Promise<CheckoutResult> {
  const { data, error } = await supabase.functions.invoke("ziina-checkout", {
    body: {
      kind: request.kind,
      reference: request.reference,
      currency: request.currency,
      total: request.total,
      description: request.lineItems.map((l) => l.label).join(" · "),
    },
  });
  if (error) return { ok: false, error: error.message };
  if (!data?.redirect_url) return { ok: false, error: data?.error ?? "No redirect URL" };
  // Hand off to Ziina hosted checkout. The user returns via success_url.
  window.location.href = data.redirect_url as string;
  return { ok: true, receiptId: data.id };
}

export function useCheckout() {
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const checkout = useCallback(
    async (request: CheckoutRequest): Promise<CheckoutResult> => {
      setStatus("processing");
      setResult(null);
      try {
        const res = await processPayment(request);
        setResult(res);
        setStatus(res.ok ? "success" : "error");
        return res;
      } catch (err) {
        const res: CheckoutResult = {
          ok: false,
          error: err instanceof Error ? err.message : "Payment failed",
        };
        setResult(res);
        setStatus("error");
        return res;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
  }, []);

  return { checkout, reset, status, result };
}
