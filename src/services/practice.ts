/**
 * Daily Practice — habit reward.
 * Designer-Individual free: add work 10 consecutive days → 1 month Pro.
 * Client free: post 3 briefs within 10 days → 1 month Client Pro.
 *
 * Backend is the source of truth (see migration). This service wraps
 * the RPCs and exposes a tz helper so the first qualifying action
 * stores the device IANA timezone on the profile.
 */
import { supabase } from "@/integrations/supabase/client";

export type PracticeStatus =
  | { ok: true; kind: null; eligible: false }
  | {
      ok: true;
      kind: "designer";
      eligible: boolean;
      tz: string;
      today: string;
      streak: number;
      goal: number;
      today_done: boolean;
      granted_at: string | null;
      recent_days: string[];
    }
  | {
      ok: true;
      kind: "client";
      eligible: boolean;
      tz: string;
      today: string;
      count: number;
      goal: number;
      window_start: string | null;
      days_left: number;
      briefs: Array<{ id: string; title: string; day: number; created_at: string }>;
      granted_at: string | null;
    };

function deviceTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export async function getPracticeStatus(): Promise<PracticeStatus | null> {
  const { data, error } = await supabase.rpc("get_practice_status" as never);
  if (error) {
    console.warn("[practice] get_practice_status", error.message);
    return null;
  }
  return data as PracticeStatus;
}

/**
 * Call after a qualifying action. Passes the device tz so the backend
 * can stamp it on the profile (only the FIRST time — stable afterwards).
 * Returns { granted_now } so the caller can route to the reward screen.
 */
export async function recordPracticeEvent(): Promise<{
  granted_now: boolean;
  status: PracticeStatus | null;
}> {
  const { data, error } = await supabase.rpc("record_practice_event" as never, {
    _tz: deviceTz(),
  } as never);
  if (error) {
    console.warn("[practice] record_practice_event", error.message);
    return { granted_now: false, status: null };
  }
  const d = data as { granted_now?: boolean; status?: PracticeStatus };
  return { granted_now: !!d?.granted_now, status: d?.status ?? null };
}
