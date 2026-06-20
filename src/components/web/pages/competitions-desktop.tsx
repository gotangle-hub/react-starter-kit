import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Pin, Users } from "lucide-react";

import { WebPage } from "@/components/web/web-page";
import { Pill, Meta } from "@/components/brand/atoms";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
 * Desktop Competitions (reference: `web.jsx` → `WebCompetitions`).
 * Header with live-scan status, filter rail across the top, 3-up card grid.
 */
export function CompetitionsDesktop() {
  const navigate = useNavigate();
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
    refreshCompetitions().finally(load);
    const t = setInterval(() => {
      refreshCompetitions().finally(load);
    }, 45_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.Field, active.Location, active.Deadline, active.Prize, active.Eligibility]);

  return (
    <WebPage maxWidth={1240}>
      <header className="mb-5 flex items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-[34px] leading-none tracking-[-0.02em]">Competitions</h1>
          <div className="mt-2.5 flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              {scanning && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tg-blue opacity-60" />
              )}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-tg-blue" />
            </span>
            <span className="font-display text-[13px] font-semibold text-tg-ink">
              {scanning ? "Scanning the world for live calls…" : "Up to date"}
            </span>
            <Meta>· {items.length} open</Meta>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-tg-line bg-tg-bg p-3">
        {Object.entries(FILTERS).map(([group, opts]) => (
          <div key={group} className="flex items-center gap-2 overflow-x-auto">
            <span className="w-[80px] flex-none font-mono text-[10.5px] uppercase tracking-[0.1em] text-tg-brown-soft">
              {group}
            </span>
            <div className="flex flex-wrap gap-1.5">
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
          </div>
        ))}
      </div>

      {/* Grid */}
      {items.length === 0 && !scanning ? (
        <div className="rounded-2xl border border-dashed border-tg-line p-16 text-center">
          <Meta>No live calls match those filters yet.</Meta>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 min-[1100px]:grid-cols-3">
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
              onCollab={() => {
                const params = new URLSearchParams({
                  comp: k.title,
                  meta: `${k.organiser} · Closes ${k.deadline_label ?? k.deadline ?? ""}`,
                });
                navigate(`/partner?${params.toString()}`);
              }}
            />
          ))}
        </div>
      )}
    </WebPage>
  );
}

function CompCard({
  k,
  state,
  onPin,
  onInterested,
  onCollab,
}: {
  k: Competition;
  state: { pinned: boolean; interested: boolean };
  onPin: (next: boolean) => void;
  onInterested: (next: boolean) => void;
  onCollab: () => void;
}) {
  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-tg-brown">
            {k.field} · {k.location}
          </span>
          <h2 className="mt-2 font-serif text-[20px] leading-[1.2] tracking-[-0.01em] text-tg-ink">
            {k.title}
          </h2>
          <Meta className="mt-1.5 block">
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

      <div className="my-4 grid grid-cols-2 gap-y-2 border-y border-tg-line-soft py-3">
        <Field label="Closes" value={k.deadline_label ?? k.deadline ?? "—"} />
        <Field label="Prize" value={k.prize ?? "—"} />
      </div>

      <div className="flex items-center justify-between">
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

      <div className="mt-auto flex gap-2 pt-4">
        <Button
          variant={state.interested ? "outline" : "primary"}
          size="sm"
          onClick={() => onInterested(!state.interested)}
          className="flex-1"
        >
          {state.interested ? "Interested" : "I'm interested"}
        </Button>
        <Button variant="outlineAccent" size="sm" onClick={onCollab} className="flex-1">
          <Users size={14} className="mr-1.5" />
          Collaborate
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
