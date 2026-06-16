import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Pin, UserPlus, Users } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { Pill, Meta, PhotoTile } from "@/components/brand/atoms";
import { Chip } from "@/components/brand/chip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { makers, me, feed } from "@/lib/fixtures";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * 21 · Student competitions (G5, G7, G4).
 * Free, prominent, students-only. Presented as continuously SCANNING THE WHOLE
 * WORLD for live student competitions, visibly refreshing/repopulating. Every
 * card carries the same options — Pin · Interested · Find a partner · Create
 * collaboration. The powering technology is never named (G4).
 */

const FILTERS = {
  Field: ["Any field", "Architecture", "Type", "Product", "Material"],
  Location: ["Anywhere", "Campus", "Global"],
  Deadline: ["Any deadline", "This month", "Next 3 months"],
  Prize: ["Any prize", "Exhibition", "Mentorship"],
};

interface StudentComp {
  name: string;
  org: string;
  deadline: string;
  prize: string;
  cat: string;
  interested: number;
  team: string[];
  img: string;
  pinned?: boolean;
}

const COMPS: StudentComp[] = [
  {
    name: "Campus Pavilion Brief",
    org: "Inter-school · 5 campuses",
    deadline: "Oct 12",
    prize: "Build + exhibition",
    cat: "Architecture",
    interested: 28,
    team: ["lina", "mona"],
    img: "spec-full.jpg",
    pinned: true,
  },
  {
    name: "Type for a Cause",
    org: "Student Guild · open call",
    deadline: "Nov 03",
    prize: "Featured + mentorship",
    cat: "Type",
    interested: 41,
    team: ["mona"],
    img: "spec-negative.jpg",
  },
  {
    name: "Material Futures",
    org: "Faculty showcase",
    deadline: "Nov 20",
    prize: "Exhibition slot",
    cat: "Product",
    interested: 17,
    team: ["arian"],
    img: "spec-blades.jpg",
  },
];

export default function StudentCompetitions() {
  const navigate = useNavigate();
  const [active, setActive] = useState<Record<string, string>>({
    Field: "Any field",
    Location: "Anywhere",
    Deadline: "Any deadline",
    Prize: "Any prize",
  });

  // The live-scan count keeps ticking up so the page feels alive (G5).
  const [found, setFound] = useState(94);
  useEffect(() => {
    const t = setInterval(() => setFound((n) => n + (1 + (n % 3))), 2600);
    return () => clearInterval(t);
  }, []);

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

        {/* Scanning indicator + live count (G5) */}
        <div className="mt-4 flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-pill bg-tg-blue opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-pill bg-tg-blue" />
          </span>
          <span className="font-display text-[13px] font-semibold text-tg-ink">
            Scanning the world for student calls…
          </span>
        </div>
        <Meta className="mt-1 block">
          {found} live student competitions found · repopulating as results
          arrive
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
          {COMPS.map((c) => (
            <CompCard
              key={c.name}
              c={c}
              onFindPartner={() => navigate(routes.partnerMatch)}
            />
          ))}
        </div>
      </div>
    </MobileShell>
  );
}

function CompCard({
  c,
  onFindPartner,
}: {
  c: StudentComp;
  onFindPartner: () => void;
}) {
  const [pinned, setPinned] = useState(!!c.pinned);
  const [interested, setInterested] = useState(false);
  const by = (id: string) => makers.find((m) => m.id === id) || me;

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative h-24">
        <PhotoTile
          width="100%"
          height={96}
          radius={0}
          img={feed(c.img)}
          swatch="#E7DDCB"
        />
        <span className="absolute left-3 top-2.5">
          <Chip>{c.cat}</Chip>
        </span>
        <button
          type="button"
          onClick={() => setPinned((p) => !p)}
          aria-label="Pin"
          className={cn(
            "absolute right-3 top-2.5 flex h-8 w-8 items-center justify-center rounded-pill",
            pinned ? "bg-tg-blue text-white" : "bg-black/45 text-white",
          )}
        >
          <Pin size={15} fill={pinned ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-4">
        <h2 className="font-display text-[16px] font-semibold leading-[1.2] text-tg-ink">
          {c.name}
        </h2>
        <Meta className="mt-1 block">{c.org}</Meta>

        <div className="mt-3 grid grid-cols-2 gap-y-2 border-y border-tg-line-soft py-3">
          <Field label="Closes" value={c.deadline} />
          <Field label="Prize" value={c.prize} />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center">
            {c.team.map((id, k) => (
              <span key={id} style={{ marginLeft: k ? -9 : 0 }}>
                <Avatar maker={by(id)} size={26} ring />
              </span>
            ))}
            <Meta className="ml-2.5">{c.team.length} on the team</Meta>
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-tg-brown">
            <Users size={13} />
            {c.interested} interested
          </span>
        </div>

        <div className="mt-3.5 flex flex-wrap gap-2">
          <Button
            variant={interested ? "outline" : "primary"}
            size="sm"
            onClick={() => setInterested((v) => !v)}
          >
            {interested ? "Interested" : "I'm interested"}
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
