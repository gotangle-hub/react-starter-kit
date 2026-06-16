import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid2x2, House, MessageCircle, Plus, Search, User } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Dots } from "@/components/brand/atoms";
import { MobileShell } from "@/components/app/mobile-shell";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useAccountType } from "@/hooks/use-account-type";
import type { AccountType } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Coachmark tour (G12). Shown EXACTLY ONCE. The screen behind is dimmed with a
 * spotlight on the element being explained; a white bubble carries the step. The
 * first step is a centred Welcome card; the last says "Got it". On finish or skip
 * we persist the onboarding-seen flag and never show either again.
 *
 * Reused across journeys — each passes its own steps + landing route.
 */
export interface TourStep {
  title: string;
  body: string;
  /** Faux tab index to spotlight (0–4), or null for the welcome card. */
  spotlight: number | null;
}

const TABS = [House, Grid2x2, Plus, Search, MessageCircle, User];

export function CoachmarkTour({
  steps,
  landTo,
  accountType,
}: {
  steps: TourStep[];
  landTo: string;
  /** Set when the tour lands in the app, so the tab bar matches the journey. */
  accountType?: AccountType;
}) {
  const navigate = useNavigate();
  const { markSeen } = useOnboarding();
  const { setAccountType } = useAccountType();
  const [step, setStep] = useState(0);
  const s = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  const finish = () => {
    markSeen();
    if (accountType) setAccountType(accountType);
    navigate(landTo, { replace: true });
  };

  return (
    <MobileShell>
      <div className="relative flex flex-1 flex-col">
        <div className="relative flex-1">
          <div className="flex items-center justify-between px-5 pt-3">
            <Logo size={20} />
            <span className="h-9 w-9 rounded-pill bg-tg-stone2" />
          </div>
          <div className="px-5 pt-4">
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg bg-tg-stone2" style={{ height: 120 + (i % 2) * 40 }} />
              ))}
            </div>
          </div>
          <div className="absolute inset-0 bg-black/55" />
        </div>

        <FauxTabBar spotlight={s.spotlight} />

        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center px-5 pb-28">
          <div className="w-full max-w-[340px] rounded-xl bg-white p-5 text-tg-ink shadow-float">
            {!isFirst && (
              <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-tg-brown">
                Step {step} of {steps.length - 1}
              </div>
            )}
            <div className={cn("font-serif font-medium tracking-[-0.02em]", isFirst ? "text-[26px]" : "text-[20px]")}>
              {s.title}
            </div>
            <p className="mt-2 font-body text-[14.5px] leading-relaxed text-tg-brown">{s.body}</p>
            <div className="mt-5 flex items-center justify-between">
              {isFirst ? <span /> : <Dots count={steps.length - 1} index={step - 1} />}
              <div className="flex items-center gap-3">
                {!isLast && (
                  <button type="button" onClick={finish} className="text-[13px] font-medium text-tg-brown">
                    Skip
                  </button>
                )}
                <Button size="sm" onClick={() => (isLast ? finish() : setStep((v) => v + 1))}>
                  {isFirst ? "Start" : isLast ? "Got it" : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

function FauxTabBar({ spotlight }: { spotlight: number | null }) {
  return (
    <div className="relative z-[1] flex items-end border-t border-tg-line bg-tg-bg px-1.5 pb-7 pt-2.5">
      {TABS.filter((_, i) => i !== 2).map((Icon, i) => {
        const lit = spotlight === i;
        return (
          <div key={i} className="flex flex-1 flex-col items-center">
            <span
              className={cn("flex h-9 w-9 items-center justify-center rounded-pill transition-all", lit && "bg-tg-blue-accent/15 ring-2 ring-tg-blue-accent")}
              style={lit ? { position: "relative", zIndex: 30 } : undefined}
            >
              <Icon size={22} className={lit ? "text-tg-blue-accent" : "text-tg-brown-soft"} strokeWidth={lit ? 2.25 : 1.75} />
            </span>
          </div>
        );
      })}
    </div>
  );
}
