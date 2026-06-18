import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Pin, UserPlus, Users } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Pill, Meta, PhotoTile } from "@/components/brand/atoms";
import { Chip } from "@/components/brand/chip";
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

/**
 * 21 · Student competitions (G5, G7, G4).
 * Live world scan of student-only competitions backed by public.competitions
 * (audience='students'). Pin / Interested are per-user; Find a partner and
 * Create collaboration remain. Powering tech never named (G4).
 */

const FILTERS = {
  Field: ["Any field", "Architecture", "Type", "Product", "Material"],
  Location: ["Anywhere", "Campus", "Global"],
  Deadline: ["Any deadline", "This month", "Next 3 months"],
  Prize: ["Any prize", "Exhibition", "Mentorship", "Build"],
};

const SWATCHES = ["#A85C3A", "#161514", "#0107FF", "#3A6E5C", "#6B4EFF"];
const swatchFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return SWATCHES[h % SWATCHES.length];
};

export default function StudentCompetitions() {
  const navigate = useNavigate();
  const [active, setActive] = useState<Record<string, string>>({
    Field: "Any field",
    Location: "Anywhere",
    Deadline: "Any deadline",
    Prize: "Any prize",
  });
  const [items, setItems] = useState<Competition[]>([]);
  const [userState, setUserStateMap] = useState<Record<string, { pinned: boolean; interested: boolean }>>({});
  const [scanning, setScanning] = useState(true);

  async function load() {
    setScanning(true);
    const rows = await listCompetitions({
      audience: "students",
      field: active.Field,
      location: active.Location,
      deadline: active.Deadline,
      prize: active.Prize,
    });
    setItems(rows);
    setUserStateMap(await getUserState());
    setScanning(false);
  }

  useEffect(() => {
    refreshCompetitions().finally(load);
    const t = setInterval(() => refreshCompetitions().finally(load), 45_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.Field, active.Location, active.Deadline, active.Prize]);

  return (
    <MobileShell
      header={
        <BackHeader
          title="Student competitions"
          right={
            <span className="rounded-chip bg-tg-yellow px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-tg-ink">
              Free
            </span>
          }
        />
      }
      footer={<AppTabBar />}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-8">
        <RefreshHint />

        <div className="mt-1 flex items-center gap-1.5">
          <GraduationCap size={14} className="text-tg-brown-soft" />
          <Meta>
            Only for students — pin, form a team and see who&apos;s interested,
            all free.
          </Meta>
        </div>

        <div className="mt-4 flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            {scanning && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-pill bg-tg-blue opacity-60" />
            )}
            <span className="relative inline-flex h-2.5 w-2.5 rounded-pill bg-tg-blue" />
          </span>
          <span className="font-display text-[13px] font-semibold text-tg-ink">
            {scanning ? "Scanning the world for student calls…" : "Up to date"}
          </span>
        </div>
        <Meta className="mt-1 block">
          {items.length} live student competitions found · repopulating as results arrive
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
                  {o}
                </Pill>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {items.map((c) => (
            <CompCard
              key={c.id}
              c={c}
              state={userState[c.id] ?? { pinned: false, interested: false }}
              onPin={async (next) => {
                setUserStateMap((s) => ({ ...s, [c.id]: { ...(s[c.id] ?? { pinned: false, interested: false }), pinned: next } }));
                await setUserState(c.id, { pinned: next });
              }}
              onInterested={async (next) => {
                setUserStateMap((s) => ({ ...s, [c.id]: { ...(s[c.id] ?? { pinned: false, interested: false }), interested: next } }));
                await setUserState(c.id, { interested: next });
              }}
              onFindPartner={() => navigate(routes.partnerMatch)}
            />
          ))}
          {!items.length && !scanning && (
            <Meta className="mt-6 block text-center">No student calls match those filters yet.</Meta>
          )}
        </div>
      </div>
    </MobileShell>
  );
}

function CompCard({
  c,
  state,
  onPin,
  onInterested,
  onFindPartner,
}: {
  c: Competition;
  state: { pinned: boolean; interested: boolean };
  onPin: (next: boolean) => void;
  onInterested: (next: boolean) => void;
  onFindPartner: () => void;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative h-24">
        <PhotoTile width="100%" height={96} radius={0} swatch={swatchFor(c.id)} />
        <span className="absolute left-3 top-2.5">
          <Chip>{c.field}</Chip>
        </span>
        <button
          type="button"
          onClick={() => onPin(!state.pinned)}
          aria-label="Pin"
          className={cn(
            "absolute right-3 top-2.5 flex h-8 w-8 items-center justify-center rounded-pill",
            state.pinned ? "bg-tg-blue text-white" : "bg-black/45 text-white",
          )}
        >
          <Pin size={15} fill={state.pinned ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-4">
        <h2 className="font-display text-[16px] font-semibold leading-[1.2] text-tg-ink">{c.title}</h2>
        <Meta className="mt-1 block">{c.organiser}</Meta>

        <div className="mt-3 grid grid-cols-2 gap-y-2 border-y border-tg-line-soft py-3">
          <Field label="Closes" value={c.deadline_label ?? c.deadline ?? "—"} />
          <Field label="Prize" value={c.prize ?? "—"} />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <Meta>{c.location}</Meta>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-tg-brown">
            <Users size={13} />
            {c.interested_count} interested
          </span>
        </div>

        <div className="mt-3.5 flex flex-wrap gap-2">
          <Button
            variant={state.interested ? "outline" : "primary"}
            size="sm"
            onClick={() => onInterested(!state.interested)}
          >
            {state.interested ? "Interested" : "I'm interested"}
          </Button>
          <Button variant="outlineAccent" size="sm" onClick={onFindPartner}>
            <UserPlus size={14} className="mr-1.5" />
            Find a partner
          </Button>
          <Button variant="ghost" size="sm">
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
