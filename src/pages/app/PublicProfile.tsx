import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, MoreHorizontal, Plus } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Pill, Meta, PhotoTile } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { feed, makerById, works } from "@/lib/fixtures";
import { path, routes } from "@/lib/routes";

/**
 * 68 · Someone's public profile (G7). Their work grid, verified tick, Connect +
 * Message, and the ⋯ menu (report / block). Same banner/avatar rule as your own
 * profile: avatar overlaps but never drops below the banner edge; with no banner
 * the area takes the page background for the current mode (G15).
 */
export default function PublicProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const maker = makerById(id ?? "");
  const theirWork = works.filter((w) => w.maker === maker.id);
  const grid = theirWork.length ? theirWork : works.slice(0, 4);

  return (
    <MobileShell>
      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        <RefreshHint />

        {/* Banner — none set, takes page background (G15). Back arrow sits over it. */}
        <div className="relative h-[148px] bg-tg-bg border-b border-tg-line">
          <div className="absolute inset-x-[18px] top-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Back"
              onClick={() => navigate(-1)}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-pill bg-tg-stone2 text-tg-ink"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="More"
              onClick={() => navigate(routes.userMenu)}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-pill bg-tg-stone2 text-tg-ink"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        <div className="px-[22px]">
          {/* Avatar overlaps the banner edge but never drops below it */}
          <div className="-mt-[42px]">
            <span className="rounded-pill" style={{ boxShadow: "0 0 0 4px var(--tg-bg)" }}>
              <Avatar maker={maker} size={84} />
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="font-serif text-[26px] font-medium leading-none tracking-[-0.02em] text-tg-ink">
              {maker.name}
            </span>
            {maker.verified && <VerifiedBadge size={18} />}
          </div>
          <Meta className="mt-1.5 block">
            {maker.role} · {maker.city}
          </Meta>

          {maker.skills && (
            <div className="mt-3.5 flex flex-wrap gap-2">
              {maker.skills.map((s) => (
                <Pill key={s} small>
                  {s}
                </Pill>
              ))}
            </div>
          )}

          {/* Connect + Message */}
          <div className="mt-4 flex gap-2.5">
            <Button variant="primary" full onClick={() => navigate(routes.request)}>
              <Plus size={16} />
              Connect
            </Button>
            <Button
              variant="outline"
              full
              onClick={() => navigate(path(routes.dmThread, { id: maker.id }))}
            >
              <MessageCircle size={16} />
              Message
            </Button>
          </div>

          {/* Work grid */}
          <div className="mb-3 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
            Work
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {grid.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => navigate(path(routes.projectDetail, { id: w.id }))}
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
