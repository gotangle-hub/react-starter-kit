import { useNavigate } from "react-router-dom";
import { ChevronRight, Lock, Plus, UsersRound } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { RefreshHint } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { professorClasses } from "@/lib/fixtures";
import { routes, path } from "@/lib/routes";

/** 24 · The professor's classes list. Pull to refresh (G7). */
export default function ClassList() {
  const navigate = useNavigate();

  const open = (c: (typeof professorClasses)[number]) =>
    navigate(
      c.kind === "studio"
        ? path(routes.studioClassPage, { id: c.id })
        : path(routes.theoreticalClassPage, { id: c.id }),
    );

  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="flex flex-none items-center justify-between px-[22px] pb-2.5 pt-1">
        <div>
          <Meta>Professor · Royal College of Art</Meta>
          <h1 className="mt-0.5 font-serif text-[24px] font-medium tracking-[-0.02em] text-tg-ink">Design classes</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate(routes.professorCreateClass)}
          aria-label="Create a class"
          className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-pill bg-tg-emph"
        >
          <Plus size={20} className="text-tg-emph-text" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4 pt-1">
        <RefreshHint className="-mt-1" />
        <div className="mb-3 flex items-center gap-2">
          <Lock size={13} className="text-tg-brown-soft" />
          <Meta>Class pages are visible only to enrolled students.</Meta>
        </div>

        <div className="flex flex-col gap-2.5">
          {professorClasses.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => open(c)}
              className="flex items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-[15px] text-left"
            >
              <span
                className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[12px]"
                style={{ background: c.tint }}
              >
                <UsersRound size={22} className="text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display text-[15.5px] font-semibold text-tg-ink">{c.name}</span>
                  <span className="rounded-chip border border-tg-line px-1.5 py-[3px] font-display text-[10px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
                    {c.tag}
                  </span>
                </div>
                <Meta className="mt-1 block">{c.students} students · {c.last}</Meta>
              </div>
              <ChevronRight size={19} className="text-tg-brown-soft" />
            </button>
          ))}

          <button
            type="button"
            onClick={() => navigate(routes.professorCreateClass)}
            className="flex items-center gap-3 rounded-lg border-[1.5px] border-dashed border-tg-line bg-tg-card p-[15px] text-left"
          >
            <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[12px] bg-tg-stone2">
              <Plus size={22} className="text-tg-blue-accent" />
            </span>
            <div>
              <div className="font-display text-[15px] font-semibold text-tg-ink">Create a class page</div>
              <Meta className="mt-0.5 block">Add students, documents, pins & a group chat.</Meta>
            </div>
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
