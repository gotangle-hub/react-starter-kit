import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Heart } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { startCheckout } from "@/lib/checkout-intent";
import { supabase } from "@/integrations/supabase/client";

/**
 * 21 · Who liked you — a Pro feature.
 * Real count of pending inbound connection requests; the actual rows are
 * blurred and locked for free accounts (Pro unlocks names + faces).
 */
export default function WhoLiked() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count: c } = await supabase
        .from("connection_requests")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("status", "pending");
      if (alive) setCount(c ?? 0);
    })();
    return () => { alive = false; };
  }, []);

  // Render up to 8 abstract blurred tiles representing the inbound likes.
  const tiles = Array.from({ length: Math.min(count, 8) });

  return (
    <MobileShell header={<BackHeader title="Who liked you" />}>
      <div className="px-[22px] pb-3 pt-2">
        <RefreshHint />
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-serif text-[34px] font-medium leading-none text-tg-blue-accent">
            {count}
          </span>
          <span className="font-serif text-[20px] font-medium leading-[1.1] tracking-[-0.01em]">
            {count === 1 ? "designer already likes your work." : "designers already like your work."}
          </span>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-[22px]">
        {tiles.length === 0 ? (
          <div className="mt-10 flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
              <Heart size={22} />
            </span>
            <h2 className="mt-4 font-serif text-[20px] font-medium tracking-[-0.01em]">No likes yet</h2>
            <Meta className="mt-1.5 block max-w-[260px]">When other designers like you in Match, you&rsquo;ll see them here.</Meta>
          </div>
        ) : (
          <>
            {/* Abstract blurred grid — no faces, no names; representative tiles */}
            <div className="grid grid-cols-2 gap-3 opacity-90 blur-[7px]" aria-hidden>
              {tiles.map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-tg-line bg-tg-card">
                  <div className="h-24" style={{ background: "var(--tg-stone2)" }} />
                  <div className="p-3">
                    <div className="h-2.5 w-[70%] rounded-chip bg-tg-stone2" />
                    <div className="mt-1.5 h-2 w-[45%] rounded-chip bg-tg-stone2" />
                  </div>
                </div>
              ))}
            </div>

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
                  Upgrade to Pro to unlock inbound likes and connect instantly — no swiping required.
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
          </>
        )}
      </div>
    </MobileShell>
  );
}
