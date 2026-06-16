import { useNavigate } from "react-router-dom";
import { CreditCard, Download } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Chip } from "@/components/brand/chip";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { billingHistory } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

/** 58 · Billing (G6). Plan, payment method, receipts/history. */
export default function Billing() {
  const navigate = useNavigate();
  return (
    <MobileShell>
      <BackHeader title="Billing & payments" />
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-4 pb-10">
        {/* Current plan */}
        <div className="rounded-lg bg-tg-emph p-5 text-tg-emph-text">
          <div className="flex items-center justify-between">
            <Chip>Tangle Pro</Chip>
            <span className="font-serif text-[24px]">60 AED<span className="ml-1 font-mono text-[11px] text-tg-emph-text/60">/ mo</span></span>
          </div>
          <Meta className="mt-3 block !text-tg-emph-text/65">Renews 1 Jul 2026 · cancel anytime</Meta>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => navigate(routes.plans)}>Change plan</Button>
            <Button size="sm" variant="quiet">Cancel</Button>
          </div>
        </div>

        <div className="mb-2.5 mt-6 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
          Payment method
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-tg-stone2">
            <CreditCard size={20} className="text-tg-ink" />
          </span>
          <div className="flex-1">
            <span className="block font-display text-[14px] font-semibold text-tg-ink">Visa ·· 4242</span>
            <Meta>Expires 08 / 28</Meta>
          </div>
          <Button size="sm" variant="outline">Update</Button>
        </div>

        <div className="mb-2.5 mt-6 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
          Receipts
        </div>
        <div className="overflow-hidden rounded-lg border border-tg-line bg-tg-card">
          {billingHistory.map((b, i) => (
            <div key={b.id} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-tg-line-soft" : ""}`}>
              <div className="flex-1">
                <span className="block font-display text-[14px] font-medium text-tg-ink">{b.label}</span>
                <Meta>{b.date} · {b.status}</Meta>
              </div>
              <span className="font-mono text-[13px] text-tg-ink">{b.amount}</span>
              <button type="button" aria-label="Download receipt" className="text-tg-brown-soft">
                <Download size={17} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
