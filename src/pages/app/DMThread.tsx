import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { MentionInput, type MentionInputHandle } from "@/components/app/mention-input";
import { renderWithMentions } from "@/lib/mentions";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  ensureDmConversation,
  listMessages,
  markConversationRead,
  sendMessage,
  type DmMessage,
} from "@/services/messages";
import { getMyProfile, getProfileById, makerFromProfile, type ProfileRow } from "@/services/profile";

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

/**
 * 45 · Direct message (G8). The `:id` param is the OTHER user's id; we
 * find-or-create the 1:1 conversation server-side. After send the input stays
 * focused — the keyboard MUST NOT dismiss (G8). It only closes when the user
 * deliberately taps outside.
 */
export default function DMThread() {
  const { id: otherUserId } = useParams<{ id: string }>();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [me, setMe] = useState<ProfileRow | null>(null);
  const [other, setOther] = useState<ProfileRow | null>(null);
  const [list, setList] = useState<DmMessage[]>([]);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const meIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!otherUserId) return;
    let alive = true;
    (async () => {
      const [mine, them] = await Promise.all([getMyProfile(), getProfileById(otherUserId)]);
      if (!alive) return;
      setMe(mine);
      setOther(them);
      meIdRef.current = mine?.id ?? null;
      try {
        const convId = await ensureDmConversation(otherUserId);
        if (!alive) return;
        setConversationId(convId);
        const msgs = await listMessages(convId);
        if (!alive) return;
        setList(msgs);
        markConversationRead(convId);
      } catch {
        /* not allowed or signed out */
      }
    })();
    return () => { alive = false; };
  }, [otherUserId]);

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`dm:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dm_messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const msg = payload.new as DmMessage;
          setList((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
          markConversationRead(conversationId);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight });
  }, [list.length]);

  const send = async () => {
    const t = text.trim();
    if (!t || !conversationId) return;
    setText("");
    inputRef.current?.focus(); // G8 — never dismiss the keyboard after send.
    try {
      const inserted = await sendMessage(conversationId, t);
      if (inserted) setList((prev) => (prev.some((m) => m.id === inserted.id) ? prev : [...prev, inserted]));
    } catch {
      setText(t);
    } finally {
      // Belt and braces — re-focus on the next tick in case React moved focus.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const otherMaker = makerFromProfile(other);
  const meMaker = me ? makerFromProfile(me) : null;
  const firstName = otherMaker.name.split(" ")[0] ?? "them";

  return (
    <MobileShell>
      <BackHeader
        title={
          <span className="flex min-w-0 items-center gap-2">
            <Avatar maker={otherMaker} size={28} />
            <span className="flex items-center gap-1 truncate font-display text-[15px] font-semibold text-tg-ink">
              {otherMaker.name}
              {otherMaker.verified && <VerifiedBadge size={14} />}
            </span>
          </span>
        }
      />

      <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {list.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="font-display text-[14px] font-semibold text-tg-ink">Say hi to {firstName}</p>
            <p className="mt-1 font-body text-[12.5px] text-tg-brown-soft">
              Messages are private between the two of you.
            </p>
          </div>
        ) : (
          list.map((m) => {
            const mine = m.sender_id === meIdRef.current;
            return (
              <div key={m.id} className={cn("mb-3 flex", mine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[78%]", mine && "text-right")}>
                  <span
                    className={cn(
                      "inline-block rounded-lg px-3.5 py-2 font-body text-[14px] leading-snug",
                      mine ? "bg-tg-blue text-white" : "bg-tg-card text-tg-ink",
                    )}
                  >
                    {m.body}
                  </span>
                  <span className="mt-0.5 block font-mono text-[9.5px] text-tg-brown-soft">{timeAgo(m.created_at)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        className="flex flex-none items-center gap-2.5 border-t border-tg-line px-4 py-3 pb-6"
        onSubmit={(e) => { e.preventDefault(); send(); }}
      >
        {meMaker && <Avatar maker={meMaker} size={32} />}
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          // Never trigger blur on Enter — G8.
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
          // Defend against accidental blur right after send.
          onBlur={(e) => {
            if (document.activeElement === e.currentTarget) return;
          }}
          placeholder={`Message ${firstName}…`}
          className="min-w-0 flex-1 rounded-pill border border-tg-line bg-tg-card px-4 py-2.5 text-[14px] text-tg-ink outline-none placeholder:text-tg-brown-soft focus:border-tg-blue-accent"
        />
        <button
          type="submit"
          // Prevent the button from stealing focus on mousedown — keeps the keyboard open (G8).
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => { e.preventDefault(); send(); inputRef.current?.focus(); }}
          disabled={!text.trim() || !conversationId}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-pill bg-tg-blue text-white disabled:opacity-40"
          aria-label="Send"
        >
          <Send size={17} />
        </button>
      </form>
    </MobileShell>
  );
}
