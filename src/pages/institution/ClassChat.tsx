import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Lock, Send } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { Meta } from "@/components/brand/atoms";
import { MentionInput, type MentionInputHandle } from "@/components/app/mention-input";
import { renderWithMentions } from "@/lib/mentions";
import { supabase } from "@/integrations/supabase/client";
import { getClass, listClassMembers, type ClassMember, type ClassSummary } from "@/services/classes";
import { listMessages, sendMessage, type DmMessage } from "@/services/messages";
import { makerFromProfile } from "@/services/profile";
import { cn } from "@/lib/utils";

function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "now";
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return `${Math.floor(d / 86400)}d`;
}

export default function ClassChat() {
  const { id } = useParams();
  const [cls, setCls] = useState<ClassSummary | null>(null);
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [msgs, setMsgs] = useState<DmMessage[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [text, setText] = useState("");
  const inputRef = useRef<MentionInputHandle>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [c, m] = await Promise.all([getClass(id), listClassMembers(id)]);
      setCls(c);
      setMembers(m);
      if (c?.conversation_id) setMsgs(await listMessages(c.conversation_id));
    })();
  }, [id]);

  useEffect(() => {
    const conv = cls?.conversation_id;
    if (!conv) return;
    const ch = supabase
      .channel(`class-chat-${conv}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "dm_messages", filter: `conversation_id=eq.${conv}` }, (p) => {
        const m = p.new as DmMessage;
        setMsgs((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [cls?.conversation_id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  const byId = useMemo(() => {
    const m = new Map<string, ClassMember>();
    members.forEach((x) => m.set(x.user_id, x));
    return m;
  }, [members]);

  const send = async () => {
    const t = text.trim();
    if (!t || !cls?.conversation_id) return;
    setText("");
    try {
      const msg = await sendMessage(cls.conversation_id, t);
      if (msg) setMsgs((p) => (p.some((x) => x.id === msg.id) ? p : [...p, msg]));
    } catch (e) {
      console.warn(e);
    }
    inputRef.current?.focus();
  };

  return (
    <MobileShell>
      <BackHeader
        title={
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-display text-[15px] font-semibold text-tg-ink">{cls?.name ?? "Class chat"}</span>
            <span className="font-mono text-[10.5px] text-tg-brown-soft">{members.filter((m) => m.status === "active").length} members · private</span>
          </span>
        }
        right={<span className="ml-auto"><Lock size={14} className="text-tg-brown-soft" /></span>}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {msgs.length === 0 && (
          <div className="py-10 text-center"><Meta>No messages yet. Say hello to the class.</Meta></div>
        )}
        {msgs.map((m) => {
          const mine = m.sender_id === me;
          const who = byId.get(m.sender_id)?.profile;
          const maker = makerFromProfile(who);
          return (
            <div key={m.id} className={cn("mb-3 flex gap-2.5", mine && "flex-row-reverse")}>
              {!mine && <Avatar maker={maker} size={30} />}
              <div className={cn("max-w-[78%]", mine && "items-end text-right")}>
                {!mine && <span className="mb-0.5 block font-display text-[11.5px] font-semibold text-tg-brown">{maker.name}</span>}
                <span className={cn("inline-block rounded-lg px-3.5 py-2 font-body text-[14px] leading-snug", mine ? "bg-tg-blue text-white" : "bg-tg-card text-tg-ink")}>
                  {renderWithMentions(m.body)}
                </span>
                <span className="mt-0.5 block font-mono text-[9.5px] text-tg-brown-soft">{timeAgo(m.created_at)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex flex-none items-center gap-2.5 border-t border-tg-line px-4 py-3 pb-6">
        <MentionInput
          ref={inputRef}
          value={text}
          onChange={setText}
          onSubmit={send}
          placeholder="Message the class…"
          ariaLabel="Class message"
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
    </MobileShell>
  );
}
