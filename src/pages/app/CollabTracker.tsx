import { useNavigate } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { Meta } from "@/components/brand/atoms";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { chats, makerById, me } from "@/lib/fixtures";
import { routes, path } from "@/lib/routes";

/**
 * 40 · Collaborations (G10) — tracker of active GROUP collaborations.
 * Competition / client chats are the collaborations; each opens its group chat
 * with the embedded planning tools, and links to the shared brief.
 */

const STAGES = ["Brief agreed", "In progress", "Review", "Wrapping up"] as const;

// Deterministic per-collaboration progress so the tracker reads consistently.
function progressFor(id: string) {
  const seed = [...id].reduce((s, ch) => s + ch.charCodeAt(0), 0);
  return 25 + (seed % 4) * 20; // 25 / 45 / 65 / 85
}

export default function CollabTracker() {
  const navigate = useNavigate();
  const collabs = chats.filter((c) => c.kind === "competition" || c.kind === "client");

  return (
    <MobileShell header={<BackHeader title="Collaborations" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-8">
        <RefreshHint />

        <h1 className="mt-1.5 font-serif text-[26px] font-medium leading-[1.05] tracking-[-0.02em] text-tg-ink">
          Work in progress
        </h1>
        <Meta className="mt-1 block">
          {collabs.length} active · {me.collaborations} this year
        </Meta>

        <div className="mt-5 flex flex-col gap-3">
          {collabs.map((c) => {
            const pct = progressFor(c.id);
            const stage = STAGES[Math.min(STAGES.length - 1, Math.floor(pct / 25))];
            const members = c.members.map(makerById);
            return (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block truncate font-display text-[15.5px] font-semibold text-tg-ink">
                      {c.title}
                    </span>
                    <Meta className="mt-0.5 block">
                      {c.kind === "competition" ? "Competition team" : "Client project"} · {c.members.length + 1} members
                    </Meta>
                  </div>
                  <span className="flex-none rounded-pill border border-tg-blue-accent px-2.5 py-1 font-display text-[11px] font-semibold text-tg-blue-accent">
                    {stage}
                  </span>
                </div>

                {/* Members — more than two supported */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <Avatar maker={me} size={28} ring />
                    {members.map((m) => (
                      <Avatar key={m.id} maker={m} size={28} ring />
                    ))}
                  </div>
                  <Meta className="ml-1 inline-flex items-center gap-1">
                    <Users size={13} /> {c.who}
                  </Meta>
                </div>

                {/* Progress */}
                <div className="mt-3.5">
                  <div className="flex items-baseline justify-between">
                    <Meta>Progress</Meta>
                    <span className="font-mono text-[12px] font-medium text-tg-ink">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-pill bg-tg-stone2">
                    <span className="block h-full rounded-pill bg-tg-blue" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => navigate(path(routes.projectChat, { id: c.id }))}
                  >
                    Open group chat
                    <ArrowRight size={15} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(routes.brief)}>
                    View brief
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}
