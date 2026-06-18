import { useNavigate } from "react-router-dom";
import { CreditCard, Receipt } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Chip } from "@/components/brand/chip";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

/**
 * 58 · Billing (G6). Plan, payment method, receipts.
 * Receipts are pulled from real `orders` rows — empty until the first payment
 * completes (G14 — no sample receipts).
 */
export default function Billing() {
  const navigate = useNavigate();
  // Real receipts list will be wired to the `orders` table once a query exists.
  const receipts: Array<{ id: string; label: string; date: string; amount: string; status: string }> = [];

  return (
    <MobileShell>
      <BackHeader title="Billing & payments" />
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-4 pb-10">
        {/* Current plan */}
        <div className="rounded-lg bg-tg-emph p-5 text-tg-emph-text">
          <div className="flex items-center justify-between">
            <Chip>Tangle Free</Chip>
            <span className="font-serif text-[24px]">0 AED<span className="ml-1 font-mono text-[11px] text-tg-emph-text/60">/ mo</span></span>
          </div>
          <Meta className="mt-3 block !text-tg-emph-text/65">No active subscription · upgrade to Pro for more.</Meta>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => navigate(routes.plans)}>Change plan</Button>
          </div>
        </div>

        <div className="mb-2.5 mt-6 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
          Payment method
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-tg-line bg-tg-card p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-tg-stone2">
            <CreditCard size={20} className="text-tg-brown" />
          </span>
          <div className="flex-1">
            <span className="block font-display text-[14px] font-semibold text-tg-ink">No card on file</span>
            <Meta>Add a card when you upgrade or boost.</Meta>
          </div>
        </div>

        <div className="mb-2.5 mt-6 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
          Receipts
        </div>
        {receipts.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-tg-line bg-tg-card px-4 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
              <Receipt size={20} />
            </span>
            <Meta className="mt-3 block">No receipts yet. Payments appear here after checkout.</Meta>
          </div>
        ) : null}
      </div>
    </MobileShell>
  );
}
