import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Users } from "lucide-react";

import { WebPage } from "@/components/web/web-page";
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

export function CollabTrackerDesktop() {
  const navigate = useNavigate();
  const [collabs, setCollabs] = useState<CollabSummary[]>([]);
  const [invites, setInvites] = useState<Awaited<ReturnType<typeof listMyInvites>>>([]);
  const [membersByCollab, setMembersByCollab] = useState<Record<string, CollabMember[]>>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(async () => {
    const [rows, inv] = await Promise.all([listMyCollaborations(), listMyInvites()]);
    setCollabs(rows);
    setInvites(inv);
    const entries = await Promise.all(rows.map(async (c) => [c.id, await listMembers(c.id)] as const));
    setMembersByCollab(Object.fromEntries(entries));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("collab-tracker-web")
      .on("postgres_changes", { event: "*", schema: "public", table: "collaborations" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "collaboration_members" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "collaboration_tasks" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refresh]);

  const respond = async (collabId: string, accept: boolean) => {
    await respondCollabInvite(collabId, accept);
    await refresh();
    if (accept) navigate(path(routes.projectChat, { id: collabId }));
  };

  const active = collabs.filter((c) => c.my_status === "active");

  return (
    <WebPage maxWidth={1180}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[34px] font-medium leading-none tracking-[-0.02em] text-tg-ink">
            Collaborations
          </h1>
          <Meta className="mt-2 block">
            {active.length} active{invites.length > 0 && ` · ${invites.length} pending`}
          </Meta>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus size={15} className="mr-1" /> New collaboration
        </Button>
      </div>

      {invites.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
            Invites
          </div>
          <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-2">
            {invites.map((inv) => (
              <Card key={inv.collab_id} className="p-4">
                <div className="font-display text-[15px] font-semibold text-tg-ink">
                  {inv.collab?.title ?? "Collaboration"}
                </div>
                <Meta className="mt-1 block">You were invited to collaborate.</Meta>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => respond(inv.collab_id, true)}>Accept</Button>
                  <Button size="sm" variant="ghost" onClick={() => respond(inv.collab_id, false)}>
                    Decline
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {!loading && collabs.length === 0 && invites.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-tg-line bg-tg-card px-6 py-20 text-center">
          <p className="font-display text-[16px] font-semibold text-tg-ink">No collaborations yet</p>
          <p className="mx-auto mt-1.5 max-w-[340px] font-body text-[13.5px] text-tg-brown-soft">
            Start one from a competition, a call out, or someone's profile.
          </p>
          <Button className="mt-5" onClick={() => setCreating(true)}>
            <Plus size={15} className="mr-1" /> New collaboration
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 min-[900px]:grid-cols-2 min-[1280px]:grid-cols-3">
          {collabs.map((c) => {
            const pct = c.task_count > 0 ? Math.round((c.task_done / c.task_count) * 100) : 0;
            const stage = STAGES[Math.min(STAGES.length - 1, Math.floor(pct / 25))];
            const activeMembers = (membersByCollab[c.id] ?? []).filter((m) => m.status === "active");
            return (
              <Card key={c.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block truncate font-display text-[16px] font-semibold text-tg-ink">
                      {c.title}
                    </span>
                    <Meta className="mt-1 block">
                      {c.member_count} {c.member_count === 1 ? "member" : "members"}
                    </Meta>
                  </div>
                  <span className="flex-none rounded-pill border border-tg-blue-accent px-2.5 py-1 font-display text-[11px] font-semibold text-tg-blue-accent">
                    {stage}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {activeMembers.slice(0, 5).map((m) => (
                      <Avatar key={m.user_id} maker={makerFromProfile(m.profile)} size={30} ring />
                    ))}
                  </div>
                  {activeMembers.length > 5 && (
                    <Meta className="ml-1 inline-flex items-center gap-1">
                      <Users size={13} /> +{activeMembers.length - 5}
                    </Meta>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <Meta>Progress · {c.task_done}/{c.task_count} tasks</Meta>
                    <span className="font-mono text-[12px] font-medium text-tg-ink">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-pill bg-tg-stone2">
                    <span className="block h-full rounded-pill bg-tg-blue" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <Button size="sm" onClick={() => navigate(path(routes.projectChat, { id: c.id }))}>
                    Open chat <ArrowRight size={15} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`${routes.brief}?id=${c.id}`)}>
                    Brief
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

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
    </WebPage>
  );
}
