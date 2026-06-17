import { useNavigate } from "react-router-dom";
import { Hourglass, Zap } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { startCheckout } from "@/lib/checkout-intent";

const CAP = 15;

/**
 * 20 · Daily swipe cap. Free accounts get a fixed number of likes a day; this
 * explains the cap and offers Pro for unlimited. Editorial, centred.
 */
export default function SwipeCap() {
  const navigate = useNavigate();

  return (
    <MobileShell header={<BackHeader title="Match" />}>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center">
        <span className="flex h-[76px] w-[76px] items-center justify-center rounded-pill bg-tg-stone2">
          <Hourglass size={34} className="text-tg-blue-accent" />
        </span>

        <h1 className="mt-5 font-serif text-[28px] font-medium leading-[1.06] tracking-[-0.02em]">
          That&rsquo;s {CAP} for today.
        </h1>
        <p className="mt-2.5 max-w-[290px] font-body text-[15px] leading-[1.5] text-tg-brown">
          Free accounts get {CAP} likes a day. Your deck refills in{" "}
          <span className="font-semibold text-tg-ink">9h 24m</span> — or go unlimited with Pro.
        </p>

        <div className="mt-6 w-full max-w-[280px]">
          <div className="mb-1.5 flex justify-between">
            <Meta>Today</Meta>
            <Meta>
              {CAP} / {CAP}
            </Meta>
          </div>
          <div className="h-1.5 overflow-hidden rounded-pill bg-tg-stone2">
            <div className="h-full w-full rounded-pill bg-tg-yellow" />
          </div>
        </div>
      </div>

      <div className="px-[22px] pb-6">
        <Button full size="lg" onClick={() => startCheckout(navigate, { kind: "plan", reference: "designer-pro-monthly", label: "Tangle Pro — Designer", sublabel: "Monthly · unlimited swipes", currency: "AED", total: 6000 })}>
          <Zap size={16} className="mr-1.5" />
          Go unlimited with Pro
        </Button>
        <div className="mt-3 text-center">
          <button type="button" onClick={() => navigate(-1)}>
            <Meta>Remind me when it refills</Meta>
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
