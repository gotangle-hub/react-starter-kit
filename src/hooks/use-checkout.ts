import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Payment seam — wired to Ziina hosted checkout via the
 * `ziina-create-payment` edge function. The function creates a Ziina
 * payment intent, persists an `orders` row, and returns a redirect URL
 * the browser is sent to. After payment, Ziina returns the user to
 * /confirm/payment which calls `ziina-verify-payment` to finalise the
 * order status.
 */

export interface CheckoutLineItem {
  label: string;
  amount: number; // minor units (e.g. fils/cents)
}

export interface CheckoutRequest {
  kind: "plan" | "boost";
  reference: string;
  currency: string; // e.g. "AED"
  lineItems: CheckoutLineItem[];
  /** VAT-inclusive total in minor units. */
  total: number;
  /** Pass true while testing against Ziina sandbox. */
  test?: boolean;
  /** Boost-specific metadata persisted with the order + boost row. */
  boost?: {
    boost_kind: "profile" | "post" | "callout" | "community" | "creator";
    target_id?: string | null;
    product_id: string;
    product_name: string;
    audience: string;
    duration_days: number;
    daily_budget_minor: number;
  };
}

export type CheckoutStatus = "idle" | "processing" | "success" | "error";

export interface CheckoutResult {
  ok: boolean;
  intentId?: string;
  redirectUrl?: string;
  error?: string;
}

async function processPayment(request: CheckoutRequest): Promise<CheckoutResult> {
  const origin = window.location.origin;
  const { data, error } = await supabase.functions.invoke("ziina-create-payment", {
    body: {
      kind: request.kind,
      reference: request.reference,
      currency: request.currency,
      amount: request.total,
      message: request.lineItems[0]?.label ?? `Tangle · ${request.reference}`,
      success_url: `${origin}/confirm/payment?intent={PAYMENT_INTENT_ID}`,
      cancel_url: `${origin}/checkout`,
      failure_url: `${origin}/checkout`,
      test: request.test ?? false,
    },
  });
  if (error) return { ok: false, error: error.message };
  if (!data?.redirect_url) return { ok: false, error: "No redirect URL from Ziina" };
  // Hand off to Ziina hosted checkout.
  window.location.href = data.redirect_url;
  return { ok: true, intentId: data.id, redirectUrl: data.redirect_url };
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
