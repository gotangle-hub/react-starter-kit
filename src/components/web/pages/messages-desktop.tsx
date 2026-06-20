import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send } from "lucide-react";

import { WebPage } from "@/components/web/web-page";
import { Avatar } from "@/components/brand/avatar";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { MentionInput, type MentionInputHandle } from "@/components/app/mention-input";
import { renderWithMentions } from "@/lib/mentions";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  ensureDmConversation,
  listMessages,
  listMyConversations,
  markConversationRead,
  sendMessage,
  type ConversationSummary,
  type DmMessage,
} from "@/services/messages";
import { getMyProfile, getProfileById, makerFromProfile, type ProfileRow } from "@/services/profile";
import { path, routes } from "@/lib/routes";

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

/**
 * Desktop Messages (reference: `web.jsx` → `WebMessages`).
 * Split-pane: left = conversations list, right = active thread.
 * Selecting a conversation updates the URL to /dm/:id.
 */
export function MessagesDesktop({ activeUserId }: { activeUserId?: string }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<ConversationSummary[]>([]);

  const refresh = async () => {
    const rows = await listMyConversations();
    setItems(rows.filter((r) => !r.isGroup));
  };

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel("inbox-conversations-web")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, refresh)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "dm_messages" }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <WebPage maxWidth={1200} pad="24px 32px">
      <h1 className="mb-5 font-serif text-[28px] tracking-[-0.02em] text-tg-ink">Messages</h1>

      <div className="grid h-[calc(100dvh-160px)] grid-cols-[340px_1fr] overflow-hidden rounded-2xl border border-tg-line bg-tg-bg">
        {/* List */}
        <aside className="min-h-0 overflow-y-auto border-r border-tg-line">
          {items.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="font-display text-[14px] font-semibold text-tg-ink">No messages yet</p>
              <p className="mt-1 font-body text-[12.5px] text-tg-brown-soft">
                Connect with someone to start a conversation.
              </p>
            </div>
          ) : (
            <ul className="p-2">
              {items.map((row) => {
                const maker = makerFromProfile(row.other);
                const active = row.otherUserId === activeUserId;
                return (
                  <li key={row.conversationId}>
                    <button
                      type="button"
                      onClick={() =>
                        row.otherUserId && navigate(path(routes.dmThread, { id: row.otherUserId }))
                      }
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        active ? "bg-tg-stone2" : "hover:bg-tg-stone2/60",
                      )}
                    >
                      <Avatar maker={maker} size={42} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="min-w-0 flex-1 truncate font-display text-[14px] font-semibold text-tg-ink">
                            {maker.name}
                          </span>
                          <span className="flex-none font-mono text-[10.5px] text-tg-brown-soft">
                            {timeAgo(row.lastMessageAt)}
                          </span>
                        </span>
                        <span className="mt-0.5 flex items-center gap-2">
                          <span className="min-w-0 flex-1 truncate font-body text-[13px] text-tg-brown">
                            {row.lastMessagePreview ?? "Say hello"}
                          </span>
                          {row.unread && (
                            <span className="h-2 w-2 flex-none rounded-full bg-tg-blue" aria-label="unread" />
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Thread */}
        <section className="min-h-0">
          {activeUserId ? (
            <ThreadPane otherUserId={activeUserId} />
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center">
              <div>
                <p className="font-serif text-[20px] tracking-[-0.01em] text-tg-ink">Pick a conversation</p>
                <p className="mt-1.5 font-body text-[13.5px] text-tg-brown-soft">
                  Select a thread on the left to start chatting.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </WebPage>
  );
}

function ThreadPane({ otherUserId }: { otherUserId: string }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [me, setMe] = useState<ProfileRow | null>(null);
  const [other, setOther] = useState<ProfileRow | null>(null);
  const [list, setList] = useState<DmMessage[]>([]);
  const [text, setText] = useState("");
  const inputRef = useRef<MentionInputHandle>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const meIdRef = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    setList([]);
    setConversationId(null);
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
      } catch {/* not allowed */}
    })();
    return () => { alive = false; };
  }, [otherUserId]);

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`dm-web:${conversationId}`)
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
    inputRef.current?.focus();
    try {
      const inserted = await sendMessage(conversationId, t);
      if (inserted) setList((prev) => (prev.some((m) => m.id === inserted.id) ? prev : [...prev, inserted]));
    } catch {
      setText(t);
    } finally {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const otherMaker = makerFromProfile(other);
  const meMaker = me ? makerFromProfile(me) : null;
  const firstName = otherMaker.name.split(" ")[0] ?? "them";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-none items-center gap-3 border-b border-tg-line px-5 py-3.5">
        <Avatar maker={otherMaker} size={36} />
        <div className="flex items-center gap-1.5">
          <span className="font-display text-[15.5px] font-semibold text-tg-ink">{otherMaker.name}</span>
          {otherMaker.verified && <VerifiedBadge size={15} />}
        </div>
      </header>

      <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
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
                <div className={cn("max-w-[68%]", mine && "text-right")}>
                  <span
                    className={cn(
                      "inline-block rounded-2xl px-3.5 py-2 font-body text-[14px] leading-snug",
                      mine ? "bg-tg-blue text-white" : "bg-tg-card text-tg-ink",
                    )}
                  >
                    {renderWithMentions(m.body)}
                  </span>
                  <span className="mt-0.5 block font-mono text-[9.5px] text-tg-brown-soft">{timeAgo(m.created_at)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        className="flex flex-none items-center gap-2.5 border-t border-tg-line px-5 py-3"
        onSubmit={(e) => { e.preventDefault(); send(); }}
      >
        {meMaker && <Avatar maker={meMaker} size={32} />}
        <MentionInput
          ref={inputRef}
          value={text}
          onChange={setText}
          onSubmit={send}
          placeholder={`Message ${firstName}…`}
          ariaLabel="Message"
          className="w-full min-w-0 rounded-full border border-tg-line bg-tg-card px-4 py-2.5 text-[14px] text-tg-ink outline-none placeholder:text-tg-brown-soft focus:border-tg-blue-accent"
        />
        <button
          type="submit"
          onMouseDown={(e) => e.preventDefault()}
          disabled={!text.trim() || !conversationId}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-tg-blue text-white disabled:opacity-40"
          aria-label="Send"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}

/** Convenience wrapper that pulls `:id` from the route (for /dm/:id on desktop). */
export function MessagesDesktopRouteParam() {
  const { id } = useParams<{ id: string }>();
  return <MessagesDesktop activeUserId={id} />;
}
