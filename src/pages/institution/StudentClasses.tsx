import { useNavigate } from "react-router-dom";
import { Bell, BookOpen, Plus } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { RefreshHint } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { studentCourses, schools } from "@/lib/fixtures";
import { routes, path } from "@/lib/routes";

/** 22 · My classes — the student's enrolled courses (private). Pull to refresh (G7). */
export default function StudentClasses() {
  const navigate = useNavigate();
  const campus = schools[0];

  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="flex-none px-[22px] pb-2 pt-1">
        <span className="mb-2 inline-flex items-center gap-2 rounded-pill bg-tg-stone2 py-1.5 pl-[7px] pr-3">
          <span
            className="flex h-[22px] w-[22px] items-center justify-center rounded-[7px] font-display text-[9px] font-bold text-white"
            style={{ background: campus.tint }}
          >
            {campus.initials}
          </span>
          <span className="font-display text-[11.5px] font-semibold">{campus.name}</span>
        </span>
        <h1 className="font-serif text-[26px] font-medium tracking-[-0.02em] text-tg-ink">My classes</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4 pt-2">
        <RefreshHint className="-mt-1 mb-1" />
        <div className="flex flex-col gap-2.5">
          {studentCourses.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(path(routes.studentClassPage, { id: c.id }))}
              className="rounded-lg border border-tg-line bg-tg-card p-[15px] text-left"
            >
              <div className="flex items-center gap-3.5">
                <span
                  className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[12px]"
                  style={{ background: c.tint }}
                >
                  <BookOpen size={21} className="text-white" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-[15.5px] font-semibold text-tg-ink">{c.name}</div>
                  <Meta className="mt-0.5 block">{c.prof} · {c.term}</Meta>
                </div>
                {c.unread > 0 && (
                  <span className="flex-none rounded-pill bg-tg-blue px-1.5 text-center font-display text-[11px] font-bold leading-[20px] text-white" style={{ minWidth: 20, height: 20 }}>
                    {c.unread}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-1.5 border-t border-tg-line-soft pt-3">
                <Bell size={13} className="text-tg-brown-soft" />
                <Meta className="flex-1 truncate">{c.last}</Meta>
                <span className="font-display text-[12px] font-semibold text-tg-blue-accent">Open</span>
              </div>
            </button>
          ))}

          <div className="mt-1.5 flex items-center gap-2.5 rounded-lg border-[1.5px] border-dashed border-tg-line bg-tg-card p-3.5">
            <Plus size={18} className="text-tg-blue-accent" />
            <span className="font-body text-[13.5px] text-tg-brown">Join a class with a code from your professor</span>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
