import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import type { Database } from "@/integrations/supabase/types";

export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

/** Live unread notification count for the signed-in user, kept in sync via realtime. */
export function useUnreadCount() {
  const { session } = useSession();
  const userId = session?.user?.id ?? null;
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const { count: c } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .is("read_at", null);
    setCount(c ?? 0);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }
    refresh();
    const channel = supabase
      .channel(`notifications-count:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  return count;
}

/** All notifications for the signed-in user, kept live. */
export function useNotifications() {
  const { session } = useSession();
  const userId = session?.user?.id ?? null;
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setItems(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
    if (!userId) return;
    const channel = supabase
      .channel(`notifications-list:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
  }, [userId]);

  const remove = useCallback(async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
  }, []);

  return { items, loading, refresh, markAllRead, remove };
}
