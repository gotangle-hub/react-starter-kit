import { useState } from "react";
import {
  Bell,
  CalendarClock,
  Heart,
  MessageSquare,
  UserPlus,
  Users,
} from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { notifications as seed, type Notification } from "@/lib/fixtures";

/**
 * 46 · Notifications (G7). Likes, connection requests, comments, collaboration
 * and class updates, grouped by unread / earlier. Connect and collab rows carry
 * Accept / Ignore. Pull to refresh.
 */
const ICON: Record<Notification["type"], typeof Bell> = {
  connect: UserPlus,
  collab: Users,
  interest: Heart,
  deadline: CalendarClock,
  message: MessageSquare,
  like: Heart,
};

function Row({ n, onResolve }: { n: Notification; onResolve: (id: string) => void }) {
  const Icon = ICON[n.type] ?? Bell;
  const actionable = n.type === "connect" || n.type === "collab";
  return (
    <li className="flex items-start gap-3 px-[18px] py-3.5">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-body text-[14px] leading-snug text-tg-ink">
          <span className="font-display font-semibold">{n.who}</span> {n.text}
        </p>
        <span className="mt-0.5 block font-mono text-[10.5px] text-tg-brown-soft">{n.time}</span>
        {actionable && (
          <div className="mt-2.5 flex gap-2">
            <Button size="sm" onClick={() => onResolve(n.id)}>
              Accept
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onResolve(n.id)}>
              Ignore
            </Button>
          </div>
        )}
      </div>
      {n.unread && <span className="mt-1.5 h-2 w-2 flex-none rounded-pill bg-tg-blue" aria-label="Unread" />}
    </li>
  );
}

export default function Notifications() {
  const [list, setList] = useState<Notification[]>(seed);
  const resolve = (id: string) => setList((prev) => prev.filter((n) => n.id !== id));

  const unread = list.filter((n) => n.unread);
  const earlier = list.filter((n) => !n.unread);

  return (
    <MobileShell>
      <BackHeader title="Notifications" />
      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        <RefreshHint />

        {unread.length > 0 && (
          <>
            <SectionLabel>New</SectionLabel>
            <ul className="divide-y divide-tg-line-soft">
              {unread.map((n) => (
                <Row key={n.id} n={n} onResolve={resolve} />
              ))}
            </ul>
          </>
        )}

        {earlier.length > 0 && (
          <>
            <SectionLabel>Earlier</SectionLabel>
            <ul className="divide-y divide-tg-line-soft">
              {earlier.map((n) => (
                <Row key={n.id} n={n} onResolve={resolve} />
              ))}
            </ul>
          </>
        )}

        {list.length === 0 && (
          <div className="flex flex-col items-center px-8 py-20 text-center">
            <Bell size={28} className="text-tg-brown-soft" />
            <p className="mt-3 font-serif text-[18px] text-tg-ink">All caught up</p>
            <p className="mt-1 font-body text-[13px] text-tg-brown">
              Likes, connections, comments and collaboration updates will appear here.
            </p>
          </div>
        )}
      </div>
    </MobileShell>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="px-[18px] pb-1.5 pt-4 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
      {children}
    </div>
  );
}
