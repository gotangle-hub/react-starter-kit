import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { WebPage } from "@/components/web/web-page";
import { useWebViewport } from "@/hooks/use-is-desktop";
import { useCheckout } from "@/hooks/use-checkout";
import {
  clearPendingCheckout,
  DEFAULT_CHECKOUT,
  getPendingCheckout,
  type PendingCheckout,
} from "@/lib/checkout-intent";

/**
 * 59 · Checkout (G6). Reads the pending intent (plan or boost) set by the
 * upgrade / promote CTAs, then hands off to Ziina hosted checkout. Card
 * collection happens on Ziina — we never see card data.
 */
export default function Checkout() {
  const navigate = useNavigate();
  const { checkout, status } = useCheckout();
  const [error, setError] = useState<string | null>(null);
  const [intent, setIntent] = useState<PendingCheckout>(DEFAULT_CHECKOUT);

  useEffect(() => {
    setIntent(getPendingCheckout() ?? DEFAULT_CHECKOUT);
  }, []);

  const totals = useMemo(() => {
    const totalMajor = intent.total / 100;
    const subtotal = +(totalMajor / 1.05).toFixed(2);
    const vat = +(totalMajor - subtotal).toFixed(2);
    return { totalMajor, subtotal, vat };
  }, [intent.total]);

  const pay = async () => {
    setError(null);
    const res = await checkout({
      kind: intent.kind,
      reference: intent.reference,
      currency: intent.currency,
      lineItems: [{ label: intent.label, amount: intent.total }],
      total: intent.total,
      test: intent.test,
      boost: intent.boost,
    });
    if (res.ok) {
      clearPendingCheckout();
      // Browser is being redirected to Ziina; nothing else to do.
    } else {
      setError(res.error ?? "Payment failed");
    }
  };

  const viewport = useWebViewport();
  const summary = (
    <>
        <div className="rounded-xl border border-tg-line bg-tg-card p-5">
          <div className="flex items-center justify-between">
            <span className="font-display text-[15px] font-semibold text-tg-ink">
              {intent.label}
            </span>
            <span className="font-mono text-[13px] text-tg-brown">
              {intent.kind === "plan" ? "Subscription" : "One-off"}
            </span>
          </div>
          {intent.sublabel && <Meta className="mt-1 block">{intent.sublabel}</Meta>}
          <div className="mt-4 flex flex-col gap-2 border-t border-tg-line-soft pt-3">
            <Row label="Subtotal" value={`${totals.subtotal.toFixed(2)} ${intent.currency}`} />
            <Row label="VAT (5%)" value={`${totals.vat.toFixed(2)} ${intent.currency}`} />
            <div className="mt-1 flex items-center justify-between border-t border-tg-line-soft pt-2.5">
              <span className="font-display text-[15px] font-semibold text-tg-ink">Total</span>
              <span className="font-display text-[16px] font-semibold text-tg-ink">
                {totals.totalMajor.toFixed(2)} {intent.currency}
              </span>
            </div>
            <Meta>Price includes VAT.</Meta>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-tg-line bg-tg-card p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-pill bg-tg-stone2">
              <ShieldCheck size={16} className="text-tg-blue-accent" />
            </span>
            <div>
              <div className="font-display text-[13px] font-semibold text-tg-ink">
                Secure hosted payment
              </div>
              <Meta className="mt-1 block">
                You&rsquo;ll continue on Ziina&rsquo;s secure page to enter card or Apple Pay
                details, then come straight back to Tangle.
              </Meta>
            </div>
          </div>
        </div>
    </>
  );

  const payButton = (
    <>
      <Button full size="lg" disabled={status === "processing"} onClick={pay}>
        <Lock size={16} />
        {status === "processing"
          ? "Opening secure checkout…"
          : `Pay ${totals.totalMajor.toFixed(2)} ${intent.currency}`}
      </Button>
      {error && (
        <p className="mt-2 text-center font-mono text-[12px] text-red-500">{error}</p>
      )}
      <p className="mt-2 flex items-center justify-center gap-1.5">
        <ShieldCheck size={12} className="text-tg-brown" />
        <Meta>Secured by Ziina · cards & Apple Pay</Meta>
      </p>
    </>
  );

  if (viewport !== "mobile") {
    return (
      <WebPage maxWidth={640}>
        <h1 className="mb-6 font-serif text-[34px] font-medium leading-none tracking-[-0.02em] text-tg-ink">
          Checkout
        </h1>
        {summary}
        <div className="mt-6">{payButton}</div>
      </WebPage>
    );
  }

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          {payButton}
        </div>
      }
    >
      <BackHeader title="Checkout" onBack={() => navigate(-1)} />
      <div className="px-[22px] py-4">{summary}</div>
    </MobileShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <Meta>{label}</Meta>
      <span className="font-mono text-[13px] text-tg-ink">{value}</span>
    </div>
  );
}
