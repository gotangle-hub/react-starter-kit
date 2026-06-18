import { useEffect, useMemo } from "react";
import {
  Bell,
  CalendarClock,
  Heart,
  MessageSquare,
  UserPlus,
  Users,
  Bookmark,
  Pin,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { useNotifications, type NotificationRow } from "@/hooks/use-notifications";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * 46 · Notifications (G7). Likes, follows, comments, connection and
 * collaboration updates. Live via realtime; opening the screen marks
 * everything as read.
 */
const ICON: Record<string, typeof Bell> = {
  like: Heart,
  save: Bookmark,
  pin: Pin,
  comment: MessageSquare,
  follow: UserPlus,
  connect: UserPlus,
  collab: Users,
  interest: Heart,
  deadline: CalendarClock,
  message: MessageSquare,
};

function useActorNames(ids: string[]) {
  const key = ids.slice().sort().join(",");
  return useQuery({
    queryKey: ["notif-actors", key],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", ids);
      const map: Record<string, string> = {};
      (data ?? []).forEach((p: { id: string; display_name: string | null }) => {
        map[p.id] = p.display_name ?? "Someone";
      });
      return map;
    },
  });
}

function Row({
  n,
  actorName,
  onResolve,
}: {
  n: NotificationRow;
  actorName: string;
  onResolve: (id: string) => void;
}) {
  const Icon = ICON[n.type] ?? Bell;
  const actionable = n.type === "connect" || n.type === "collab";
  const unread = !n.read_at;
  const time = formatDistanceToNow(new Date(n.created_at), { addSuffix: true });
  return (
    <li className="flex items-start gap-3 px-[18px] py-3.5">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-body text-[14px] leading-snug text-tg-ink">
          <span className="font-display font-semibold">{actorName}</span> {n.body ?? ""}
        </p>
        <span className="mt-0.5 block font-mono text-[10.5px] text-tg-brown-soft">{time}</span>
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
      {unread && <span className="mt-1.5 h-2 w-2 flex-none rounded-pill bg-tg-blue" aria-label="Unread" />}
    </li>
  );
}

export default function Notifications() {
  const { items, markAllRead, remove } = useNotifications();

  // Mark as read on mount
  useEffect(() => {
    markAllRead();
    // run once on open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actorIds = useMemo(
    () => Array.from(new Set(items.map((n) => n.actor_id).filter((x): x is string => !!x))),
    [items],
  );
  const { data: actorMap = {} } = useActorNames(actorIds);

  // Split by what was unread BEFORE we marked them read on open
  const [unreadIds] = useMemo(() => {
    const ids = new Set(items.filter((n) => !n.read_at).map((n) => n.id));
    return [ids];
    // capture on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isNew = (n: NotificationRow) => unreadIds.has(n.id) || !n.read_at;
  const unread = items.filter(isNew);
  const earlier = items.filter((n) => !isNew(n));

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
                <Row
                  key={n.id}
                  n={n}
                  actorName={(n.actor_id && actorMap[n.actor_id]) || "Someone"}
                  onResolve={remove}
                />
              ))}
            </ul>
          </>
        )}

        {earlier.length > 0 && (
          <>
            <SectionLabel>Earlier</SectionLabel>
            <ul className="divide-y divide-tg-line-soft">
              {earlier.map((n) => (
                <Row
                  key={n.id}
                  n={n}
                  actorName={(n.actor_id && actorMap[n.actor_id]) || "Someone"}
                  onResolve={remove}
                />
              ))}
            </ul>
          </>
        )}

        {items.length === 0 && (
          <div className="flex flex-col items-center px-8 py-20 text-center">
            <Bell size={28} className="text-tg-brown-soft" />
            <p className="mt-3 font-serif text-[18px] text-tg-ink">All caught up</p>
            <p className="mt-1 font-body text-[13px] text-tg-brown">
              Likes, follows, comments and collaboration updates will appear here.
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
