import { useRef, useState } from "react";
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
import { chats, makerById, makers, me, type Maker } from "@/lib/fixtures";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * 44 · Collaboration group chat (G8, G10). Embedded planning tools — shared
 * brief, tasks/checklist, milestones & timeline, roles, shared files/pins — sit
 * above the thread as expandable tabs. Supports more than two members. After the
 * first message the keyboard stays open: we only clear the value and re-focus.
 */
type Msg = { id: string; from: string; text: string; time: string };
type Panel = "chat" | "brief" | "tasks" | "milestones" | "roles" | "files";

const TABS: { key: Exclude<Panel, "chat">; label: string; icon: typeof FileText }[] = [
  { key: "brief", label: "Brief", icon: FileText },
  { key: "tasks", label: "Tasks", icon: ListChecks },
  { key: "milestones", label: "Timeline", icon: Flag },
  { key: "roles", label: "Roles", icon: Users },
  { key: "files", label: "Files", icon: Paperclip },
];

export default function ProjectChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const chat = chats.find((c) => c.id === id) ?? chats.find((c) => c.kind !== "regular") ?? chats[0];

  // Show 3+ members for the group: chat members plus the signed-in user.
  const members: Maker[] = [
    ...chat.members.map(makerById),
    ...(chat.members.length < 2 ? [makers[2]] : []),
  ];
  const roster: { maker: Maker | typeof me; role: string }[] = [
    ...members.map((m, i) => ({ maker: m, role: ["Concept & drawings", "Modelling", "Visualisation", "Boards"][i % 4] })),
    { maker: me, role: "Coordination" },
  ];

  const [panel, setPanel] = useState<Panel>("chat");
  const [tasks, setTasks] = useState([
    { id: "t1", label: "Site analysis & references", done: true },
    { id: "t2", label: "Concept diagrams", done: false },
    { id: "t3", label: "Physical model — 1:50", done: false },
    { id: "t4", label: "Board layout & submission", done: false },
  ]);
  const [list, setList] = useState<Msg[]>([
    { id: "m1", from: chat.members[0], text: "Shared the brief and the references — take a look when you can.", time: "1d" },
    { id: "m2", from: me.id, text: "Looks good. I'll take the concept diagrams.", time: "1d" },
    { id: "m3", from: chat.members[0], text: "I'll start the concept diagrams tonight.", time: "2m" },
  ]);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setList((prev) => [...prev, { id: "m" + (prev.length + 1), from: me.id, text: t, time: "now" }]);
    setText("");
    // G8 — keep the keyboard open after send.
    inputRef.current?.focus();
  };

  const toggleTask = (tid: string) =>
    setTasks((prev) => prev.map((t) => (t.id === tid ? { ...t, done: !t.done } : t)));

  return (
    <MobileShell>
      <BackHeader
        title={
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-display text-[15px] font-semibold text-tg-ink">{chat.title}</span>
            <span className="font-mono text-[10.5px] text-tg-brown-soft">{roster.length} members</span>
          </span>
        }
        right={
          <span className="flex flex-none -space-x-2">
            {roster.slice(0, 4).map((r, i) => (
              <span key={i} className="rounded-pill border-2 border-tg-bg">
                <Avatar maker={r.maker as Maker} size={26} />
              </span>
            ))}
          </span>
        }
      />

      {/* Planning toolbar (G10) */}
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
            {list.map((m) => {
              const mine = m.from === me.id;
              const who = mine ? me : makerById(m.from);
              return (
                <div key={m.id} className={cn("mb-3 flex gap-2.5", mine && "flex-row-reverse")}>
                  {!mine && <Avatar maker={who as Maker} size={30} />}
                  <div className={cn("max-w-[78%]", mine && "items-end text-right")}>
                    {!mine && (
                      <span className="mb-0.5 block font-display text-[11.5px] font-semibold text-tg-brown">
                        {who.name}
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-block rounded-lg px-3.5 py-2 font-body text-[14px] leading-snug",
                        mine ? "bg-tg-blue text-white" : "bg-tg-card text-tg-ink",
                      )}
                    >
                      {m.text}
                    </span>
                    <span className="mt-0.5 block font-mono text-[9.5px] text-tg-brown-soft">{m.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <PlanningPanel
            panel={panel}
            roster={roster}
            tasks={tasks}
            onToggle={toggleTask}
            onOpenBrief={() => navigate(routes.brief)}
          />
        )}
      </div>

      {panel === "chat" && (
        <div className="flex flex-none items-center gap-2.5 border-t border-tg-line px-4 py-3 pb-6">
          <Avatar maker={me as Maker} size={32} />
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Message the group…"
            className="min-w-0 flex-1 rounded-pill border border-tg-line bg-tg-card px-4 py-2.5 text-[14px] text-tg-ink outline-none placeholder:text-tg-brown-soft focus:border-tg-blue-accent"
          />
          <button
            type="button"
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
  roster,
  tasks,
  onToggle,
  onOpenBrief,
}: {
  panel: Panel;
  roster: { maker: Maker | typeof me; role: string }[];
  tasks: { id: string; label: string; done: boolean }[];
  onToggle: (id: string) => void;
  onOpenBrief: () => void;
}) {
  return (
    <div className="px-4 py-4">
      {panel === "brief" && (
        <section>
          <h2 className="font-serif text-[19px] font-medium tracking-[-0.01em] text-tg-ink">Shared brief</h2>
          <p className="mt-2 font-body text-[14px] leading-relaxed text-tg-ink">
            A two-stage open competition. Concept and drawings first, a physical model and a four-board submission
            second. Warm materials, restraint, natural light over spectacle. Prize split evenly across the team.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            {[
              ["Scope", "Concept · model · boards"],
              ["Deadline", "12 July 2026"],
              ["Prize", "Split evenly"],
              ["Format", "4 × A1 + model"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-tg-line bg-tg-card p-3">
                <dt className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-tg-brown-soft">{k}</dt>
                <dd className="mt-1 font-display text-[13.5px] font-semibold text-tg-ink">{v}</dd>
              </div>
            ))}
          </dl>
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
          <ul className="mt-3 flex flex-col gap-1">
            {tasks.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onToggle(t.id)}
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
                    {t.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {panel === "milestones" && (
        <section>
          <h2 className="font-serif text-[19px] font-medium tracking-[-0.01em] text-tg-ink">Milestones & timeline</h2>
          <ol className="mt-4 border-l border-tg-line pl-4">
            {[
              ["Concept locked", "20 Jun", true],
              ["Model started", "28 Jun", false],
              ["Boards drafted", "06 Jul", false],
              ["Submission", "12 Jul", false],
            ].map(([label, date, done]) => (
              <li key={label as string} className="relative mb-5 last:mb-0">
                <span
                  className={cn(
                    "absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-pill",
                    done ? "bg-tg-blue-accent" : "border border-tg-brown-soft bg-tg-bg",
                  )}
                />
                <span className="block font-display text-[14px] font-semibold text-tg-ink">{label}</span>
                <span className="font-mono text-[10.5px] text-tg-brown-soft">{date}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {panel === "roles" && (
        <section>
          <h2 className="font-serif text-[19px] font-medium tracking-[-0.01em] text-tg-ink">Roles</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {roster.map((r, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-3">
                <Avatar maker={r.maker as Maker} size={38} />
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-display text-[14px] font-semibold text-tg-ink">
                    {r.maker.name}
                  </span>
                  <span className="font-mono text-[10.5px] text-tg-brown-soft">{r.role}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {panel === "files" && (
        <section>
          <h2 className="font-serif text-[19px] font-medium tracking-[-0.01em] text-tg-ink">Files & shared pins</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {[
              ["Competition_brief.pdf", "PDF · 2.1 MB"],
              ["Site_references.zip", "Archive · 18 MB"],
              ["Pin up — Warm concrete", "12 pins"],
            ].map(([name, meta]) => (
              <li key={name} className="flex items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-3">
                <Paperclip size={18} className="flex-none text-tg-brown" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-display text-[13.5px] font-semibold text-tg-ink">{name}</span>
                  <span className="font-mono text-[10px] text-tg-brown-soft">{meta}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
