import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Pin, Users } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Logo } from "@/components/brand/logo";
import { Pill, Meta } from "@/components/brand/atoms";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  listCompetitions,
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
 * 35 · Tangle competitions (G5, G7, G14).
 * Competitions run by Tangle itself — real rows from public.competitions
 * filtered by source = 'tangle'. Same card actions as the live-scan tab.
 */
export default function ProjectsTangle() {
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
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const rows = await listCompetitions({
      source: "tangle",
      field: active.Field,
      location: active.Location,
      deadline: active.Deadline,
      prize: active.Prize,
      eligibility: active.Eligibility,
    });
    setItems(rows);
    setUserStateMap(await getUserState());
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.Field, active.Location, active.Deadline, active.Prize, active.Eligibility]);

  return (
    <MobileShell header={<BackHeader title="Tangle competitions" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-8">
        <RefreshHint />

        <div className="mt-1 flex gap-5 border-b border-tg-line">
          <Tab label="Live scan" on={false} onClick={() => navigate(routes.competitions)} />
          <Tab label="Tangle" on={true} onClick={() => {}} />
        </div>

        {/* Official banner */}
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-tg-emph px-4 py-4 text-tg-emph-text">
          <Logo size={20} onDark />
          <div>
            <div className="font-display text-[14px] font-semibold">Run by Tangle</div>
            <div className="mt-0.5 font-mono text-[11px] opacity-75">
              Official challenges, judged in house.
            </div>
          </div>
        </div>

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
          {!items.length && !loading && (
            <Meta className="mt-6 block text-center">
              No Tangle competitions are open right now. Check back soon.
            </Meta>
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
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b border-tg-line-soft bg-tg-stone2 px-4 py-2">
        <Logo size={14} />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-tg-brown">
          Official
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-tg-brown">
              {k.field} · {k.location}
            </span>
            <h2 className="mt-1.5 font-display text-[16.5px] font-semibold leading-[1.2] text-tg-ink">
              {k.title}
            </h2>
            <Meta className="mt-1 block">{k.organiser}</Meta>
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
