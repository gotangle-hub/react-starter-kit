import { supabase } from "@/integrations/supabase/client";
import { getProfilesByIds, type ProfileRow } from "@/services/profile";

export type ClassKind = "studio" | "theoretical";
export type ClassRole = "professor" | "ta" | "student";

export interface ClassSummary {
  id: string;
  name: string;
  year: string | null;
  class_type: ClassKind;
  professor_id: string;
  conversation_id: string | null;
  allow_student_pins: boolean;
  brief: string | null;
  my_role: ClassRole;
  member_count: number;
  doc_count: number;
  created_at: string;
  updated_at: string;
}

export interface ClassDocument {
  id: string;
  class_id: string;
  uploader_id: string;
  kind: "project" | "document" | "brief" | "reference";
  title: string;
  body: string | null;
  file_path: string | null;
  link_url: string | null;
  created_at: string;
}

export interface ClassMember {
  class_id: string;
  user_id: string;
  role: ClassRole;
  status: "active" | "invited" | "left";
  joined_at: string;
  profile?: ProfileRow | null;
}

export interface ClassInvite {
  id: string;
  class_id: string;
  email: string;
  role: ClassRole;
  token: string;
  status: "pending" | "accepted" | "cancelled" | "expired";
  invited_by: string | null;
  created_at: string;
}

export async function listMyClasses(): Promise<ClassSummary[]> {
  const { data, error } = await supabase.rpc("list_my_classes");
  if (error || !data) return [];
  return data as ClassSummary[];
}

export async function getClass(id: string): Promise<ClassSummary | null> {
  const all = await listMyClasses();
  return all.find((c) => c.id === id) ?? null;
}

export async function createClass(input: {
  name: string;
  year?: string;
  institutionId?: string | null;
  classType: ClassKind;
  allowStudentPins?: boolean;
  brief?: string;
  taEmail?: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc("create_class", {
    _name: input.name,
    _year: input.year ?? null,
    _institution_id: input.institutionId ?? null,
    _class_type: input.classType,
    _allow_student_pins: input.allowStudentPins ?? false,
    _brief: input.brief ?? null,
    _ta_email: input.taEmail ?? null,
  });
  if (error) throw error;
  return data as string;
}

export async function acceptClassInvite(token: string): Promise<string> {
  const { data, error } = await supabase.rpc("accept_class_invite", { _token: token });
  if (error) throw error;
  return data as string;
}

export async function listClassDocuments(
  classId: string,
  kind?: ClassDocument["kind"],
): Promise<ClassDocument[]> {
  let q = supabase.from("class_documents").select("*").eq("class_id", classId).order("created_at", { ascending: false });
  if (kind) q = q.eq("kind", kind);
  const { data } = await q;
  return (data ?? []) as ClassDocument[];
}

export async function addClassDocument(input: {
  classId: string;
  kind: ClassDocument["kind"];
  title: string;
  body?: string;
  filePath?: string;
  linkUrl?: string;
}): Promise<ClassDocument | null> {
  const { data: ures } = await supabase.auth.getUser();
  const uid = ures.user?.id;
  if (!uid) throw new Error("not authenticated");
  const { data, error } = await supabase
    .from("class_documents")
    .insert({
      class_id: input.classId,
      uploader_id: uid,
      kind: input.kind,
      title: input.title,
      body: input.body ?? null,
      file_path: input.filePath ?? null,
      link_url: input.linkUrl ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as ClassDocument;
}

export async function listClassMembers(classId: string): Promise<ClassMember[]> {
  const { data } = await supabase.from("class_members").select("*").eq("class_id", classId);
  const rows = (data ?? []) as ClassMember[];
  const ids = Array.from(new Set(rows.map((r) => r.user_id)));
  if (ids.length) {
    const profs = await getProfilesByIds(ids);
    const byId = new Map(profs.map((p) => [p.id, p]));
    rows.forEach((r) => (r.profile = byId.get(r.user_id) ?? null));
  }
  return rows;
}

export async function listPendingInvites(classId: string): Promise<ClassInvite[]> {
  const { data } = await supabase
    .from("class_invites")
    .select("*")
    .eq("class_id", classId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return (data ?? []) as ClassInvite[];
}

export async function cancelInvite(id: string): Promise<void> {
  await supabase.from("class_invites").update({ status: "cancelled" }).eq("id", id);
}

export async function updateClass(id: string, patch: Partial<{ brief: string; allow_student_pins: boolean; name: string; year: string }>): Promise<void> {
  await supabase.from("classes").update(patch).eq("id", id);
}

export function classDocPublicUrl(path: string): string {
  // class-docs bucket is private; use signed URL helper instead at point of use.
  return path;
}

export async function signClassDocUrl(path: string, expires = 60 * 10): Promise<string | null> {
  const { data, error } = await supabase.storage.from("class-docs").createSignedUrl(path, expires);
  if (error) return null;
  return data.signedUrl;
}
