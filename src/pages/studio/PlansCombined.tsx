import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Info } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Chip } from "@/components/brand/chip";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { clientPlans, designerPlans, studioPlans, type TierPlan } from "@/lib/plans";
import { routes } from "@/lib/routes";
import { startCheckout } from "@/lib/checkout-intent";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

/**
 * 04 · Combined plan picker (studio / client). A single horizontal toggle splits
 * the audience into equal thirds. Studio tiers share an identical feature set and
 * differ only by team size; Client tiers are Free/Pro/Business. Real, VAT-inclusive.
 */
const AUDS = ["Designer", "Studio", "Client"] as const;
type Aud = (typeof AUDS)[number];

export default function PlansCombined() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSession();
  const [aud, setAud] = useState<Aud>("Studio");
  const plans = aud === "Designer" ? designerPlans : aud === "Studio" ? studioPlans : clientPlans;
  const featured = plans.find((p) => p.featured) ?? plans[1] ?? plans[0];
  const cta =
    aud === "Designer" ? "Pro — 60 AED/mo" : aud === "Studio" ? "Studio — 399 AED/mo" : "Client Pro — 120 AED/mo";
  const ref =
    aud === "Designer"
      ? "designer-pro-monthly"
      : aud === "Studio"
        ? "studio-monthly"
        : "client-pro-monthly";
  const totalMinor =
    aud === "Designer" ? 6000 : aud === "Studio" ? 39900 : 12000;

  const goPaid = () => {
    if (!isAuthenticated) {
      navigate(`${routes.signup}?type=${aud.toLowerCase()}`);
      return;
    }
    startCheckout(navigate, {
      kind: "plan",
      reference: ref,
      label: `Tangle ${featured.name}`,
      sublabel: `${aud} · Monthly`,
      currency: "AED",
      total: totalMinor,
    });
  };

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" onClick={goPaid}>
            Continue with {cta}
          </Button>
          <p className="mt-2.5 text-center">
            <button type="button" onClick={() => navigate(`${routes.signup}?type=${aud.toLowerCase()}`)}>
              <Meta>Stay on Free</Meta>
            </button>
          </p>
        </div>
      }
    >
      <div className="flex flex-none items-center gap-3 px-[22px] pt-1.5">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={22} className="text-tg-ink" />
        </button>
        <span className="font-display text-[15px] font-semibold">Plans</span>
      </div>

      <div className="px-[22px] pb-2.5 pt-3.5">
        <Chip>Plans</Chip>
        <h1 className="mt-3 font-serif text-[28px] font-medium leading-[1.04] tracking-[-0.02em]">
          Start free. Upgrade when the work outgrows the limits.
        </h1>
        {/* Equal-thirds audience toggle */}
        <div className="mt-4 flex w-full gap-1 rounded-pill bg-tg-stone2 p-1">
          {AUDS.map((a) => {
            const on = aud === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => setAud(a)}
                className={cn(
                  "min-w-0 flex-1 rounded-pill py-2.5 text-center font-display text-[13px] font-semibold transition-colors",
                  on ? "bg-tg-emph text-tg-emph-text" : "text-tg-brown",
                )}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-[22px] pb-4 pt-1">
        {plans.map((p) => (
          <PlanCard key={p.id} plan={p} />
        ))}
        <div className="mt-0.5 flex items-center justify-center gap-1.5">
          <Info size={13} className="text-tg-brown-soft" />
          <Meta>All prices include VAT.</Meta>
        </div>
      </div>
    </MobileShell>
  );
}

function PlanCard({ plan: p }: { plan: TierPlan }) {
  return (
    <div className={cn("rounded-lg border-[1.5px] p-[18px]", p.featured ? "border-tg-emph bg-tg-emph text-tg-emph-text" : "border-tg-line bg-tg-card text-tg-ink")}>
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-[18px] font-semibold">{p.name}</span>
          {p.featured && (
            <span className="rounded-chip bg-tg-yellow px-1.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.12em] text-tg-ink dark:text-white">
              Popular
            </span>
          )}
        </div>
        <div className="text-right">
          <span className={cn("font-serif text-[24px]", p.featured ? "text-tg-emph-text" : "text-tg-blue-accent")}>{p.price}</span>
          <span className={cn("ml-1 font-mono text-[11px]", p.featured ? "text-tg-emph-text/60" : "text-tg-brown")}>{p.unit}</span>
        </div>
      </div>
      {p.meta && <p className={cn("mt-1 font-mono text-[11px]", p.featured ? "text-tg-emph-text/70" : "text-tg-brown")}>{p.meta}</p>}
      <p className={cn("my-1.5 font-body text-[13px]", p.featured ? "text-tg-emph-text/65" : "text-tg-brown")}>{p.tagline}</p>
      <div className="mt-1 flex flex-col gap-2">
        {p.features.slice(0, p.featured ? 6 : 4).map((f, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <Check size={15} strokeWidth={2.5} className={cn("mt-0.5 flex-none", p.featured ? "text-tg-yellow" : "text-tg-blue-accent")} />
            <span className={cn("font-body text-[13px] leading-snug", p.featured ? "text-tg-emph-text/90" : "text-tg-ink")}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
