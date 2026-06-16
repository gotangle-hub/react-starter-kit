import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { chats, makerById, makers, me, type Maker } from "@/lib/fixtures";
import { cn } from "@/lib/utils";

/**
 * 45 · Direct message (G8). 1:1 chat — yours fill blue on the right, theirs on
 * the card to the left. After the first message the keyboard stays open: clear
 * the value and re-focus the input, never blur it.
 */
type Msg = { id: string; mine: boolean; text: string; time: string };

export default function DMThread() {
  const { id } = useParams();
  const chat = chats.find((c) => c.id === id);
  const other: Maker = chat ? makerById(chat.members[0]) : makers[2];

  const [list, setList] = useState<Msg[]>([
    { id: "m1", mine: false, text: "Saw your competition pin — are you still looking for a partner?", time: "2h" },
    { id: "m2", mine: true, text: "I am. Concept and drawings are covered, I need someone on modelling.", time: "2h" },
    { id: "m3", mine: false, text: "That's exactly my side. Let's grab coffee when you're back in Dubai.", time: "2h" },
  ]);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setList((prev) => [...prev, { id: "m" + (prev.length + 1), mine: true, text: t, time: "now" }]);
    setText("");
    // G8 — keep the keyboard open after send.
    inputRef.current?.focus();
  };

  return (
    <MobileShell>
      <BackHeader
        title={
          <span className="flex min-w-0 items-center gap-2">
            <Avatar maker={other} size={28} />
            <span className="flex items-center gap-1 truncate font-display text-[15px] font-semibold text-tg-ink">
              {other.name}
              {other.verified && <VerifiedBadge size={14} />}
            </span>
          </span>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {list.map((m) => (
          <div key={m.id} className={cn("mb-3 flex", m.mine ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[78%]", m.mine && "text-right")}>
              <span
                className={cn(
                  "inline-block rounded-lg px-3.5 py-2 font-body text-[14px] leading-snug",
                  m.mine ? "bg-tg-blue text-white" : "bg-tg-card text-tg-ink",
                )}
              >
                {m.text}
              </span>
              <span className="mt-0.5 block font-mono text-[9.5px] text-tg-brown-soft">{m.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-none items-center gap-2.5 border-t border-tg-line px-4 py-3 pb-6">
        <Avatar maker={me as Maker} size={32} />
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={`Message ${other.name.split(" ")[0]}…`}
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
    </MobileShell>
  );
}
