import { useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

/** 35 · Empty state — nothing saved yet. Keeps the collector tab bar + header. */
export default function EmptySaved() {
  const navigate = useNavigate();
  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="flex flex-none items-center justify-between px-[22px] pb-1 pt-1.5">
        <div>
          <Meta>Your collections</Meta>
          <div className="mt-0.5 font-serif text-[26px] font-medium tracking-[-0.02em]">Saved</div>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-9 text-center">
        <span className="mb-[18px] flex h-[66px] w-[66px] items-center justify-center rounded-pill bg-tg-stone2">
          <Bookmark size={28} className="text-tg-brown-soft" />
        </span>
        <h2 className="font-display text-[18px] font-semibold text-tg-ink">Nothing saved yet</h2>
        <p className="mt-2 max-w-[270px] font-body text-[13.5px] leading-[1.55] text-tg-brown">
          Tap the bookmark on any work to save it here and sort it into collections.
        </p>
        <div className="mt-[18px]">
          <Button variant="outline" onClick={() => navigate(routes.collectorExplore)}>Explore work</Button>
        </div>
      </div>
    </MobileShell>
  );
}
