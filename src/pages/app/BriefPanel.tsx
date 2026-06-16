import { useState } from "react";
import { Check } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { makers, me } from "@/lib/fixtures";
import { cn } from "@/lib/utils";

/**
 * 41 · Project brief (G10) — the shared brief inside a collaboration: scope,
 * tasks/checklist, milestones & timeline, and a role for each member.
 */

const TASKS = [
  { id: "t1", text: "Agree on the concept direction", done: true },
  { id: "t2", text: "Site analysis & precedent board", done: true },
  { id: "t3", text: "Draft the plan and section set", done: false },
  { id: "t4", text: "Physical model — 1:50 sectional", done: false },
  { id: "t5", text: "Final boards & submission render", done: false },
];

const MILESTONES = [
  { id: "m1", label: "Concept locked", when: "Jun 20", state: "done" as const },
  { id: "m2", label: "Drawings to review", when: "Jul 04", state: "active" as const },
  { id: "m3", label: "Model photographed", when: "Jul 18", state: "todo" as const },
  { id: "m4", label: "Submission", when: "Aug 30", state: "todo" as const },
];

const ROLES: { maker: typeof me | (typeof makers)[number]; role: string }[] = [
  { maker: me, role: "Concept & drawings" },
  { maker: makers[0], role: "Architecture lead" },
  { maker: makers[2], role: "Boards & type" },
  { maker: makers[3], role: "Modelling & visualisation" },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-3 mt-7 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
      {children}
    </div>
  );
}

export default function BriefPanel() {
  const [done, setDone] = useState<Record<string, boolean>>(
    Object.fromEntries(TASKS.map((t) => [t.id, t.done])),
  );
  const completed = Object.values(done).filter(Boolean).length;

  return (
    <MobileShell header={<BackHeader title="Project brief" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-10">
        <h1 className="mt-4 font-serif text-[26px] font-medium leading-[1.05] tracking-[-0.02em] text-tg-ink">
          Desert Pavilion 2026
        </h1>
        <Meta className="mt-1 block">Competition team · {ROLES.length} members</Meta>

        {/* Scope — editorial dark panel */}
        <SectionLabel>Scope</SectionLabel>
        <div className="rounded-lg bg-tg-emph p-4">
          <p className="font-body text-[14.5px] leading-[1.55] text-tg-emph-text">
            A small shade structure for the desert site — one material, one gesture. The brief
            rewards restraint over spectacle: warm concrete, a single section that carries the idea,
            and drawings that read at a glance.
          </p>
        </div>

        {/* Tasks / checklist */}
        <SectionLabel>Tasks</SectionLabel>
        <div className="flex items-baseline justify-between">
          <Meta>{completed} of {TASKS.length} complete</Meta>
        </div>
        <div className="mt-3 flex flex-col divide-y divide-tg-line-soft overflow-hidden rounded-lg border border-tg-line bg-tg-card">
          {TASKS.map((t) => {
            const on = done[t.id];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setDone((d) => ({ ...d, [t.id]: !d[t.id] }))}
                className="flex items-center gap-3 px-4 py-3 text-left"
              >
                <span
                  className={cn(
                    "flex h-5 w-5 flex-none items-center justify-center rounded-chip border",
                    on ? "border-tg-blue bg-tg-blue text-white" : "border-tg-line bg-transparent",
                  )}
                >
                  {on && <Check size={13} strokeWidth={2.5} />}
                </span>
                <span
                  className={cn(
                    "font-body text-[14.5px] leading-snug",
                    on ? "text-tg-brown-soft line-through" : "text-tg-ink",
                  )}
                >
                  {t.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Milestones & timeline — vertical timeline */}
        <SectionLabel>Milestones & timeline</SectionLabel>
        <div className="relative pl-1">
          {MILESTONES.map((m, i) => {
            const last = i === MILESTONES.length - 1;
            return (
              <div key={m.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                {/* node + connector */}
                <div className="flex flex-none flex-col items-center">
                  <span
                    className={cn(
                      "mt-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-pill border-2",
                      m.state === "done" && "border-tg-blue bg-tg-blue",
                      m.state === "active" && "border-tg-blue-accent bg-tg-bg",
                      m.state === "todo" && "border-tg-line bg-tg-bg",
                    )}
                  />
                  {!last && <span className="mt-0.5 w-px flex-1 bg-tg-line" />}
                </div>
                <div className="-mt-0.5 flex min-w-0 flex-1 items-baseline justify-between gap-3">
                  <span
                    className={cn(
                      "font-display text-[14.5px]",
                      m.state === "todo" ? "font-medium text-tg-brown" : "font-semibold text-tg-ink",
                    )}
                  >
                    {m.label}
                  </span>
                  <Meta>{m.when}</Meta>
                </div>
              </div>
            );
          })}
        </div>

        {/* Roles for each member */}
        <SectionLabel>Roles</SectionLabel>
        <div className="flex flex-col divide-y divide-tg-line-soft overflow-hidden rounded-lg border border-tg-line bg-tg-card">
          {ROLES.map(({ maker, role }) => (
            <div key={maker.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar maker={maker} size={38} />
              <div className="min-w-0 flex-1">
                <NameRow maker={maker} size={14} />
                <Meta className="mt-0.5 block">{role}</Meta>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
