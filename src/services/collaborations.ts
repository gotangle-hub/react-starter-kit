import { supabase } from "@/integrations/supabase/client";
import { getProfilesByIds, type ProfileRow } from "@/services/profile";

export type CollabMemberStatus = "invited" | "active" | "declined" | "left";

export interface Collaboration {
  id: string;
  title: string;
  brief: string;
  owner_id: string;
  conversation_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollabSummary extends Collaboration {
  my_status: CollabMemberStatus;
  member_count: number;
  task_count: number;
  task_done: number;
}

export interface CollabMember {
  collab_id: string;
  user_id: string;
  role: string;
  status: CollabMemberStatus;
  invited_by: string | null;
  profile?: ProfileRow | null;
}

export interface CollabTask {
  id: string;
  collab_id: string;
  title: string;
  done: boolean;
  assignee_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CollabMilestone {
  id: string;
  collab_id: string;
  title: string;
  due_date: string | null;
  done: boolean;
}

export async function listMyCollaborations(): Promise<CollabSummary[]> {
  const { data, error } = await supabase.rpc("list_my_collaborations");
  if (error || !data) return [];
  return data as CollabSummary[];
}

export async function createCollaboration(
  title: string,
  brief: string,
  memberIds: string[],
): Promise<string> {
  const { data, error } = await supabase.rpc("create_collaboration", {
    _title: title,
    _brief: brief,
    _member_ids: memberIds,
  });
  if (error) throw error;
  return data as string;
}

export async function inviteToCollaboration(collabId: string, memberIds: string[]): Promise<void> {
  const { error } = await supabase.rpc("invite_to_collaboration", {
    _collab: collabId,
    _member_ids: memberIds,
  });
  if (error) throw error;
}

export async function respondCollabInvite(collabId: string, accept: boolean): Promise<void> {
  const { error } = await supabase.rpc("respond_collab_invite", {
    _collab: collabId,
    _accept: accept,
  });
  if (error) throw error;
}

export async function getCollaboration(id: string): Promise<Collaboration | null> {
  const { data } = await supabase.from("collaborations").select("*").eq("id", id).maybeSingle();
  return (data as Collaboration | null) ?? null;
}

export async function updateBrief(id: string, brief: string, title?: string): Promise<void> {
  const patch: { brief: string; title?: string } = { brief };
  if (title !== undefined) patch.title = title;
  const { error } = await supabase.from("collaborations").update(patch).eq("id", id);
  if (error) throw error;
}

export async function listMembers(collabId: string): Promise<CollabMember[]> {
  const { data } = await supabase
    .from("collaboration_members")
    .select("*")
    .eq("collab_id", collabId);
  const rows = (data as CollabMember[] | null) ?? [];
  const profiles = await getProfilesByIds(rows.map((r) => r.user_id));
  return rows.map((r) => ({ ...r, profile: profiles.get(r.user_id) ?? null }));
}

export async function setMemberRole(collabId: string, userId: string, role: string): Promise<void> {
  const { error } = await supabase
    .from("collaboration_members")
    .update({ role })
    .eq("collab_id", collabId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function listTasks(collabId: string): Promise<CollabTask[]> {
  const { data } = await supabase
    .from("collaboration_tasks")
    .select("*")
    .eq("collab_id", collabId)
    .order("created_at", { ascending: true });
  return (data as CollabTask[] | null) ?? [];
}

export async function addTask(collabId: string, title: string, assigneeId?: string | null): Promise<CollabTask | null> {
  const t = title.trim();
  if (!t) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("collaboration_tasks")
    .insert({ collab_id: collabId, title: t, assignee_id: assigneeId ?? null, created_by: user.id })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return (data as CollabTask | null) ?? null;
}

export async function toggleTask(id: string, done: boolean): Promise<void> {
  const { error } = await supabase.from("collaboration_tasks").update({ done }).eq("id", id);
  if (error) throw error;
}

export async function assignTask(id: string, assigneeId: string | null): Promise<void> {
  const { error } = await supabase
    .from("collaboration_tasks")
    .update({ assignee_id: assigneeId })
    .eq("id", id);
  if (error) throw error;
}

export async function listMilestones(collabId: string): Promise<CollabMilestone[]> {
  const { data } = await supabase
    .from("collaboration_milestones")
    .select("*")
    .eq("collab_id", collabId)
    .order("due_date", { ascending: true, nullsFirst: false });
  return (data as CollabMilestone[] | null) ?? [];
}

export async function addMilestone(collabId: string, title: string, dueDate: string | null): Promise<void> {
  const t = title.trim();
  if (!t) return;
  const { error } = await supabase
    .from("collaboration_milestones")
    .insert({ collab_id: collabId, title: t, due_date: dueDate });
  if (error) throw error;
}

export async function toggleMilestone(id: string, done: boolean): Promise<void> {
  const { error } = await supabase
    .from("collaboration_milestones")
    .update({ done })
    .eq("id", id);
  if (error) throw error;
}

/** Pending invites for the current user. */
export async function listMyInvites(): Promise<Array<CollabMember & { collab: Collaboration | null }>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("collaboration_members")
    .select("*, collab:collaborations(*)")
    .eq("user_id", user.id)
    .eq("status", "invited");
  return (data as Array<CollabMember & { collab: Collaboration | null }> | null) ?? [];
}
