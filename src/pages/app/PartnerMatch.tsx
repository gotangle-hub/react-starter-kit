import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Hand } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { competitions, makers, type Maker } from "@/lib/fixtures";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * 36 · Find a partner (G2, G10).
 * Browse suggested partners for a competition/call out, invite them, and build
 * a group — the selected tray can hold more than two members.
 */
export default function PartnerMatch() {
  const navigate = useNavigate();
  const comp = competitions[0];
  const suggested = makers.slice(0, 5);
  const [looking, setLooking] = useState(true);
  const [team, setTeam] = useState<string[]>([]);

  const toggle = (id: string) =>
    setTeam((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  const selected = suggested.filter((m) => team.includes(m.id));

  return (
    <MobileShell header={<BackHeader title="Find a partner" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-8">
        <div className="mt-3">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-tg-brown">
            {comp.cat} · competition
          </span>
          <h1 className="mt-1.5 font-serif text-[24px] font-medium leading-[1.1] tracking-[-0.02em] text-tg-ink">
            {comp.name}
          </h1>
          <Meta className="mt-1.5 block">
            Closes {comp.deadline} · {comp.prize}
          </Meta>
        </div>

        {/* Your looking-for-partner status */}
        <Card className="mt-4 flex items-center gap-3 bg-tg-emph p-3.5 text-tg-emph-text">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-pill bg-white/15">
            <Hand size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[13.5px] font-semibold">
              You&apos;re looking for a partner
            </div>
            <div className="mt-0.5 font-mono text-[11px] opacity-70">
              Others entering this competition can find you.
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={looking}
            onClick={() => setLooking((v) => !v)}
            className={cn(
              "relative h-6 w-11 flex-none rounded-pill transition-colors",
              looking ? "bg-tg-yellow" : "bg-white/25",
            )}
          >
            <span
              className={cn(
                "absolute top-[3px] h-[18px] w-[18px] rounded-pill bg-white transition-all",
                looking ? "right-[3px]" : "left-[3px]",
              )}
            />
          </button>
        </Card>

        <h2 className="mt-6 font-serif text-[18px] font-medium tracking-[-0.01em] text-tg-ink">
          Suggested · open to teams
        </h2>
        <Meta className="mt-1 block">
          Build a group — add more than one partner.
        </Meta>

        <div className="mt-3.5 flex flex-col gap-2.5">
          {suggested.map((m) => (
            <PartnerRow
              key={m.id}
              m={m}
              on={team.includes(m.id)}
              onToggle={() => toggle(m.id)}
            />
          ))}
        </div>
      </div>

      {/* Selected-members tray (groups, G10) */}
      {selected.length > 0 && (
        <div className="flex-none border-t border-tg-line bg-tg-card px-[22px] py-3.5">
          <div className="flex items-center justify-between">
            <Meta>
              {selected.length} {selected.length === 1 ? "partner" : "partners"}{" "}
              selected
            </Meta>
            <button
              type="button"
              onClick={() => setTeam([])}
              className="font-mono text-[11px] uppercase tracking-[0.06em] text-tg-terra"
            >
              Clear
            </button>
          </div>
          <div className="mt-2.5 flex items-center gap-3">
            <div className="flex -space-x-2">
              {selected.map((m) => (
                <Avatar key={m.id} maker={m} size={34} ring />
              ))}
            </div>
            <Button
              full
              className="flex-1"
              onClick={() => navigate(routes.request)}
            >
              Invite {selected.length > 1 ? "group" : selected[0].name.split(" ")[0]}
            </Button>
          </div>
        </div>
      )}
    </MobileShell>
  );
}

function PartnerRow({
  m,
  on,
  onToggle,
}: {
  m: Maker;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="flex items-center gap-3 p-3">
      <Avatar maker={m} size={46} />
      <div className="min-w-0 flex-1">
        <NameRow maker={m} size={14.5} />
        <Meta className="mt-0.5 block">
          {m.skills?.[0] ?? m.role} · {m.match}% fit for this brief
        </Meta>
      </div>
      <Button
        variant={on ? "primary" : "outline"}
        size="sm"
        onClick={onToggle}
      >
        {on ? (
          <>
            <Check size={14} className="mr-1" />
            Added
          </>
        ) : (
          "Invite"
        )}
      </Button>
    </Card>
  );
}
