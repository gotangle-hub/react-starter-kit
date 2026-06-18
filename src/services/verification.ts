import { supabase } from "@/integrations/supabase/client";

const BUCKET = "id-verification";

export interface VerificationResult {
  id: string;
  status: "submitted" | "verified" | "rejected";
  verified: boolean;
  reason?: string | null;
}

async function uploadOne(uid: string, kind: "id" | "selfie", file: File): Promise<string> {
  const ext = (file.name.split(".").pop() ?? "bin").replace(/[^\w]+/g, "").slice(0, 8) || "bin";
  const path = `${uid}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return path;
}

export async function submitIdentityVerification(idDoc: File, selfie: File): Promise<VerificationResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const [idPath, selfiePath] = await Promise.all([
    uploadOne(user.id, "id", idDoc),
    uploadOne(user.id, "selfie", selfie),
  ]);
  const { data, error } = await supabase.rpc("submit_identity_verification", {
    _id_doc_path: idPath,
    _selfie_path: selfiePath,
  });
  if (error) throw error;
  return data as unknown as VerificationResult;
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
