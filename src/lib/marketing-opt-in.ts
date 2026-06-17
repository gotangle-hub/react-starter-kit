import { supabase } from "@/integrations/supabase/client";

/**
 * Persist the marketing-email opt-in choice captured at the consent step
 * onto the user's profile. Safe to call before email confirmation —
 * the row is upserted so we don't 404 if the profile trigger hasn't
 * created it yet. Failures are logged but never block onboarding.
 */
export async function saveMarketingOptIn(marketingOptIn: boolean) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ marketing_opt_in: marketingOptIn })
      .eq("id", user.id);
    if (error) console.warn("marketing opt-in save failed", error);
  } catch (err) {
    console.warn("marketing opt-in save threw", err);
  }
}
