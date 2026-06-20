import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Users } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { Meta } from "@/components/brand/atoms";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { routes, path } from "@/lib/routes";
import { supabase } from "@/integrations/supabase/client";
import {
  listMyCollaborations,
  listMyInvites,
  listMembers,
  respondCollabInvite,
  type CollabSummary,
  type CollabMember,
} from "@/services/collaborations";
import { makerFromProfile } from "@/services/profile";
import { CreateCollabSheet } from "@/components/app/create-collab-sheet";

const STAGES = ["Brief agreed", "In progress", "Review", "Wrapping up"] as const;

import { useWebViewport } from "@/hooks/use-is-desktop";
import { CollabTrackerDesktop } from "@/components/web/pages/collab-tracker-desktop";

export default function CollabTracker() {
  const viewport = useWebViewport();
  if (viewport !== "mobile") return <CollabTrackerDesktop />;
  return <CollabTrackerMobile />;
}

function CollabTrackerMobile() {
  const navigate = useNavigate();
  const [collabs, setCollabs] = useState<CollabSummary[]>([]);
  const [invites, setInvites] = useState<Awaited<ReturnType<typeof listMyInvites>>>([]);
  const [membersByCollab, setMembersByCollab] = useState<Record<string, CollabMember[]>>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const refresh = async () => {
    const [rows, inv] = await Promise.all([listMyCollaborations(), listMyInvites()]);
    setCollabs(rows);
    setInvites(inv);
    const entries = await Promise.all(
      rows.map(async (c) => [c.id, await listMembers(c.id)] as const),
    );
    setMembersByCollab(Object.fromEntries(entries));
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("collab-tracker")
      .on("postgres_changes", { event: "*", schema: "public", table: "collaborations" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "collaboration_members" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "collaboration_tasks" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const respond = async (collabId: string, accept: boolean) => {
    await respondCollabInvite(collabId, accept);
    await refresh();
    if (accept) navigate(path(routes.projectChat, { id: collabId }));
  };

  return (
    <MobileShell
      header={
        <BackHeader
          title="Collaborations"
          right={
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex h-9 w-9 items-center justify-center rounded-pill border border-tg-line text-tg-ink"
              aria-label="New collaboration"
            >
              <Plus size={18} />
            </button>
          }
        />
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-8">
        <RefreshHint />

        <h1 className="mt-1.5 font-serif text-[26px] font-medium leading-[1.05] tracking-[-0.02em] text-tg-ink">
          Work in progress
        </h1>
        <Meta className="mt-1 block">
          {collabs.filter((c) => c.my_status === "active").length} active
          {invites.length > 0 && ` · ${invites.length} pending`}
        </Meta>

        {invites.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
              Invites
            </div>
            <div className="flex flex-col gap-2.5">
              {invites.map((inv) => (
                <Card key={inv.collab_id} className="p-3.5">
                  <div className="font-display text-[14.5px] font-semibold text-tg-ink">
                    {inv.collab?.title ?? "Collaboration"}
                  </div>
                  <Meta className="mt-0.5 block">You were invited to collaborate.</Meta>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => respond(inv.collab_id, true)}>Accept</Button>
                    <Button size="sm" variant="ghost" onClick={() => respond(inv.collab_id, false)}>
                      Decline
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!loading && collabs.length === 0 && invites.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center text-center">
            <p className="font-display text-[15px] font-semibold text-tg-ink">No collaborations yet</p>
            <p className="mt-1 max-w-[260px] font-body text-[13px] text-tg-brown-soft">
              Start one from a competition, a call out, or someone's profile.
            </p>
            <Button className="mt-4" onClick={() => setCreating(true)}>
              <Plus size={15} className="mr-1" /> New collaboration
            </Button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3">
            {collabs.map((c) => {
              const pct = c.task_count > 0 ? Math.round((c.task_done / c.task_count) * 100) : 0;
              const stage = STAGES[Math.min(STAGES.length - 1, Math.floor(pct / 25))];
              const activeMembers = (membersByCollab[c.id] ?? []).filter((m) => m.status === "active");
              return (
                <Card key={c.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="block truncate font-display text-[15.5px] font-semibold text-tg-ink">
                        {c.title}
                      </span>
                      <Meta className="mt-0.5 block">
                        Collaboration · {c.member_count} {c.member_count === 1 ? "member" : "members"}
                      </Meta>
                    </div>
                    <span className="flex-none rounded-pill border border-tg-blue-accent px-2.5 py-1 font-display text-[11px] font-semibold text-tg-blue-accent">
                      {stage}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {activeMembers.slice(0, 5).map((m) => (
                        <Avatar key={m.user_id} maker={makerFromProfile(m.profile)} size={28} ring />
                      ))}
                    </div>
                    {activeMembers.length > 5 && (
                      <Meta className="ml-1 inline-flex items-center gap-1">
                        <Users size={13} /> +{activeMembers.length - 5}
                      </Meta>
                    )}
                  </div>

                  <div className="mt-3.5">
                    <div className="flex items-baseline justify-between">
                      <Meta>Progress · {c.task_done}/{c.task_count} tasks</Meta>
                      <span className="font-mono text-[12px] font-medium text-tg-ink">{pct}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-pill bg-tg-stone2">
                      <span className="block h-full rounded-pill bg-tg-blue" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Button size="sm" onClick={() => navigate(path(routes.projectChat, { id: c.id }))}>
                      Open group chat
                      <ArrowRight size={15} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`${routes.brief}?id=${c.id}`)}>
                      View brief
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {creating && (
        <CreateCollabSheet
          onClose={() => setCreating(false)}
          onCreated={(id: string) => {
            setCreating(false);
            refresh();
            navigate(path(routes.projectChat, { id }));
          }}
        />
      )}
    </MobileShell>
  );
}
