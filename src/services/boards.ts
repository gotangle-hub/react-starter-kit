/**
 * Pin-ups (boards) persistence. Saves stay in `interactions(kind='save'|'pin')`;
 * this service owns the user-created board collections that work can be pinned to.
 */
import { supabase } from "@/integrations/supabase/client";

export type Board = {
  id: string;
  owner_id: string;
  title: string;
  cover_path: string | null;
  is_private: boolean;
  created_at: string;
  item_count?: number;
};

export type BoardItem = {
  id: string;
  board_id: string;
  post_id: string;
  added_at: string;
};

export async function listMyBoards(): Promise<Board[]> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return [];
  const { data, error } = await supabase
    .from("boards")
    .select("id, owner_id, title, cover_path, is_private, created_at, board_items(count)")
    .eq("owner_id", uid)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[boards] list", error.message);
    return [];
  }
  return (data ?? []).map((b: any) => ({
    id: b.id,
    owner_id: b.owner_id,
    title: b.title,
    cover_path: b.cover_path,
    is_private: b.is_private,
    created_at: b.created_at,
    item_count: b.board_items?.[0]?.count ?? 0,
  }));
}

export async function createBoard(input: {
  title: string;
  is_private?: boolean;
  cover_path?: string | null;
}): Promise<Board | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase
    .from("boards")
    .insert({
      owner_id: uid,
      title: input.title.trim() || "Untitled",
      is_private: input.is_private ?? false,
      cover_path: input.cover_path ?? null,
    })
    .select("id, owner_id, title, cover_path, is_private, created_at")
    .single();
  if (error) {
    console.warn("[boards] create", error.message);
    return null;
  }
  return data as Board;
}

export async function addPostToBoard(board_id: string, post_id: string): Promise<boolean> {
  const { error } = await supabase
    .from("board_items")
    .upsert({ board_id, post_id }, { onConflict: "board_id,post_id" });
  if (error) {
    console.warn("[boards] add item", error.message);
    return false;
  }
  return true;
}

export async function removePostFromBoard(board_id: string, post_id: string): Promise<boolean> {
  const { error } = await supabase
    .from("board_items")
    .delete()
    .eq("board_id", board_id)
    .eq("post_id", post_id);
  if (error) {
    console.warn("[boards] remove item", error.message);
    return false;
  }
  return true;
}

export async function listBoardItems(board_id: string): Promise<BoardItem[]> {
  const { data, error } = await supabase
    .from("board_items")
    .select("id, board_id, post_id, added_at")
    .eq("board_id", board_id)
    .order("added_at", { ascending: false });
  if (error) {
    console.warn("[boards] items", error.message);
    return [];
  }
  return (data ?? []) as BoardItem[];
}

export async function deleteBoard(board_id: string): Promise<boolean> {
  const { error } = await supabase.from("boards").delete().eq("id", board_id);
  if (error) {
    console.warn("[boards] delete", error.message);
    return false;
  }
  return true;
}
