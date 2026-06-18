import { supabase } from "@/integrations/supabase/client";

export interface VerificationResult {
  id?: string;
  status: "submitted" | "verified" | "rejected";
  verified: boolean;
  reason?: string | null;
}

/** Start a Persona inquiry. Returns the hosted URL the user must be sent to. */
export async function startPersonaVerification(redirectUri: string): Promise<{ inquiryId: string; url: string }> {
  const { data, error } = await supabase.functions.invoke("persona-create-inquiry", {
    body: { redirectUri },
  });
  if (error) throw error;
  if (!data?.url || !data?.inquiryId) throw new Error("Persona did not return a hosted link");
  // Stash so we can pick it up when the user returns
  try { sessionStorage.setItem("tg.persona.inquiryId", data.inquiryId); } catch { /* ignore */ }
  return data as { inquiryId: string; url: string };
}

/** Ask the backend to refresh status for a given inquiry. */
export async function checkPersonaInquiry(inquiryId: string): Promise<{ status: "submitted" | "verified" | "rejected"; personaStatus: string }> {
  const { data, error } = await supabase.functions.invoke("persona-check-inquiry", {
    body: { inquiryId },
  });
  if (error) throw error;
  return data as { status: "submitted" | "verified" | "rejected"; personaStatus: string };
}

export async function getMyVerificationStatus(): Promise<"none" | "submitted" | "verified" | "rejected"> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "none";
  const { data: profile } = await supabase
    .from("profiles")
    .select("verified_at")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.verified_at) return "verified";
  const { data: last } = await supabase
    .from("identity_verifications")
    .select("status")
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (last?.status as "submitted" | "rejected" | undefined) ?? "none";
}

export async function getMyLatestInquiryId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("identity_verifications")
    .select("inquiry_id")
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.inquiry_id as string | undefined) ?? null;
}
