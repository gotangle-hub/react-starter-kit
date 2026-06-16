import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/brand/avatar";
import { Meta, PhotoTile } from "@/components/brand/atoms";
import { feed, makers, me, works } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

/** 17 · Collector profile — own profile and collection (no published work). */
const STATS = [
  ["85", "Saved"],
  ["12", "Collections"],
  ["47", "Following"],
];
const HEIGHTS = [140, 180, 150, 200];

export default function CollectorProfile() {
  const navigate = useNavigate();
  const following = makers.slice(0, 5);

  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Simple header — no banner; collectors don't publish work */}
        <div className="flex items-center justify-between px-[22px] pt-3.5">
          <Logo size={20} />
          <button type="button" onClick={() => navigate(routes.settingsCollector)} aria-label="Settings">
            <Settings size={20} className="text-tg-ink" />
          </button>
        </div>

        <div className="flex items-center gap-4 px-[22px] pt-[18px]">
          <Avatar maker={me} size={68} ring />
          <div className="flex-1">
            <div className="font-display text-[19px] font-semibold">{me.name}</div>
            <Meta className="mt-0.5 block">Collector · Dubai</Meta>
          </div>
        </div>

        <div className="flex gap-6 px-[22px] pb-1 pt-4">
          {STATS.map(([n, l]) => (
            <div key={l}>
              <span className="font-display text-[18px] font-semibold text-tg-ink">{n}</span> <Meta>{l}</Meta>
            </div>
          ))}
        </div>

        {/* Following rail */}
        <div className="pt-3.5">
          <div className="mx-[22px] mb-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">Following</div>
          <div className="flex gap-4 overflow-x-auto px-[22px]">
            {following.map((m) => (
              <button key={m.id} type="button" onClick={() => navigate(`/u/${m.id}`)} className="flex w-[58px] flex-none flex-col items-center gap-1.5">
                <Avatar maker={m} size={50} ring />
                <span className="text-center font-display text-[11px] font-semibold">{m.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recently saved */}
        <div className="mx-[22px] mb-2.5 mt-[18px] font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">Recently saved</div>
        <div className="px-4 pb-4 [column-gap:10px]" style={{ columnCount: 2 }}>
          {works.slice(0, 4).map((w, i) => (
            <div key={w.id} className="mb-2.5 break-inside-avoid overflow-hidden rounded-lg">
              <PhotoTile width="100%" height={HEIGHTS[i % HEIGHTS.length]} img={w.img ? feed(w.img) : undefined} swatch={w.swatch ?? "#E7DDCB"} label={w.title} radius={12} />
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
