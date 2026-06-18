// G6 · Boosts service — read/start/track paid promotions.
import { supabase } from "@/integrations/supabase/client";

export type BoostKind = "profile" | "post" | "callout" | "community" | "creator";
export type BoostStatus = "pending" | "active" | "ended" | "failed" | "canceled";

export interface BoostRow {
  id: string;
  owner_id: string;
  kind: BoostKind;
  target_id: string | null;
  product_id: string;
  product_name: string;
  audience: string;
  duration_days: number;
  daily_budget_minor: number;
  total_minor: number;
  currency: string;
  status: BoostStatus;
  ziina_intent_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
  impressions: number;
  clicks: number;
  created_at: string;
  updated_at: string;
}

export interface BoostReachStats {
  impressions: number;
  unique_viewers: number;
  started_at: string | null;
  ends_at: string | null;
  status: BoostStatus;
}

export async function listMyBoosts(): Promise<BoostRow[]> {
  const { data } = await supabase
    .from("boosts")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as BoostRow[];
}

export async function getMyLatestBoost(): Promise<BoostRow | null> {
  const { data } = await supabase.rpc("get_my_latest_boost");
  return (data as BoostRow | null) ?? null;
}

export async function getBoostReachStats(boostId: string): Promise<BoostReachStats | null> {
  const { data } = await supabase.rpc("boost_reach_stats", { _boost_id: boostId });
  const row = Array.isArray(data) ? data[0] : data;
  return (row as BoostReachStats | undefined) ?? null;
}
