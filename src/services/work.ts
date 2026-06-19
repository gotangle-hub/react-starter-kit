import { supabase } from "@/integrations/supabase/client";
import { uploadService, type UploadProgress, type UploadResult } from "@/services/uploads";
import { workPublicUrl } from "@/services/profile";
import { filterOutBlocked } from "@/services/blocks";
import type { Database } from "@/integrations/supabase/types";

export type PostRow = Database["public"]["Tables"]["posts"]["Row"];

export interface NewWorkInput {
  title: string;
  caption?: string | null;
  category?: string | null;
  tags?: string[];
  /** Filename-friendly subpath. */
  subpath?: string;
  onExplore?: boolean;
}

/** Derive a title from a filename when the user hasn't typed one. */
export function deriveTitleFromFile(file: File): string {
  const base = file.name.replace(/\.[^./]+$/, "").replace(/[_-]+/g, " ").trim();
  return base.length ? base.replace(/\b\w/g, (c) => c.toUpperCase()) : "Untitled";
}

/** Upload a file then insert a posts row that points at the stored media. */
export async function uploadAndCreatePost(
  file: File,
  input: NewWorkInput,
  onProgress?: (p: UploadProgress) => void,
): Promise<{ post: PostRow; upload: UploadResult }> {
  const name = `${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
  const result = await uploadService.upload(
    "work",
    `raw/${input.subpath ?? name}`,
    file,
    onProgress,
  );

  const media =
    result.extractedImages && result.extractedImages.length > 0
      ? result.extractedImages
      : [result.path];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title: input.title || deriveTitleFromFile(file),
      caption: input.caption ?? null,
      category: input.category ?? null,
      tags: input.tags ?? [],
      media_paths: media,
      image_path: media[0] ?? null,
      on_explore: input.onExplore ?? true,
    })
    .select("*")
    .maybeSingle();

  if (error || !data) throw error ?? new Error("Failed to save work");
  return { post: data, upload: result };
}

export async function setPostOnExplore(postId: string, on: boolean) {
  await supabase.from("posts").update({ on_explore: on }).eq("id", postId);
}

export async function listMyWork(): Promise<PostRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function listExploreWork(limit = 30): Promise<PostRow[]> {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("on_explore", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return filterOutBlocked(data ?? [], (p) => p.author_id);
}

export async function listWorkByUser(userId: string): Promise<PostRow[]> {
  if (!userId) return [];
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  return filterOutBlocked(data ?? [], (p) => p.author_id);
}

/** Resolve the cover image URL for a post (first media item). */
export function postCoverUrl(post: Pick<PostRow, "image_path" | "media_paths">): string | null {
  const first = post.image_path ?? post.media_paths?.[0] ?? null;
  return workPublicUrl(first);
}
