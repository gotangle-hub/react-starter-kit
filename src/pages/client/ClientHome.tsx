import { useNavigate } from "react-router-dom";
import { Bell, Plus } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { makers } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

/** 11 · Client home (G2, G6, G7). Post-a-brief CTA, pipeline, matched talent. */
const STATS = [
  ["2", "Open briefs"],
  ["18", "Applicants"],
  ["5", "Saved talent"],
];

export default function ClientHome() {
  const navigate = useNavigate();
  const talent = makers.filter((m) => m.id !== "studio").slice(0, 4);

  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="flex flex-none items-center justify-between px-[22px] pb-3 pt-2">
        <div>
          <Meta>Client · Studio Habitat</Meta>
          <div className="mt-0.5 font-serif text-[24px] font-medium tracking-[-0.02em]">Find your next maker.</div>
        </div>
        <button type="button" className="relative" aria-label="Notifications" onClick={() => navigate(routes.notifications)}>
          <Bell size={23} className="text-tg-ink" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-pill bg-tg-blue ring-[1.5px] ring-tg-bg" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4">
        <RefreshHint />
        {/* Post a brief CTA */}
        <div className="relative overflow-hidden rounded-lg bg-tg-emph p-[18px] text-white">
          <div className="font-serif text-[20px] font-medium leading-tight tracking-[-0.01em]">
            Post a brief, meet matched creatives in hours.
          </div>
          <p className="my-2 max-w-[250px] font-body text-[13px] leading-snug text-white/70">
            Describe the work — Tangle shortlists designers and studios that fit.
          </p>
          <button
            type="button"
            onClick={() => navigate(routes.postCallout)}
            className="inline-flex items-center gap-2 rounded-DEFAULT bg-white px-4 py-2.5 font-display text-[14px] font-semibold text-tg-ink"
          >
            <Plus size={16} />
            New brief
          </button>
        </div>

        {/* Pipeline */}
        <div className="mt-4 flex gap-2.5">
          {STATS.map(([n, l]) => (
            <div key={l} className="flex-1 rounded-lg border border-tg-line bg-tg-card px-3 py-3.5">
              <div className="font-serif text-[24px] text-tg-blue-accent">{n}</div>
              <Meta className="mt-1 block">{l}</Meta>
            </div>
          ))}
        </div>

        {/* Matched talent */}
        <div className="mb-3 mt-6 flex items-baseline justify-between">
          <span className="font-serif text-[19px] font-medium tracking-[-0.02em]">Matched to your last brief</span>
          <button type="button" onClick={() => navigate(routes.talentPool)}>
            <Meta>See all</Meta>
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {talent.map((m) => (
            <button key={m.id} type="button" onClick={() => navigate(`/u/${m.id}`)} className="flex items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-3 text-left">
              <Avatar maker={m} size={46} />
              <div className="min-w-0 flex-1">
                <NameRow maker={m} size={14.5} />
                <Meta className="mt-0.5 block">{m.role} · {m.city}</Meta>
              </div>
              <div className="text-right">
                <div className="font-display text-[15px] font-semibold text-tg-blue-accent">{m.match}%</div>
                <Meta>match</Meta>
              </div>
            </button>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
