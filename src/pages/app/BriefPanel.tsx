import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { supabase } from "@/integrations/supabase/client";
import {
  getCollaboration,
  listMembers,
  listTasks,
  listMilestones,
  addTask,
  toggleTask,
  addMilestone,
  toggleMilestone,
  updateBrief,
  setMemberRole,
  type Collaboration,
  type CollabMember,
  type CollabTask,
  type CollabMilestone,
} from "@/services/collaborations";
import { makerFromProfile } from "@/services/profile";
import { cn } from "@/lib/utils";

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-3 mt-7 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
      {children}
    </div>
  );
}

export default function BriefPanel() {
  const [sp] = useSearchParams();
  const collabId = sp.get("id");
  const [collab, setCollab] = useState<Collaboration | null>(null);
  const [members, setMembers] = useState<CollabMember[]>([]);
  const [tasks, setTasks] = useState<CollabTask[]>([]);
  const [milestones, setMilestones] = useState<CollabMilestone[]>([]);
  const [briefDraft, setBriefDraft] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newMs, setNewMs] = useState("");
  const [newMsDate, setNewMsDate] = useState("");
  const [me, setMe] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = async () => {
    if (!collabId) return;
    const [c, m, t, ms] = await Promise.all([
      getCollaboration(collabId),
      listMembers(collabId),
      listTasks(collabId),
      listMilestones(collabId),
    ]);
    setCollab(c);
    setBriefDraft(c?.brief ?? "");
    setMembers(m);
    setTasks(t);
    setMilestones(ms);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    refresh();
    if (!collabId) return;
    const ch = supabase
      .channel(`collab-${collabId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "collaborations", filter: `id=eq.${collabId}` }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "collaboration_tasks", filter: `collab_id=eq.${collabId}` }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "collaboration_milestones", filter: `collab_id=eq.${collabId}` }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "collaboration_members", filter: `collab_id=eq.${collabId}` }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collabId]);

  const myMembership = useMemo(() => members.find((x) => x.user_id === me), [members, me]);
  const canEdit = myMembership?.status === "active";
  const isOwner = collab?.owner_id === me;

  const completed = tasks.filter((t) => t.done).length;

  const onBriefChange = (v: string) => {
    setBriefDraft(v);
    if (!collabId || !isOwner) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { updateBrief(collabId, v).catch(console.warn); }, 600);
  };

  const onAddTask = async () => {
    if (!collabId || !newTask.trim()) return;
    await addTask(collabId, newTask);
    setNewTask("");
  };

  const onAddMs = async () => {
    if (!collabId || !newMs.trim()) return;
    await addMilestone(collabId, newMs, newMsDate || null);
    setNewMs("");
    setNewMsDate("");
  };

  const cycleAssignee = async (task: CollabTask) => {
    if (!canEdit) return;
    const active = members.filter((m) => m.status === "active");
    const ids = [null, ...active.map((m) => m.user_id)];
    const idx = ids.indexOf(task.assignee_id);
    const next = ids[(idx + 1) % ids.length];
    const { assignTask } = await import("@/services/collaborations");
    await assignTask(task.id, next);
  };

  if (!collabId) {
    return (
      <MobileShell header={<BackHeader title="Project brief" />}>
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <Meta>Open a collaboration to view its brief.</Meta>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell header={<BackHeader title="Project brief" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-10">
        <h1 className="mt-4 font-serif text-[26px] font-medium leading-[1.05] tracking-[-0.02em] text-tg-ink">
          {collab?.title ?? "Collaboration"}
        </h1>
        <Meta className="mt-1 block">
          Collaboration · {members.filter((m) => m.status === "active").length} members
        </Meta>

        {/* Scope */}
        <SectionLabel>Brief</SectionLabel>
        <div className="rounded-lg bg-tg-emph p-4">
          {isOwner ? (
            <textarea
              value={briefDraft}
              onChange={(e) => onBriefChange(e.target.value)}
              rows={4}
              placeholder="Describe the shared brief…"
              className="w-full resize-none bg-transparent font-body text-[14.5px] leading-[1.55] text-tg-emph-text outline-none placeholder:text-tg-emph-text/60"
            />
          ) : (
            <p className="whitespace-pre-wrap font-body text-[14.5px] leading-[1.55] text-tg-emph-text">
              {collab?.brief?.trim() || "No brief yet."}
            </p>
          )}
        </div>

        {/* Tasks */}
        <SectionLabel>Tasks</SectionLabel>
        <div className="flex items-baseline justify-between">
          <Meta>{completed} of {tasks.length} complete</Meta>
        </div>
        <div className="mt-3 flex flex-col divide-y divide-tg-line-soft overflow-hidden rounded-lg border border-tg-line bg-tg-card">
          {tasks.length === 0 && (
            <div className="px-4 py-3">
              <Meta>No tasks yet.</Meta>
            </div>
          )}
          {tasks.map((t) => {
            const assignee = members.find((m) => m.user_id === t.assignee_id);
            return (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => canEdit && toggleTask(t.id, !t.done)}
                  className={cn(
                    "flex h-5 w-5 flex-none items-center justify-center rounded-chip border",
                    t.done ? "border-tg-blue bg-tg-blue text-white" : "border-tg-line bg-transparent",
                  )}
                  aria-label={t.done ? "Mark incomplete" : "Mark complete"}
                >
                  {t.done && <Check size={13} strokeWidth={2.5} />}
                </button>
                <span
                  className={cn(
                    "flex-1 font-body text-[14.5px] leading-snug",
                    t.done ? "text-tg-brown-soft line-through" : "text-tg-ink",
                  )}
                >
                  {t.title}
                </span>
                <button
                  type="button"
                  onClick={() => cycleAssignee(t)}
                  className="flex flex-none items-center gap-1"
                  title="Reassign"
                >
                  {assignee?.profile ? (
                    <Avatar maker={makerFromProfile(assignee.profile)} size={22} />
                  ) : (
                    <span className="rounded-pill border border-dashed border-tg-line px-2 py-0.5 font-mono text-[10px] text-tg-brown-soft">
                      assign
                    </span>
                  )}
                </button>
              </div>
            );
          })}
          {canEdit && (
            <div className="flex items-center gap-2 px-3 py-2.5">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onAddTask()}
                placeholder="Add a task…"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-tg-ink outline-none placeholder:text-tg-brown-soft"
              />
              <button
                type="button"
                onClick={onAddTask}
                disabled={!newTask.trim()}
                className="flex h-7 w-7 items-center justify-center rounded-pill bg-tg-blue text-white disabled:opacity-40"
                aria-label="Add task"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Milestones */}
        <SectionLabel>Milestones & timeline</SectionLabel>
        <div className="relative pl-1">
          {milestones.length === 0 && <Meta>No milestones yet.</Meta>}
          {milestones.map((m, i) => {
            const last = i === milestones.length - 1;
            return (
              <div key={m.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                <div className="flex flex-none flex-col items-center">
                  <button
                    type="button"
                    onClick={() => canEdit && toggleMilestone(m.id, !m.done)}
                    className={cn(
                      "mt-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-pill border-2",
                      m.done ? "border-tg-blue bg-tg-blue" : "border-tg-line bg-tg-bg",
                    )}
                    aria-label="Toggle milestone"
                  />
                  {!last && <span className="mt-0.5 w-px flex-1 bg-tg-line" />}
                </div>
                <div className="-mt-0.5 flex min-w-0 flex-1 items-baseline justify-between gap-3">
                  <span
                    className={cn(
                      "font-display text-[14.5px]",
                      m.done ? "font-semibold text-tg-ink" : "font-medium text-tg-brown",
                    )}
                  >
                    {m.title}
                  </span>
                  <Meta>{m.due_date ?? "—"}</Meta>
                </div>
              </div>
            );
          })}
        </div>
        {canEdit && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-tg-line bg-tg-card px-3 py-2.5">
            <input
              value={newMs}
              onChange={(e) => setNewMs(e.target.value)}
              placeholder="New milestone"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-tg-ink outline-none placeholder:text-tg-brown-soft"
            />
            <input
              type="date"
              value={newMsDate}
              onChange={(e) => setNewMsDate(e.target.value)}
              className="bg-transparent text-[12px] text-tg-ink outline-none"
            />
            <button
              type="button"
              onClick={onAddMs}
              disabled={!newMs.trim()}
              className="flex h-7 w-7 items-center justify-center rounded-pill bg-tg-blue text-white disabled:opacity-40"
              aria-label="Add milestone"
            >
              <Plus size={14} />
            </button>
          </div>
        )}

        {/* Roles */}
        <SectionLabel>Roles</SectionLabel>
        <div className="flex flex-col divide-y divide-tg-line-soft overflow-hidden rounded-lg border border-tg-line bg-tg-card">
          {members.filter((m) => m.status === "active").map((mem) => {
            const isMe = mem.user_id === me;
            return (
              <div key={mem.user_id} className="flex items-center gap-3 px-4 py-3">
                <Avatar maker={makerFromProfile(mem.profile)} size={38} />
                <div className="min-w-0 flex-1">
                  <NameRow maker={makerFromProfile(mem.profile)} size={14} />
                  {isMe && collabId ? (
                    <input
                      value={mem.role}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMembers((prev) => prev.map((x) => x.user_id === mem.user_id ? { ...x, role: v } : x));
                      }}
                      onBlur={(e) => setMemberRole(collabId, mem.user_id, e.target.value).catch(console.warn)}
                      placeholder="Your role…"
                      className="mt-0.5 block w-full bg-transparent font-mono text-[11px] text-tg-brown outline-none placeholder:text-tg-brown-soft"
                    />
                  ) : (
                    <Meta className="mt-0.5 block">{mem.role || "—"}</Meta>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}
