import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Check, Gift, Plus } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { getPracticeStatus, type PracticeStatus } from "@/services/practice";
import { routes } from "@/lib/routes";

/**
 * Daily Practice screen.
 * - Designer-Individual free: 10-day cell grid, "Six days in." headline.
 * - Client free: numbered "I/II/III" steps, "Three in ten days." headline.
 * Mirrors streak.jsx exactly using existing tg-* tokens. No new colors/fonts.
 */
export default function Practice() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<PracticeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const s = await getPracticeStatus();
      if (!alive) return;
      setStatus(s);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <MobileShell footer={<AppTabBar />}>
        <div className="flex flex-1 items-center justify-center"><Meta>Loading…</Meta></div>
      </MobileShell>
    );
  }

  if (!status || status.kind === null || !status.eligible) {
    return (
      <MobileShell footer={<AppTabBar />}>
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <Meta className="block">Daily Practice isn't active on this account.</Meta>
        </div>
      </MobileShell>
    );
  }

  return status.kind === "designer"
    ? <DesignerView s={status} onBack={() => navigate(-1)} onAct={() => navigate(routes.workUpload)} />
    : <ClientView s={status} onBack={() => navigate(-1)} onAct={() => navigate(routes.postCallout)} />;
}

function DesignerView({
  s, onBack, onAct,
}: {
  s: Extract<PracticeStatus, { kind: "designer" }>;
  onBack: () => void;
  onAct: () => void;
}) {
  const streak = Math.min(s.streak, 10);
  const todayIdx = s.today_done ? streak - 1 : streak; // 0-based index of "today" cell
  const doneSet = new Set<string>(s.recent_days ?? []);
  const headline = headlineForStreak(streak);

  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="flex flex-none items-center justify-between px-[22px] pb-0 pt-1.5">
        <button type="button" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} className="text-tg-ink" />
        </button>
        <Meta>{streak} of 10</Meta>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px]">
        <div className="mt-4 mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-tg-blue-accent">
          Daily practice
        </div>
        <h1 className="font-serif text-[33px] font-medium leading-[1.04] tracking-[-0.02em] text-tg-ink">
          {headline}<span className="text-tg-blue-accent">.</span>
        </h1>
        <p className="mt-3 max-w-[304px] font-body text-[15px] leading-[1.55] text-tg-brown">
          Add a piece of work every day for ten days running, and the next month of{" "}
          <span className="font-semibold text-tg-ink">Pro is on us</span>. No points, no badges. Just the habit of showing your work.
        </p>

        <div className="my-[22px] grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => {
            const state: "done" | "today" | "future" =
              i < streak ? "done" : i === todayIdx && !s.today_done ? "today" : "future";
            return <DayCell key={i} n={i + 1} state={state} />;
          })}
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-tg-line bg-tg-card p-4">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-tg-stone2">
            <Gift size={19} className="text-tg-blue-accent" />
          </span>
          <div className="flex-1">
            <div className="font-display text-[14px] font-semibold leading-tight text-tg-ink">One month of Tangle Pro</div>
            <Meta className="mt-1 block">Unlocks on day ten · unlimited swipes, who liked you, full salary database</Meta>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Bell size={14} className="text-tg-brown-soft" />
          <Meta>Miss a day and the count starts over. We'll nudge you each evening.</Meta>
        </div>
        <div className="h-3" />
      </div>
      <div className="flex-none px-[22px] pb-3.5 pt-1.5">
        <Button full size="lg" onClick={onAct}>
          <Plus size={17} className="mr-1.5" />
          {s.today_done ? "Add another piece" : "Add today's work"}
        </Button>
        <div className="mt-3 text-center">
          <Meta>{s.today_done ? "Streak safe — come back tomorrow" : "Add work today to keep the streak"}</Meta>
        </div>
      </div>
    </MobileShell>
  );
}

function ClientView({
  s, onBack, onAct,
}: {
  s: Extract<PracticeStatus, { kind: "client" }>;
  onBack: () => void;
  onAct: () => void;
}) {
  const numerals = ["I", "II", "III"];
  const remaining = Math.max(0, 3 - s.count);
  const subline =
    s.count === 0 ? "Post three briefs in your first ten days"
    : remaining === 1 ? "One more to unlock your free month"
    : `${remaining} more to unlock your free month`;

  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="flex flex-none items-center justify-between px-[22px] pb-0 pt-1.5">
        <button type="button" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} className="text-tg-ink" />
        </button>
        <Meta>{s.count} of 3 · {s.days_left} days left</Meta>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px]">
        <div className="mt-4 mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-tg-blue-accent">
          Get started
        </div>
        <h1 className="font-serif text-[33px] font-medium leading-[1.04] tracking-[-0.02em] text-tg-ink">
          Three in ten days<span className="text-tg-blue-accent">.</span>
        </h1>
        <p className="mt-3 max-w-[308px] font-body text-[15px] leading-[1.55] text-tg-brown">
          Post three project briefs within your first ten days and a month of{" "}
          <span className="font-semibold text-tg-ink">Client Pro is on us</span>, so you can hire the moment you're ready.
        </p>

        <div className="mt-5">
          {numerals.map((num, i) => {
            const brief = s.briefs[i];
            const state: "done" | "today" | "future" =
              brief ? "done" : i === s.count ? "today" : "future";
            const title = brief?.title ?? (state === "today" ? `Your ${ordinal(i + 1)} brief` : `Brief ${num}`);
            const sub = brief
              ? `Posted day ${brief.day}`
              : state === "today" ? `Awaiting · ${s.days_left} days left`
              : "Locked";
            return <ClientStep key={num} numeral={num} title={title} sub={sub} state={state} />;
          })}
        </div>

        <div className="mt-[22px] flex items-center gap-3 rounded-2xl border border-tg-line bg-tg-card p-4">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-tg-stone2">
            <Gift size={19} className="text-tg-blue-accent" />
          </span>
          <div className="flex-1">
            <div className="font-display text-[14px] font-semibold leading-tight text-tg-ink">One month of Client Pro</div>
            <Meta className="mt-1 block">10 active briefs · unlimited talent pool · advanced search · salary database</Meta>
          </div>
        </div>
        <div className="h-3" />
      </div>
      <div className="flex-none px-[22px] pb-3.5 pt-1.5">
        <Button full size="lg" onClick={onAct}>
          <Plus size={17} className="mr-1.5" />
          Post a brief
        </Button>
        <div className="mt-3 text-center"><Meta>{subline}</Meta></div>
      </div>
    </MobileShell>
  );
}

function DayCell({ n, state }: { n: number; state: "done" | "today" | "future" }) {
  if (state === "done") {
    return (
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[11px] bg-tg-stone2">
        <span className="absolute left-[7px] top-[6px] font-mono text-[9px] text-tg-brown">
          {String(n).padStart(2, "0")}
        </span>
        <span className="absolute bottom-[6px] right-[6px] flex h-4 w-4 items-center justify-center rounded-full bg-tg-yellow">
          <Check size={10} className="text-tg-ink" strokeWidth={3} />
        </span>
      </div>
    );
  }
  if (state === "today") {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-[3px] rounded-[11px] border-[1.5px] border-tg-blue-accent">
        <Plus size={20} className="text-tg-blue-accent" strokeWidth={2.4} />
        <span className="font-display text-[8.5px] font-semibold uppercase tracking-[0.08em] text-tg-blue-accent">
          Today
        </span>
      </div>
    );
  }
  return (
    <div className="flex aspect-square items-center justify-center rounded-[11px] border border-dashed border-tg-line">
      <span className="font-mono text-[13px] text-tg-brown-soft">{String(n).padStart(2, "0")}</span>
    </div>
  );
}

function ClientStep({
  numeral, title, sub, state,
}: { numeral: string; title: string; sub: string; state: "done" | "today" | "future" }) {
  const done = state === "done";
  const today = state === "today";
  return (
    <div className="flex items-center gap-3.5 border-b border-tg-line py-[15px]">
      <span
        className={`w-[34px] flex-none font-serif text-[30px] italic leading-none ${done ? "text-tg-blue-accent" : "text-tg-brown-soft"}`}
      >
        {numeral}
      </span>
      <div className="min-w-0 flex-1">
        <div className={`font-display text-[15px] font-semibold leading-tight ${done ? "text-tg-ink" : "text-tg-brown"}`}>{title}</div>
        <Meta className="mt-1 block">{sub}</Meta>
      </div>
      {done ? (
        <span className="relative h-[46px] w-[46px] flex-none rounded-[10px] bg-tg-stone2">
          <span className="absolute -bottom-1.5 -right-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-tg-yellow ring-2 ring-tg-bg">
            <Check size={11} className="text-tg-ink" strokeWidth={3} />
          </span>
        </span>
      ) : (
        <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[10px] border border-dashed border-tg-line">
          {today ? <Plus size={18} className="text-tg-blue-accent" /> : null}
        </span>
      )}
    </div>
  );
}

function headlineForStreak(n: number): string {
  const words = ["Day one", "Two days in", "Three days in", "Four days in", "Five days in", "Six days in", "Seven days in", "Eight days in", "Nine days in", "Ten days, unbroken"];
  return n <= 0 ? "Start today" : words[Math.min(n, 10) - 1];
}

function ordinal(n: number) {
  return n === 1 ? "first" : n === 2 ? "second" : "third";
}
