import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Pin, Users } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Pill, Meta } from "@/components/brand/atoms";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { competitions, type Competition } from "@/lib/fixtures";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const FILTERS = {
  Field: ["Any field", "Architecture", "Interiors", "Product", "Type"],
  Location: ["Anywhere", "UAE", "Global"],
  Deadline: ["Any deadline", "This month", "Next 3 months"],
  Prize: ["Any prize", "Cash", "Publication"],
};

/**
 * 34 · Competitions — live world scan (G5, G7, G4).
 * Presented as continuously scanning the world for live competitions and open
 * calls, visibly refreshing. Filters available to all users. The powering
 * technology is never named (G4).
 */
export default function ProjectsAI() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"world" | "tangle">("world");
  const [active, setActive] = useState<Record<string, string>>({
    Field: "Any field",
    Location: "Anywhere",
    Deadline: "Any deadline",
    Prize: "Any prize",
  });

  // The live-scan count keeps ticking up so the page feels alive.
  const [found, setFound] = useState(312);
  useEffect(() => {
    const t = setInterval(() => setFound((n) => n + (1 + (n % 3))), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <MobileShell header={<BackHeader title="Find competitions" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-8">
        <RefreshHint />

        {/* Tabs: live world scan vs Tangle's own */}
        <div className="mt-1 flex gap-5 border-b border-tg-line">
          <Tab
            label="Live scan"
            on={tab === "world"}
            onClick={() => setTab("world")}
          />
          <Tab
            label="Tangle"
            on={tab === "tangle"}
            onClick={() => navigate(routes.tangleComps)}
          />
        </div>

        {/* Scanning indicator + live count */}
        <div className="mt-4 flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-pill bg-tg-blue opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-pill bg-tg-blue" />
          </span>
          <span className="font-display text-[13px] font-semibold text-tg-ink">
            Scanning the world for live calls…
          </span>
        </div>
        <Meta className="mt-1 block">
          {found} open competitions found · repopulating as results arrive
        </Meta>

        {/* Filters — available to all users (G5) */}
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
          {competitions.map((k) => (
            <CompCard key={k.id} k={k} />
          ))}
        </div>
      </div>
    </MobileShell>
  );
}

function Tab({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 pb-2.5 font-display text-[14px] font-semibold transition-colors",
        on
          ? "border-tg-blue-accent text-tg-ink"
          : "border-transparent text-tg-brown",
      )}
    >
      {label}
    </button>
  );
}

function CompCard({ k }: { k: Competition }) {
  const [pinned, setPinned] = useState(k.pinned);
  const [interested, setInterested] = useState(false);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-tg-brown">
            {k.cat} · {k.place}
          </span>
          <h2 className="mt-1.5 font-display text-[16.5px] font-semibold leading-[1.2] text-tg-ink">
            {k.name}
          </h2>
          <Meta className="mt-1 block">
            {k.org} · {k.link}
          </Meta>
        </div>
        <button
          type="button"
          onClick={() => setPinned((p) => !p)}
          aria-label="Pin"
          className={cn(pinned ? "text-tg-blue-accent" : "text-tg-brown")}
        >
          <Pin size={18} fill={pinned ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-y-2 border-y border-tg-line-soft py-3">
        <Field label="Closes" value={k.deadline} />
        <Field label="Prize" value={k.prize} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[11.5px] text-tg-brown">
          {k.interestedPeople} interested
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
          variant={interested ? "outline" : "primary"}
          size="sm"
          onClick={() => setInterested((v) => !v)}
        >
          {interested ? "Interested" : "I'm interested"}
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
