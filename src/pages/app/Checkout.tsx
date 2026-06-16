import { useNavigate } from "react-router-dom";
import { CreditCard, Lock } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { TextField } from "@/components/app/fields";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/hooks/use-checkout";
import { routes } from "@/lib/routes";

/**
 * 59 · Checkout (G6). Plan/boost summary, VAT-inclusive total, pay. The pay
 * action runs through the checkout() seam (no real charge yet — Stripe later).
 */
export default function Checkout() {
  const navigate = useNavigate();
  const { checkout, status } = useCheckout();

  const subtotal = 57.14;
  const vat = 2.86;
  const total = 60;

  const pay = async () => {
    const res = await checkout({
      kind: "plan",
      reference: "designer-pro-monthly",
      currency: "AED",
      lineItems: [{ label: "Tangle Pro — monthly", amount: 6000 }],
      total: 6000,
    });
    if (res.ok) navigate(routes.paymentSuccess);
  };

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" disabled={status === "processing"} onClick={pay}>
            <Lock size={16} />
            {status === "processing" ? "Processing…" : `Pay ${total} AED`}
          </Button>
          <p className="mt-2 text-center">
            <Meta>Secured payment · cancel anytime</Meta>
          </p>
        </div>
      }
    >
      <BackHeader title="Checkout" />
      <div className="px-[22px] py-4">
        <div className="rounded-lg border border-tg-line bg-tg-card p-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-[15px] font-semibold text-tg-ink">Tangle Pro</span>
            <span className="font-mono text-[13px] text-tg-brown">Monthly</span>
          </div>
          <Meta className="mt-1 block">Unlimited collaborations, who liked you, advanced filters and more.</Meta>
          <div className="mt-4 flex flex-col gap-2 border-t border-tg-line-soft pt-3">
            <Row label="Subtotal" value={`${subtotal.toFixed(2)} AED`} />
            <Row label="VAT (5%)" value={`${vat.toFixed(2)} AED`} />
            <div className="mt-1 flex items-center justify-between border-t border-tg-line-soft pt-2.5">
              <span className="font-display text-[15px] font-semibold text-tg-ink">Total</span>
              <span className="font-display text-[16px] font-semibold text-tg-ink">{total.toFixed(2)} AED</span>
            </div>
            <Meta>Price includes VAT.</Meta>
          </div>
        </div>

        <div className="mb-2.5 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
          Payment method
        </div>
        <div className="flex flex-col gap-3">
          <TextField label="Card number" mono icon={<CreditCard size={17} />} placeholder="0000 0000 0000 0000" />
          <div className="flex gap-3">
            <div className="flex-1">
              <TextField label="Expiry" mono placeholder="MM / YY" />
            </div>
            <div className="flex-1">
              <TextField label="CVC" mono placeholder="123" />
            </div>
          </div>
          <TextField label="Name on card" placeholder="Muna Abbas" />
        </div>
      </div>
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
