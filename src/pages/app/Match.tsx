import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, SlidersHorizontal, X, Heart } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Pill, Meta } from "@/components/brand/atoms";
import { makers, feed, posts } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

const DAILY_CAP = 15;

/**
 * 17 · Swipe to connect. A deck of designers/studios shown over their work,
 * ordered for you (the tech is never named). Like → if mutual you CONNECT and a
 * chat opens. Free accounts hit a daily cap; Pro is unlimited.
 */
export default function Match() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(DAILY_CAP - 3);

  const maker = makers[index % makers.length];
  // Pair each maker with a piece of their work as the card background.
  const work = posts.find((p) => p.maker === maker.id) ?? posts[index % posts.length];

  function next() {
    setIndex((i) => i + 1);
  }

  function pass() {
    next();
  }

  function like() {
    if (left <= 0) {
      navigate(routes.swipeCap);
      return;
    }
    setLeft((n) => n - 1);
    // A like that lands as mutual opens the connection celebration.
    navigate(routes.mutualMatch);
  }

  return (
    <MobileShell
      header={
        <BackHeader
          title="Match"
          right={
            <button
              type="button"
              aria-label="Filter matches"
              onClick={() => navigate(routes.matchFilters)}
              className="flex h-9 w-9 items-center justify-center rounded-pill text-tg-ink"
            >
              <SlidersHorizontal size={20} />
            </button>
          }
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col px-[22px] pb-5 pt-2">
        {/* Daily cap meter (free account) */}
        <div className="flex items-center justify-between">
          <Meta>Suggested for you</Meta>
          <span className="font-mono text-[11px] text-tg-brown">{left} left today</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-pill bg-tg-stone2">
          <div
            className="h-full rounded-pill bg-tg-yellow transition-all"
            style={{ width: `${(left / DAILY_CAP) * 100}%` }}
          />
        </div>

        {/* The card — a designer shown over their work */}
        <div className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-xl border border-tg-line shadow-card">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${feed(work.img)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />

          {/* Match percentage, top-right */}
          <div className="absolute right-4 top-4 rounded-pill bg-white/15 px-3 py-1.5 backdrop-blur">
            <span className="font-display text-[15px] font-semibold text-white">{maker.match}%</span>
            <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.1em] text-white/70">match</span>
          </div>

          {/* Maker detail, bottom */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <Meta className="text-white/70">{work.title}</Meta>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="font-serif text-[27px] font-medium leading-none tracking-[-0.02em] text-white">
                {maker.name}
              </span>
              {maker.verified && <VerifiedBadge size={18} />}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-white/80">
              <span className="font-display text-[13.5px]">{maker.role}</span>
              <span className="text-white/40">·</span>
              <MapPin size={13} className="text-white/70" />
              <span className="font-display text-[13.5px]">{maker.city}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(maker.skills ?? []).map((s) => (
                <span
                  key={s}
                  className="rounded-chip bg-white/15 px-2.5 py-1 font-display text-[12px] font-medium text-white backdrop-blur"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Pass / Like */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Pass"
            onClick={pass}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-pill border border-tg-line bg-tg-card text-tg-ink"
          >
            <X size={20} />
            <span className="font-display text-[14px] font-semibold">Pass</span>
          </button>
          <button
            type="button"
            aria-label="Like to connect"
            onClick={like}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-pill bg-tg-blue text-white"
          >
            <Heart size={20} />
            <span className="font-display text-[14px] font-semibold">Connect</span>
          </button>
        </div>
        <div className="mt-3 flex justify-center">
          <Pill onClick={() => navigate(routes.matchFilters)} small>
            Refine who appears
          </Pill>
        </div>
      </div>
    </MobileShell>
  );
}
