import { supabase } from "@/integrations/supabase/client";
import { getProfilesByIds, type ProfileRow } from "@/services/profile";
import { filterOutBlocked } from "@/services/blocks";

export interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface CommentWithAuthor extends CommentRow {
  author: ProfileRow | null;
}

export async function listComments(postId: string): Promise<CommentWithAuthor[]> {
  if (!postId) return [];
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  const rows = await filterOutBlocked(data as CommentRow[], (r) => r.author_id);
  const profiles = await getProfilesByIds(rows.map((r) => r.author_id));
  return rows.map((r) => ({ ...r, author: profiles.get(r.author_id) ?? null }));
}

export async function addComment(postId: string, body: string): Promise<CommentRow | null> {
  const trimmed = body.trim();
  if (!trimmed) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: user.id, body: trimmed })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return (data as CommentRow | null) ?? null;
}

export async function countCommentsForPosts(postIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const unique = Array.from(new Set(postIds.filter(Boolean)));
  if (unique.length === 0) return map;
  const { data } = await supabase
    .from("comments")
    .select("post_id")
    .in("post_id", unique);
  for (const row of (data ?? []) as { post_id: string }[]) {
    map.set(row.post_id, (map.get(row.post_id) ?? 0) + 1);
  }
  for (const id of unique) if (!map.has(id)) map.set(id, 0);
  return map;
}

export async function countCommentsForPost(postId: string): Promise<number> {
  if (!postId) return 0;
  const { count } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);
  return count ?? 0;
}
