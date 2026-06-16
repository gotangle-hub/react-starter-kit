import { useState } from "react";
import { Pin, Users } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Logo } from "@/components/brand/logo";
import { Meta } from "@/components/brand/atoms";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { tangleComps } from "@/lib/fixtures";
import { cn } from "@/lib/utils";

type TangleComp = (typeof tangleComps)[number];

/**
 * 35 · Tangle competitions (G7).
 * Competitions run by Tangle itself — same card actions (pin, interested,
 * create collaboration) with official styling.
 */
export default function ProjectsTangle() {
  return (
    <MobileShell header={<BackHeader title="Tangle competitions" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-8">
        <RefreshHint />

        {/* Official banner */}
        <div className="mt-1 flex items-center gap-3 rounded-lg bg-tg-emph px-4 py-4 text-tg-emph-text">
          <Logo size={20} onDark />
          <div>
            <div className="font-display text-[14px] font-semibold">
              Run by Tangle
            </div>
            <div className="mt-0.5 font-mono text-[11px] opacity-75">
              Official challenges, judged in house.
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {tangleComps.map((c) => (
            <TangleCard key={c.id} c={c} />
          ))}
        </div>
      </div>
    </MobileShell>
  );
}

function TangleCard({ c }: { c: TangleComp }) {
  const [pinned, setPinned] = useState(false);
  const [interested, setInterested] = useState(false);

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
          <h2 className="font-display text-[16.5px] font-semibold leading-[1.2] text-tg-ink">
            {c.title}
          </h2>
          <button
            type="button"
            onClick={() => setPinned((p) => !p)}
            aria-label="Pin"
            className={cn(pinned ? "text-tg-blue-accent" : "text-tg-brown")}
          >
            <Pin size={18} fill={pinned ? "currentColor" : "none"} />
          </button>
        </div>

        <p className="mt-2 font-body text-[13.5px] leading-[1.5] text-tg-brown">
          {c.brief}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-y-2 border-y border-tg-line-soft py-3">
          <Field label="Closes" value={c.deadline} />
          <Field label="Prize" value={c.prize} />
        </div>

        <Meta className="mt-3 block">{c.participants} entered</Meta>

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
