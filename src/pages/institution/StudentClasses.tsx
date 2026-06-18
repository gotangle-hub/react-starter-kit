import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Lock } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { RefreshHint } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { listMyClasses, type ClassSummary } from "@/services/classes";
import { routes, path } from "@/lib/routes";

/** 22 · My classes — the student's enrolled classes (private). */
export default function StudentClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassSummary[] | null>(null);

  useEffect(() => {
    listMyClasses().then((all) => setClasses(all.filter((c) => c.my_role === "student")));
  }, []);

  const list = classes ?? [];

  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="flex-none px-[22px] pb-2 pt-1">
        <h1 className="font-serif text-[26px] font-medium tracking-[-0.02em] text-tg-ink">My classes</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4 pt-2">
        <RefreshHint className="-mt-1 mb-1" />
        <div className="mb-3 flex items-center gap-2">
          <Lock size={13} className="text-tg-brown-soft" />
          <Meta>Visible only to you and your class.</Meta>
        </div>
        <div className="flex flex-col gap-2.5">
          {list.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(path(routes.studentClassPage, { id: c.id }))}
              className="rounded-lg border border-tg-line bg-tg-card p-[15px] text-left"
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[12px] bg-tg-blue">
                  <BookOpen size={21} className="text-white" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-[15.5px] font-semibold text-tg-ink">{c.name}</div>
                  <Meta className="mt-0.5 block">{c.class_type === "studio" ? "Studio" : "Theory"}{c.year ? ` · ${c.year}` : ""} · {c.member_count} members</Meta>
                </div>
              </div>
            </button>
          ))}

          {classes !== null && list.length === 0 && (
            <div className="rounded-lg border border-dashed border-tg-line bg-tg-card p-6 text-center">
              <Meta className="block">You're not enrolled in any classes yet.</Meta>
              <Meta className="mt-1 block">Your professor adds you to a class — it'll show up here.</Meta>
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  );
}
