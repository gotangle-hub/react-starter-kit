import { supabase } from "@/integrations/supabase/client";

export type ReferralCheck =
  | { ok: true; code: string; months: number }
  | { ok: false; message: string };

/** Validate a referral / promo code for a given account_type before signup.
 *  Empty input is treated as "no code, no error". */
export async function validateReferralCode(
  raw: string,
  accountType: string,
): Promise<ReferralCheck | null> {
  const code = (raw || "").trim();
  if (!code) return null;
  const { data, error } = await supabase.rpc("validate_promo_code", {
    _code: code,
    _account_type: accountType,
  });
  if (error) return { ok: false, message: "Couldn't check that code — try again." };
  const d = data as { ok: boolean; code?: string; months?: number; message?: string; reason?: string };
  if (d?.ok) return { ok: true, code: d.code!, months: d.months! };
  return { ok: false, message: d?.message || "That code isn't valid." };
}
