import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { routes, path } from "@/lib/routes";
import { listMyConversations, type ConversationSummary } from "@/services/messages";
import { makerFromProfile } from "@/services/profile";
import { supabase } from "@/integrations/supabase/client";

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

/**
 * 43 · Messages (G7). Real conversations from the database, newest first.
 * Pull to refresh (G7). Unread badge derived from last_read_at vs last_message_at.
 */
export default function Inbox() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const rows = await listMyConversations();
    setItems(rows);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel("inbox-conversations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dm_messages" },
        () => refresh(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="flex flex-none items-center justify-between border-b border-tg-line px-[20px] py-3.5">
        <h1 className="font-serif text-[22px] font-medium tracking-[-0.02em] text-tg-ink">Messages</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <RefreshHint />
        {!loading && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
            <p className="font-display text-[15px] font-semibold text-tg-ink">No messages yet</p>
            <p className="mt-1 font-body text-[13px] text-tg-brown-soft">
              Connect with someone to start a conversation.
            </p>
          </div>
        ) : (
          <ul className="px-2 pb-6">
            {items.map((row) => {
              const maker = makerFromProfile(row.other);
              return (
                <li key={row.conversationId}>
                  <button
                    type="button"
                    onClick={() => row.otherUserId && navigate(path(routes.dmThread, { id: row.otherUserId }))}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-tg-stone2"
                  >
                    <span
                      className="h-11 w-1 flex-none rounded-pill"
                      style={{ background: "var(--tg-brown-soft)" }}
                      aria-hidden
                    />
                    <span className="relative flex-none">
                      <Avatar maker={maker} size={44} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate font-display text-[14.5px] font-semibold text-tg-ink">
                          {maker.name}
                        </span>
                        <span className="flex-none font-mono text-[10.5px] text-tg-brown-soft">{timeAgo(row.lastMessageAt)}</span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate font-body text-[13px] text-tg-brown">
                          {row.lastMessagePreview ?? "Say hello"}
                        </span>
                        {row.unread && (
                          <span className="h-2.5 w-2.5 flex-none rounded-pill bg-tg-blue" aria-label="unread" />
                        )}
                      </span>
                      <span className="mt-1 inline-block font-mono text-[9.5px] uppercase tracking-[0.12em] text-tg-brown-soft">
                        Connection
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </MobileShell>
  );
}
