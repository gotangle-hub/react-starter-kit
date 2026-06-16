import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { chats, makerById, type Chat } from "@/lib/fixtures";
import { routes, path } from "@/lib/routes";

/**
 * 43 · Messages (G7). Unified, colour-coded inbox — connections, group
 * collaborations, client projects and competition threads in one list. The
 * left rail colour codes each row by kind. Pull to refresh.
 */
function railColor(kind: Chat["kind"]) {
  return kind === "competition"
    ? "var(--tg-purple)"
    : kind === "client"
      ? "var(--tg-blue)"
      : "var(--tg-brown-soft)";
}

function kindLabel(kind: Chat["kind"]) {
  return kind === "competition" ? "Competition" : kind === "client" ? "Client project" : "Connection";
}

export default function Inbox() {
  const navigate = useNavigate();

  const open = (chat: Chat) => {
    if (chat.kind === "regular") navigate(path(routes.dmThread, { id: chat.id }));
    else navigate(path(routes.projectChat, { id: chat.id }));
  };

  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="flex flex-none items-center justify-between border-b border-tg-line px-[20px] py-3.5">
        <h1 className="font-serif text-[22px] font-medium tracking-[-0.02em] text-tg-ink">Messages</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <RefreshHint />
        <ul className="px-2 pb-6">
          {chats.map((chat) => {
            const lead = makerById(chat.members[0]);
            const extra = chat.members.length - 1;
            return (
              <li key={chat.id}>
                <button
                  type="button"
                  onClick={() => open(chat)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-tg-stone2"
                >
                  <span
                    className="h-11 w-1 flex-none rounded-pill"
                    style={{ background: railColor(chat.kind) }}
                    aria-hidden
                  />
                  <span className="relative flex-none">
                    <Avatar maker={lead} size={44} />
                    {extra > 0 && (
                      <span className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-pill border border-tg-bg bg-tg-card px-1 font-mono text-[9.5px] font-semibold text-tg-brown">
                        +{extra}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate font-display text-[14.5px] font-semibold text-tg-ink">
                        {chat.title}
                      </span>
                      <span className="flex-none font-mono text-[10.5px] text-tg-brown-soft">{chat.time}</span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate font-body text-[13px] text-tg-brown">{chat.last}</span>
                      {chat.unread > 0 && (
                        <span className="flex h-5 min-w-5 flex-none items-center justify-center rounded-pill bg-tg-blue px-1.5 font-mono text-[10px] font-semibold text-white">
                          {chat.unread}
                        </span>
                      )}
                    </span>
                    <span
                      className="mt-1 inline-block font-mono text-[9.5px] uppercase tracking-[0.12em]"
                      style={{ color: railColor(chat.kind) }}
                    >
                      {kindLabel(chat.kind)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </MobileShell>
  );
}
