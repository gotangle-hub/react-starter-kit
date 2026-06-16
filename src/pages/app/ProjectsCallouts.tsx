import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, PromotedTag, RefreshHint } from "@/components/app/bits";
import { Pill, Meta } from "@/components/brand/atoms";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { callOuts, type CallOut } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

/**
 * 33 · Call outs / open collaboration calls (G7, G6, G10).
 * A board of open briefs and collaboration calls. Group collaborations are
 * supported. One boosted item is woven in (G6), not dumped.
 */
export default function ProjectsCallouts() {
  const navigate = useNavigate();

  // Weave the single promoted call out in among the organic ones (G6).
  const promoted = callOuts.find((c) => c.promoted);
  const organic = callOuts.filter((c) => !c.promoted);
  const ordered: CallOut[] = promoted
    ? [...organic.slice(0, 1), promoted, ...organic.slice(1)]
    : organic;

  return (
    <MobileShell header={<BackHeader title="Call outs" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-8">
        <RefreshHint />

        <h1 className="mt-1.5 font-serif text-[26px] font-medium leading-[1.06] tracking-[-0.02em] text-tg-ink">
          Open calls & collaborations
        </h1>
        <Meta className="mt-1.5 block">
          Briefs, gigs and partners — including groups of more than two.
        </Meta>

        <div className="mt-5 flex flex-col gap-3">
          {ordered.map((c) => (
            <CalloutCard
              key={c.id}
              c={c}
              onApply={() => navigate(routes.applyFlow)}
            />
          ))}
        </div>
      </div>
    </MobileShell>
  );
}

function CalloutCard({ c, onApply }: { c: CallOut; onApply: () => void }) {
  const isGroup = /collaboration|partner|competition/i.test(c.type + c.title);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-tg-brown">
            {c.kind} · {c.type}
          </span>
          <h2 className="mt-1.5 font-display text-[16.5px] font-semibold leading-[1.2] text-tg-ink">
            {c.title}
          </h2>
        </div>
        {c.promoted && <PromotedTag />}
      </div>

      <Meta className="mt-2 block">
        {c.by} · {c.city}
      </Meta>

      <p className="mt-2.5 font-body text-[13.5px] leading-[1.5] text-tg-brown">
        {c.body}
      </p>

      <div className="mt-3.5 grid grid-cols-2 gap-y-2 border-y border-tg-line-soft py-3">
        <Detail label="Budget" value={c.budget} />
        <Detail label="Timeline" value={c.timeline} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {c.skills.map((s) => (
          <Pill key={s} small>
            {s}
          </Pill>
        ))}
      </div>

      <div className="mt-3.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-tg-brown">
          {isGroup && <Users size={14} className="text-tg-blue-accent" />}
          {c.interested} interested
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            I&apos;m interested
          </Button>
          <Button size="sm" onClick={onApply}>
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
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
