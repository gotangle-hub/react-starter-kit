import { NavLink } from "react-router-dom";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Tangle WEB right rail — ported to match the reference (`web.jsx` →
 * `FeedRail`). Visible only at the desktop breakpoint (≥1100px). Mini profile,
 * Daily Practice blue card with progress, People to connect with, Competitions
 * closing soon, footer.
 *
 * Empty / placeholder-free per G14: numbers and lists fall back to honest
 * "nothing yet" states until real data is wired in.
 */
export function RightRail() {
  return (
    <aside className="sticky top-0 hidden h-[100dvh] w-[320px] flex-none flex-col gap-4 overflow-y-auto bg-tg-page-board px-5 py-7 min-[1100px]:flex">
      {/* Mini profile */}
      <div className="flex items-center gap-3 px-1 pb-2">
        <div className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full bg-tg-blue text-[18px] font-semibold text-white">
          {/* Avatar placeholder — initials from real user when wired */}
          ·
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] font-semibold text-tg-ink">You</span>
          <span className="mt-0.5 truncate text-[12px] text-tg-brown">Your account</span>
        </div>
      </div>

      {/* Daily Practice — blue card */}
      <div className="rounded-2xl bg-tg-blue p-4 text-white">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/70">
          Daily practice
        </div>
        <div className="mt-2 font-serif text-[21px] leading-tight">Start your streak.</div>
        <div className="my-3 flex gap-[5px]">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-[6px] flex-1 rounded-[3px]",
                i < 0 ? "bg-tg-yellow" : "bg-white/25",
              )}
            />
          ))}
        </div>
        <p className="text-[12px] leading-[1.5] text-white/85">
          Add work daily for ten days, the next month of Pro is on us.
        </p>
      </div>

      {/* People to connect with */}
      <section className="rounded-2xl border border-tg-line bg-tg-bg p-4">
        <header className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
            People to connect with
          </span>
          <NavLink to={routes.searchPeople} className="text-[11px] text-tg-blue-accent">
            See all
          </NavLink>
        </header>
        <p className="text-[12.5px] leading-[1.55] text-tg-brown-soft">
          As you save and engage, suggestions will appear here.
        </p>
      </section>

      {/* Competitions closing soon */}
      <section className="rounded-2xl border border-tg-line bg-tg-bg p-4">
        <header className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
            Competitions closing soon
          </span>
          <NavLink to={routes.competitions} className="text-[11px] text-tg-blue-accent">
            Browse
          </NavLink>
        </header>
        <p className="text-[12.5px] leading-[1.55] text-tg-brown-soft">
          Live competitions appear here as Tangle scans the world.
        </p>
      </section>

      {/* Footer */}
      <div className="mt-auto px-1 pb-2 font-mono text-[11px] leading-[1.7] text-tg-brown-soft">
        About · Help · Privacy · Terms
        <br />© {new Date().getFullYear()} Tangle
      </div>
    </aside>
  );
}
