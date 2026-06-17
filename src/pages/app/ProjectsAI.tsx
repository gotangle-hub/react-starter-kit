import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Pin, Users } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Pill, Meta } from "@/components/brand/atoms";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  listCompetitions,
  refreshCompetitions,
  getUserState,
  setUserState,
  type Competition,
} from "@/services/competitions";

const FILTERS = {
  Field: ["Any field", "Architecture", "Interiors", "Product", "Type"],
  Location: ["Anywhere", "UAE", "Global"],
  Deadline: ["Any deadline", "This month", "Next 3 months"],
  Prize: ["Any prize", "Cash", "Publication"],
  Eligibility: ["Any eligibility", "all", "students", "pros"],
};

/**
 * 34 · Competitions — live world scan (G5, G7, G4).
 * Data is loaded from public.competitions and visibly re-scanned by invoking
 * the refresh-competitions edge function. Filters apply on the client. The
 * powering technology is never named (G4).
 */
export default function ProjectsAI() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"world" | "tangle">("world");
  const [active, setActive] = useState<Record<string, string>>({
    Field: "Any field",
    Location: "Anywhere",
    Deadline: "Any deadline",
    Prize: "Any prize",
    Eligibility: "Any eligibility",
  });
  const [items, setItems] = useState<Competition[]>([]);
  const [userState, setUserStateMap] = useState<Record<string, { pinned: boolean; interested: boolean }>>({});
  const [scanning, setScanning] = useState(true);

  async function load() {
    setScanning(true);
    const rows = await listCompetitions({
      field: active.Field,
      location: active.Location,
      deadline: active.Deadline,
      prize: active.Prize,
      eligibility: active.Eligibility,
    });
    setItems(rows);
    setUserStateMap(await getUserState());
    setScanning(false);
  }

  useEffect(() => {
    // Trigger a backend refresh on mount, then load; also poll periodically.
    refreshCompetitions().finally(load);
    const t = setInterval(() => {
      refreshCompetitions().finally(load);
    }, 45_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-filter when pills change.
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.Field, active.Location, active.Deadline, active.Prize, active.Eligibility]);

  return (
    <MobileShell header={<BackHeader title="Find competitions" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-8">
        <RefreshHint />

        <div className="mt-1 flex gap-5 border-b border-tg-line">
          <Tab label="Live scan" on={tab === "world"} onClick={() => setTab("world")} />
          <Tab label="Tangle" on={tab === "tangle"} onClick={() => navigate(routes.tangleComps)} />
        </div>

        <div className="mt-4 flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            {scanning && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-pill bg-tg-blue opacity-60" />
            )}
            <span className="relative inline-flex h-2.5 w-2.5 rounded-pill bg-tg-blue" />
          </span>
          <span className="font-display text-[13px] font-semibold text-tg-ink">
            {scanning ? "Scanning the world for live calls…" : "Up to date"}
          </span>
        </div>
        <Meta className="mt-1 block">
          {items.length} open competitions found · repopulating as results arrive
        </Meta>

        <div className="mt-4 flex flex-col gap-2.5">
          {Object.entries(FILTERS).map(([group, opts]) => (
            <div key={group} className="flex gap-2 overflow-x-auto pb-0.5">
              {opts.map((o) => (
                <Pill
                  key={o}
                  small
                  on={active[group] === o}
                  onClick={() => setActive((a) => ({ ...a, [group]: o }))}
                >
                  {o === "all" ? "All" : o === "students" ? "Students" : o === "pros" ? "Pros" : o}
                </Pill>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {items.map((k) => (
            <CompCard
              key={k.id}
              k={k}
              state={userState[k.id] ?? { pinned: false, interested: false }}
              onPin={async (next) => {
                setUserStateMap((s) => ({ ...s, [k.id]: { ...(s[k.id] ?? { pinned: false, interested: false }), pinned: next } }));
                await setUserState(k.id, { pinned: next });
              }}
              onInterested={async (next) => {
                setUserStateMap((s) => ({ ...s, [k.id]: { ...(s[k.id] ?? { pinned: false, interested: false }), interested: next } }));
                await setUserState(k.id, { interested: next });
              }}
            />
          ))}
          {!items.length && !scanning && (
            <Meta className="mt-6 block text-center">No live calls match those filters yet.</Meta>
          )}
        </div>
      </div>
    </MobileShell>
  );
}

function Tab({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 pb-2.5 font-display text-[14px] font-semibold transition-colors",
        on ? "border-tg-blue-accent text-tg-ink" : "border-transparent text-tg-brown",
      )}
    >
      {label}
    </button>
  );
}

function CompCard({
  k,
  state,
  onPin,
  onInterested,
}: {
  k: Competition;
  state: { pinned: boolean; interested: boolean };
  onPin: (next: boolean) => void;
  onInterested: (next: boolean) => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-tg-brown">
            {k.field} · {k.location}
          </span>
          <h2 className="mt-1.5 font-display text-[16.5px] font-semibold leading-[1.2] text-tg-ink">
            {k.title}
          </h2>
          <Meta className="mt-1 block">
            {k.organiser}
            {k.source_url ? ` · ${k.source_url.replace(/^https?:\/\//, "")}` : ""}
          </Meta>
        </div>
        <button
          type="button"
          onClick={() => onPin(!state.pinned)}
          aria-label="Pin"
          className={cn(state.pinned ? "text-tg-blue-accent" : "text-tg-brown")}
        >
          <Pin size={18} fill={state.pinned ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-y-2 border-y border-tg-line-soft py-3">
        <Field label="Closes" value={k.deadline_label ?? k.deadline ?? "—"} />
        <Field label="Prize" value={k.prize ?? "—"} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[11.5px] text-tg-brown">
          {k.interested_count} interested
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-tg-brown-soft"
        >
          <Lock size={12} />
          See who&apos;s interested · Pro
        </button>
      </div>

      <div className="mt-3.5 flex gap-2">
        <Button
          variant={state.interested ? "outline" : "primary"}
          size="sm"
          onClick={() => onInterested(!state.interested)}
        >
          {state.interested ? "Interested" : "I'm interested"}
        </Button>
        <Button variant="outlineAccent" size="sm">
          <Users size={14} className="mr-1.5" />
          Create collaboration
        </Button>
      </div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block font-mono text-[9.5px] uppercase tracking-[0.1em] text-tg-brown-soft">
        {label}
      </span>
      <span className="mt-0.5 block font-display text-[13.5px] font-semibold text-tg-ink">
        {value}
      </span>
    </div>
  );
}
