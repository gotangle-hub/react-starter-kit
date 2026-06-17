import { useNavigate } from "react-router-dom";
import { Lock, Heart } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { makers } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

/**
 * 21 · Who liked you — a Pro feature. The grid of people who liked your work is
 * blurred and locked for free accounts, with an upgrade prompt over it (G7 pull
 * to refresh at the top).
 */
export default function WhoLiked() {
  const navigate = useNavigate();
  const likers = makers;
  const count = likers.length;

  return (
    <MobileShell header={<BackHeader title="Who liked you" />}>
      <div className="px-[22px] pb-3 pt-2">
        <RefreshHint />
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-serif text-[34px] font-medium leading-none text-tg-blue-accent">
            {count}
          </span>
          <span className="font-serif text-[20px] font-medium leading-[1.1] tracking-[-0.01em]">
            designers already like your work.
          </span>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-[22px]">
        {/* The grid — present but blurred for free accounts */}
        <div className="grid grid-cols-2 gap-3 opacity-90 blur-[7px]" aria-hidden>
          {likers.map((m) => (
            <div
              key={m.id}
              className="overflow-hidden rounded-lg border border-tg-line bg-tg-card"
            >
              <div className="h-24" style={{ background: m.tint, opacity: 0.9 }} />
              <div className="p-3">
                <div className="h-2.5 w-[70%] rounded-chip bg-tg-stone2" />
                <div className="mt-1.5 h-2 w-[45%] rounded-chip bg-tg-stone2" />
              </div>
            </div>
          ))}
        </div>

        {/* Lock + upgrade overlay */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-[22px] pb-6 pt-24">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-tg-bg" />
          <div className="relative flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-tg-emph text-tg-emph-text">
              <Lock size={20} />
            </span>
            <h2 className="mt-3.5 font-serif text-[22px] font-medium leading-[1.1] tracking-[-0.01em]">
              See everyone who liked you
            </h2>
            <p className="mt-2 max-w-[280px] font-body text-[14px] leading-[1.5] text-tg-brown">
              Upgrade to Pro to unlock inbound likes and connect instantly — no swiping
              required.
            </p>
            <Button size="lg" className="mt-4" onClick={() => startCheckout(navigate, { kind: "plan", reference: "designer-pro-monthly", label: "Tangle Pro — Designer", sublabel: "Monthly · unlimited swipes", currency: "AED", total: 6000 })}>
              <Heart size={16} className="mr-1.5" />
              Upgrade to Pro
            </Button>
            <div className="mt-3">
              <Meta>Free accounts can&rsquo;t see who liked them</Meta>
            </div>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
