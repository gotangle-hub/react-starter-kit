import { useNavigate } from "react-router-dom";
import { ImagePlus, Pencil, Plus, Settings, Share2 } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Pill, Meta, PhotoTile } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { feed, me, works } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

/**
 * 47 · Your profile (G7). Banner + avatar (avatar overlaps but never drops below
 * the banner edge), name, disciplines, verified tick if earned, connection /
 * collaboration counts, and a grid of your work. No banner takes the page
 * background for the current mode (G15).
 */
export default function DesignerProfile() {
  const navigate = useNavigate();
  const mine = works.slice(0, 6);

  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        <RefreshHint />

        {/* Banner — none set, so it takes the page background for the current mode (G15) */}
        <div className="relative h-[148px] bg-tg-bg border-b border-tg-line">
          <div className="absolute inset-x-[18px] top-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-dashed border-tg-line px-3 py-1.5 font-display text-[12px] font-medium text-tg-brown-soft">
              <ImagePlus size={14} />
              Add a banner
            </span>
            <div className="flex gap-2.5">
              <button
                type="button"
                aria-label="Share profile"
                className="flex h-[34px] w-[34px] items-center justify-center rounded-pill bg-tg-stone2 text-tg-ink"
              >
                <Share2 size={16} />
              </button>
              <button
                type="button"
                aria-label="Settings"
                onClick={() => navigate("/settings")}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-pill bg-tg-stone2 text-tg-ink"
              >
                <Settings size={17} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-[22px]">
          {/* Avatar overlaps the banner edge but never drops below it */}
          <div className="-mt-[42px] flex items-end justify-between">
            <span className="rounded-pill" style={{ boxShadow: "0 0 0 4px var(--tg-bg)" }}>
              <Avatar maker={me} size={84} />
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
              <Pencil size={14} />
              Edit profile
            </Button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="font-serif text-[26px] font-medium leading-none tracking-[-0.02em] text-tg-ink">
              {me.name}
            </span>
            {me.verified && <VerifiedBadge size={18} />}
          </div>
          <Meta className="mt-1.5 block">
            {me.role} · {me.city}
          </Meta>

          {/* Counts */}
          <div className="my-4 flex gap-7">
            <button type="button" className="text-left" onClick={() => navigate(routes.yourNet)}>
              <div className="font-display text-[19px] font-semibold text-tg-ink">{me.connections}</div>
              <Meta>Connections</Meta>
            </button>
            <button type="button" className="text-left" onClick={() => navigate(routes.collabs)}>
              <div className="font-display text-[19px] font-semibold text-tg-ink">{me.collaborations}</div>
              <Meta>Collaborations</Meta>
            </button>
            <div>
              <div className="font-display text-[19px] font-semibold text-tg-ink">{works.length}</div>
              <Meta>Projects</Meta>
            </div>
          </div>

          <p className="mb-4 font-body text-[14.5px] leading-relaxed text-tg-ink">{me.bio}</p>

          <div className="mb-4 flex flex-wrap gap-2">
            {me.disciplines.map((d) => (
              <Pill key={d} small>
                {d}
              </Pill>
            ))}
          </div>

          {/* Verification affordance — yellow tick not yet earned (G11) */}
          {!me.verified && (
            <button
              type="button"
              onClick={() => navigate(routes.verification)}
              className="mb-4 flex w-full items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-3 text-left"
            >
              <VerifiedBadge size={22} />
              <div className="flex-1">
                <div className="font-display text-[14px] font-semibold text-tg-ink">Get verified</div>
                <Meta className="mt-0.5 block">Earn the yellow tick — verification is automatic.</Meta>
              </div>
              <Plus size={18} className="text-tg-brown-soft" />
            </button>
          )}

          {/* Work grid */}
          <div className="mb-3 flex items-center justify-between">
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
              Work
            </span>
            <button
              type="button"
              onClick={() => navigate(routes.workUpload)}
              className="inline-flex items-center gap-1 font-display text-[12.5px] font-semibold text-tg-blue-accent"
            >
              <Plus size={15} />
              Add work
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {mine.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => navigate("/explore")}
                className="overflow-hidden rounded-lg border border-tg-line"
              >
                <PhotoTile
                  width="100%"
                  height={120}
                  img={w.img ? feed(w.img) : undefined}
                  swatch={w.swatch}
                  label={w.title}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
