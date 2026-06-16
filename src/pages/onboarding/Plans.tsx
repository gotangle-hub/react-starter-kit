import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Chip } from "@/components/brand/chip";
import { Meta } from "@/components/brand/atoms";
import { MobileShell } from "@/components/app/mobile-shell";
import { Button } from "@/components/ui/button";
import { designerPlans } from "@/lib/fixtures";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** 06 · Designer plans — Free vs Pro, real pricing, VAT-inclusive note. */
export default function Plans() {
  const navigate = useNavigate();
  return (
    <MobileShell
      footer={
        <div className="flex-none px-[22px] pb-7 pt-3">
          {/* Pro upgrade routes through Checkout → checkout() (no real charge yet). */}
          <Button full size="lg" onClick={() => navigate(routes.signup)}>
            Continue with Pro — 60 AED/mo
          </Button>
          <p className="mt-3 text-center">
            <button type="button" onClick={() => navigate(routes.signup)}>
              <Meta>Continue with Free plan</Meta>
            </button>
          </p>
          <p className="mt-2 text-center">
            <Meta>Prices include VAT.</Meta>
          </p>
        </div>
      }
    >
      <div className="flex flex-none items-center gap-3 px-[22px] pt-1.5">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={22} className="text-tg-ink" />
        </button>
        <span className="font-display text-[15px] font-semibold">Choose your plan</span>
      </div>

      <div className="px-[22px] pb-1.5 pt-3.5">
        <Chip>Designer</Chip>
        <h1 className="mt-3 font-serif text-[30px] font-medium leading-[1.04] tracking-[-0.02em]">
          Start free. Upgrade when the work outgrows the limits.
        </h1>
      </div>

      <div className="flex flex-col gap-3 px-[22px] pb-4 pt-2">
        {designerPlans.map((p) => (
          <div
            key={p.id}
            className={cn(
              "relative rounded-lg border-[1.5px] p-[18px]",
              p.featured ? "border-tg-emph bg-tg-emph text-tg-emph-text" : "border-tg-line bg-tg-card text-tg-ink",
            )}
          >
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display text-[18px] font-semibold">{p.name}</span>
                {p.featured && (
                  <span className="rounded-chip bg-tg-yellow px-1.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.12em] text-tg-ink dark:text-white">
                    Recommended
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className={cn("font-serif text-[26px]", p.featured ? "text-tg-emph-text" : "text-tg-blue-accent")}>
                  {p.price}
                </span>
                <span className={cn("ml-1 font-mono text-[11px]", p.featured ? "text-tg-emph-text/60" : "text-tg-brown")}>
                  {p.unit}
                </span>
              </div>
            </div>
            <p className={cn("my-1.5 font-body text-[13px]", p.featured ? "text-tg-emph-text/65" : "text-tg-brown")}>
              {p.tagline}
              {p.annual ? ` · or ${p.annual}` : ""}
            </p>
            <div className="flex flex-col gap-2">
              {p.features.slice(0, p.featured ? 7 : 5).map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Check
                    size={15}
                    strokeWidth={2.5}
                    className={cn("mt-0.5 flex-none", p.featured ? "text-tg-yellow" : "text-tg-blue-accent")}
                  />
                  <span className={cn("font-body text-[13px] leading-snug", p.featured ? "text-tg-emph-text/90" : "text-tg-ink")}>
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MobileShell>
  );
}
