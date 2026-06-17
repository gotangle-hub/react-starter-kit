import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, X, Loader2 } from "lucide-react";
import { StateSuccess } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";
import { supabase } from "@/integrations/supabase/client";

type VerifyStatus = "checking" | "paid" | "failed" | "canceled" | "pending";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const intentId = params.get("intent");
  const [status, setStatus] = useState<VerifyStatus>(intentId ? "checking" : "paid");

  useEffect(() => {
    if (!intentId) return;
    (async () => {
      const { data, error } = await supabase.functions.invoke("ziina-verify-payment", {
        body: null,
        method: "GET" as never,
        // supabase-js doesn't accept query strings directly; use fetch fallback:
      } as never).catch(() => ({ data: null, error: null as never }));

      if (error || !data) {
        // Fallback: direct fetch with query param
        try {
          const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ziina-verify-payment?id=${encodeURIComponent(intentId)}`;
          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          });
          const json = await res.json();
          setStatus((json?.status as VerifyStatus) ?? "pending");
        } catch {
          setStatus("pending");
        }
        return;
      }
      setStatus((data.status as VerifyStatus) ?? "pending");
    })();
  }, [intentId]);

  if (status === "checking") {
    return (
      <StateSuccess
        icon={Loader2}
        tone="ok"
        chip="Verifying"
        title="Confirming your payment…"
        body="Hold on a moment while we check with Ziina."
        primary={{ label: "Done", to: routes.home }}
      />
    );
  }

  if (status === "paid") {
    return (
      <StateSuccess
        icon={Check}
        tone="ok"
        chip="Payment complete"
        title="Payment received."
        body="Thank you — your plan is active. A receipt is saved under Billing."
        primary={{ label: "Done", to: routes.home }}
        secondary={{ label: "View billing", to: routes.billing }}
      />
    );
  }

  return (
    <StateSuccess
      icon={X}
      tone="yellow"
      chip="Payment not completed"
      title={status === "canceled" ? "Payment canceled." : "Payment failed."}
      body="No charge was made. You can try again from checkout."
      primary={{ label: "Back to checkout", to: routes.checkout }}
      secondary={{ label: "Home", to: routes.home }}
    />
  );
}
