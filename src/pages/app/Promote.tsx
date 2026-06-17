import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Megaphone, Rocket } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { promoProducts } from "@/lib/fixtures";
import { startCheckout } from "@/lib/checkout-intent";
import { cn } from "@/lib/utils";

const AUDIENCES = ["Designers near me", "My disciplines", "Everyone"];
const DURATIONS = [
  { label: "3 days", mult: 0.5 },
  { label: "7 days", mult: 1 },
  { label: "14 days", mult: 1.8 },
];

/**
 * 57 · Promote / boost (G6). Pick what to boost, audience, duration & budget,
 * see a price, confirm → Checkout. The profile-boost card is black in BOTH modes
 * (it does not swap), matching the light treatment.
 */
export default function Promote() {
  const navigate = useNavigate();
  const [product, setProduct] = useState(promoProducts[0].id);
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [duration, setDuration] = useState(1);
  const [budget, setBudget] = useState(120);

  const base = 40;
  const total = Math.round(base * DURATIONS[duration].mult + budget * 0.2);

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" onClick={() => navigate(routes.checkout)}>
            Review &amp; pay — {total} AED
          </Button>
          <p className="mt-2 text-center">
            <Meta>Reach updates live once the boost is running.</Meta>
          </p>
        </div>
      }
    >
      <BackHeader title="Promote your work" />
      <div className="px-[22px] py-4 pb-6">
        {/* The profile-boost hero card — black in both light & dark (no swap) */}
        <div className="rounded-lg bg-[#161514] p-5 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-white/12">
            <Rocket size={20} className="text-[#F4D738]" />
          </span>
          <h1 className="mt-3 font-serif text-[26px] font-medium leading-tight tracking-[-0.02em]">
            Put strong work in front of the right designers.
          </h1>
          <p className="mt-2 font-body text-[14px] leading-relaxed text-white/70">
            Boosted work is shown first — woven in cleverly, never dumped — and stays
            relevant to who's seeing it.
          </p>
        </div>

        <SectionLabel>What to boost</SectionLabel>
        <div className="flex flex-col gap-2.5">
          {promoProducts.map((p) => {
            const on = product === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setProduct(p.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border-[1.5px] p-3.5 text-left transition-colors",
                  on ? "border-tg-emph bg-tg-emph text-tg-emph-text" : "border-tg-line bg-tg-card",
                )}
              >
                <span className="flex-1">
                  <span className={cn("block font-display text-[15px] font-semibold", on ? "text-tg-emph-text" : "text-tg-ink")}>{p.name}</span>
                  <span className={cn("mt-0.5 block font-body text-[12.5px]", on ? "text-tg-emph-text/65" : "text-tg-brown")}>{p.desc}</span>
                </span>
                <span className="text-right">
                  <span className={cn("block font-display text-[14px] font-semibold", on ? "text-tg-emph-text" : "text-tg-blue-accent")}>{p.price}</span>
                  <span className={cn("font-mono text-[10px]", on ? "text-tg-emph-text/60" : "text-tg-brown")}>{p.unit}</span>
                </span>
                {on && <Check size={18} className="text-tg-emph-text" />}
              </button>
            );
          })}
        </div>

        <SectionLabel>Audience</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {AUDIENCES.map((a) => (
            <Toggle key={a} on={audience === a} onClick={() => setAudience(a)}>{a}</Toggle>
          ))}
        </div>

        <SectionLabel>Duration</SectionLabel>
        <div className="flex gap-2">
          {DURATIONS.map((d, i) => (
            <Toggle key={d.label} on={duration === i} onClick={() => setDuration(i)}>{d.label}</Toggle>
          ))}
        </div>

        <SectionLabel>Daily budget</SectionLabel>
        <div className="rounded-lg border border-tg-line bg-tg-card p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-[26px] text-tg-blue-accent">{budget} AED</span>
            <Meta>per day</Meta>
          </div>
          <input
            type="range"
            min={40}
            max={400}
            step={20}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="mt-3 w-full accent-tg-blue"
          />
          <div className="mt-3 flex items-center gap-2 border-t border-tg-line-soft pt-3">
            <Megaphone size={15} className="text-tg-blue-accent" />
            <Meta>Estimated reach 2,400–3,800 designers</Meta>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <div className="mb-2.5 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">{children}</div>;
}

function Toggle({ children, on, onClick }: { children: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-pill border px-3.5 py-2 text-[13px] font-medium transition-colors",
        on ? "border-tg-inv bg-tg-inv text-tg-inv-text" : "border-tg-line bg-tg-card text-tg-brown",
      )}
    >
      {children}
    </button>
  );
}
