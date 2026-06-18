import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  FileText,
  Flag,
  ListChecks,
  Paperclip,
  Send,
  Users,
} from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { Meta } from "@/components/brand/atoms";
import { MentionInput, type MentionInputHandle } from "@/components/app/mention-input";
import { renderWithMentions } from "@/lib/mentions";
import { supabase } from "@/integrations/supabase/client";
import {
  getCollaboration,
  listMembers,
  listTasks,
  toggleTask,
  type Collaboration,
  type CollabMember,
  type CollabTask,
} from "@/services/collaborations";
import { listMessages, sendMessage, type DmMessage } from "@/services/messages";
import { makerFromProfile } from "@/services/profile";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Panel = "chat" | "brief" | "tasks" | "milestones" | "roles" | "files";

const TABS: { key: Exclude<Panel, "chat">; label: string; icon: typeof FileText }[] = [
  { key: "brief", label: "Brief", icon: FileText },
  { key: "tasks", label: "Tasks", icon: ListChecks },
  { key: "milestones", label: "Timeline", icon: Flag },
  { key: "roles", label: "Roles", icon: Users },
  { key: "files", label: "Files", icon: Paperclip },
];

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function ProjectChat() {
  const { id: collabId } = useParams();
  const navigate = useNavigate();

  const [collab, setCollab] = useState<Collaboration | null>(null);
  const [members, setMembers] = useState<CollabMember[]>([]);
  const [tasks, setTasks] = useState<CollabTask[]>([]);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>("chat");
  const [text, setText] = useState("");
  const inputRef = useRef<MentionInputHandle>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  const refreshCore = async () => {
    if (!collabId) return;
    const [c, m, t] = await Promise.all([
      getCollaboration(collabId), listMembers(collabId), listTasks(collabId),
    ]);
    setCollab(c);
    setMembers(m);
    setTasks(t);
    if (c?.conversation_id) {
      const msgs = await listMessages(c.conversation_id);
      setMessages(msgs);
    }
  };

  useEffect(() => {
    refreshCore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collabId]);

  // Live messages on the collab's conversation.
  useEffect(() => {
    const convId = collab?.conversation_id;
    if (!convId) return;
    const ch = supabase
      .channel(`collab-chat-${convId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "dm_messages", filter: `conversation_id=eq.${convId}` }, (payload) => {
        const m = payload.new as DmMessage;
        setMessages((prev) => prev.some((x) => x.id === m.id) ? prev : [...prev, m]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [collab?.conversation_id]);

  // Live planning panels
  useEffect(() => {
    if (!collabId) return;
    const ch = supabase
      .channel(`collab-planning-${collabId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "collaboration_tasks", filter: `collab_id=eq.${collabId}` }, () => {
        listTasks(collabId).then(setTasks);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "collaboration_members", filter: `collab_id=eq.${collabId}` }, () => {
        listMembers(collabId).then(setMembers);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [collabId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, panel]);

  const memberById = useMemo(() => {
    const m = new Map<string, CollabMember>();
    members.forEach((x) => m.set(x.user_id, x));
    return m;
  }, [members]);

  const send = async () => {
    const t = text.trim();
    if (!t || !collab?.conversation_id) return;
    setText("");
    try {
      const msg = await sendMessage(collab.conversation_id, t);
      if (msg) setMessages((prev) => prev.some((x) => x.id === msg.id) ? prev : [...prev, msg]);
    } catch (e) {
      console.warn("send failed", e);
    }
    // G8 — keep keyboard open
    inputRef.current?.focus();
  };

  const activeMembers = members.filter((x) => x.status === "active");

  if (!collabId) {
    return (
      <MobileShell>
        <BackHeader title="Collaboration" />
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <Meta>Collaboration not found.</Meta>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <BackHeader
        title={
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-display text-[15px] font-semibold text-tg-ink">
              {collab?.title ?? "Collaboration"}
            </span>
            <span className="font-mono text-[10.5px] text-tg-brown-soft">{activeMembers.length} members</span>
          </span>
        }
        right={
          <span className="flex flex-none -space-x-2">
            {activeMembers.slice(0, 4).map((m) => (
              <span key={m.user_id} className="rounded-pill border-2 border-tg-bg">
                <Avatar maker={makerFromProfile(m.profile)} size={26} />
              </span>
            ))}
          </span>
        }
      />

      {/* Planning toolbar */}
      <div className="flex-none border-b border-tg-line bg-tg-card">
        <div className="flex gap-1.5 overflow-x-auto px-3 py-2.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = panel === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setPanel(on ? "chat" : t.key)}
                className={cn(
                  "flex flex-none items-center gap-1.5 rounded-pill border px-3 py-1.5 font-display text-[12px] font-semibold transition-colors",
                  on
                    ? "border-tg-blue-accent bg-tg-stone2 text-tg-blue-accent"
                    : "border-tg-line text-tg-brown",
                )}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {panel === "chat" ? (
          <div className="px-4 py-4">
            {messages.length === 0 && (
              <div className="py-10 text-center">
                <Meta>No messages yet. Say hello to the group.</Meta>
              </div>
            )}
            {messages.map((m) => {
              const mine = m.sender_id === me;
              const who = memberById.get(m.sender_id)?.profile;
              const maker = makerFromProfile(who);
              return (
                <div key={m.id} className={cn("mb-3 flex gap-2.5", mine && "flex-row-reverse")}>
                  {!mine && <Avatar maker={maker} size={30} />}
                  <div className={cn("max-w-[78%]", mine && "items-end text-right")}>
                    {!mine && (
                      <span className="mb-0.5 block font-display text-[11.5px] font-semibold text-tg-brown">
                        {maker.name}
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-block rounded-lg px-3.5 py-2 font-body text-[14px] leading-snug",
                        mine ? "bg-tg-blue text-white" : "bg-tg-card text-tg-ink",
                      )}
                    >
                      {renderWithMentions(m.body)}
                    </span>
                    <span className="mt-0.5 block font-mono text-[9.5px] text-tg-brown-soft">{timeAgo(m.created_at)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        ) : (
          <PlanningPanel
            panel={panel}
            collab={collab}
            members={activeMembers}
            tasks={tasks}
            onToggle={(id, done) => toggleTask(id, done)}
            onOpenBrief={() => navigate(`${routes.brief}?id=${collabId}`)}
          />
        )}
      </div>

      {panel === "chat" && (
        <div className="flex flex-none items-center gap-2.5 border-t border-tg-line px-4 py-3 pb-6">
          <MentionInput
            ref={inputRef}
            value={text}
            onChange={setText}
            onSubmit={send}
            placeholder="Message the group…"
            ariaLabel="Group message"
            className="min-w-0 flex-1 rounded-pill border border-tg-line bg-tg-card px-4 py-2.5 text-[14px] text-tg-ink outline-none placeholder:text-tg-brown-soft focus:border-tg-blue-accent"
          />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={send}
            disabled={!text.trim()}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-pill bg-tg-blue text-white disabled:opacity-40"
            aria-label="Send"
          >
            <Send size={17} />
          </button>
        </div>
      )}
    </MobileShell>
  );
}

function PlanningPanel({
  panel,
  collab,
  members,
  tasks,
  onToggle,
  onOpenBrief,
}: {
  panel: Panel;
  collab: Collaboration | null;
  members: CollabMember[];
  tasks: CollabTask[];
  onToggle: (id: string, done: boolean) => void;
  onOpenBrief: () => void;
}) {
  return (
    <div className="px-4 py-4">
      {panel === "brief" && (
        <section>
          <h2 className="font-serif text-[19px] font-medium tracking-[-0.01em] text-tg-ink">Shared brief</h2>
          <p className="mt-2 whitespace-pre-wrap font-body text-[14px] leading-relaxed text-tg-ink">
            {collab?.brief?.trim() || "No brief yet — the owner can add one in the full brief view."}
          </p>
          <button
            type="button"
            onClick={onOpenBrief}
            className="mt-4 font-display text-[13px] font-semibold text-tg-terra underline underline-offset-4"
          >
            Open full brief
          </button>
        </section>
      )}

      {panel === "tasks" && (
        <section>
          <h2 className="font-serif text-[19px] font-medium tracking-[-0.01em] text-tg-ink">Tasks</h2>
          {tasks.length === 0 && <Meta className="mt-3 block">No tasks yet.</Meta>}
          <ul className="mt-3 flex flex-col gap-1">
            {tasks.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onToggle(t.id, !t.done)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-tg-stone2"
                >
                  {t.done ? (
                    <CheckCircle2 size={20} className="flex-none text-tg-blue-accent" />
                  ) : (
                    <Circle size={20} className="flex-none text-tg-brown-soft" />
                  )}
                  <span
                    className={cn(
                      "font-body text-[14px]",
                      t.done ? "text-tg-brown-soft line-through" : "text-tg-ink",
                    )}
                  >
                    {t.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onOpenBrief}
            className="mt-4 font-display text-[13px] font-semibold text-tg-terra underline underline-offset-4"
          >
            Manage in full brief
          </button>
        </section>
      )}

      {panel === "milestones" && (
        <section>
          <h2 className="font-serif text-[19px] font-medium tracking-[-0.01em] text-tg-ink">Milestones & timeline</h2>
          <Meta className="mt-3 block">Open the full brief to add and complete milestones.</Meta>
          <button
            type="button"
            onClick={onOpenBrief}
            className="mt-4 font-display text-[13px] font-semibold text-tg-terra underline underline-offset-4"
          >
            Open full brief
          </button>
        </section>
      )}

      {panel === "roles" && (
        <section>
          <h2 className="font-serif text-[19px] font-medium tracking-[-0.01em] text-tg-ink">Roles</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {members.map((r) => (
              <li key={r.user_id} className="flex items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-3">
                <Avatar maker={makerFromProfile(r.profile)} size={38} />
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-display text-[14px] font-semibold text-tg-ink">
                    {r.profile?.display_name || (r.profile?.username ? `@${r.profile.username}` : "Member")}
                  </span>
                  <span className="font-mono text-[10.5px] text-tg-brown-soft">{r.role || "—"}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {panel === "files" && (
        <section>
          <h2 className="font-serif text-[19px] font-medium tracking-[-0.01em] text-tg-ink">Files & shared pins</h2>
          <Meta className="mt-3 block">Shared files will appear here.</Meta>
        </section>
      )}
    </div>
  );
}
