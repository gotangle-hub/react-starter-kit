import { supabase } from "@/integrations/supabase/client";
import { getProfilesByIds, type ProfileRow } from "@/services/profile";

export interface ConversationSummary {
  conversationId: string;
  isGroup: boolean;
  otherUserId: string | null;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  lastReadAt: string;
  other: ProfileRow | null;
  unread: boolean;
}

export interface DmMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

/** Find or create the 1:1 DM conversation between me and the given user. */
export async function ensureDmConversation(otherUserId: string): Promise<string> {
  const { data, error } = await supabase.rpc("ensure_dm_conversation", { _other: otherUserId });
  if (error) throw error;
  return data as string;
}

export async function listMyConversations(): Promise<ConversationSummary[]> {
  const { data, error } = await supabase.rpc("list_my_conversations");
  if (error || !data) return [];
  const rows = data as Array<{
    conversation_id: string;
    is_group: boolean;
    other_user_id: string | null;
    last_message_at: string;
    last_message_preview: string | null;
    last_read_at: string;
  }>;
  const otherIds = rows.map((r) => r.other_user_id).filter((x): x is string => !!x);
  const profiles = await getProfilesByIds(otherIds);
  return rows.map((r) => ({
    conversationId: r.conversation_id,
    isGroup: r.is_group,
    otherUserId: r.other_user_id,
    lastMessageAt: r.last_message_at,
    lastMessagePreview: r.last_message_preview,
    lastReadAt: r.last_read_at,
    other: r.other_user_id ? profiles.get(r.other_user_id) ?? null : null,
    unread: !!r.last_message_preview && new Date(r.last_message_at) > new Date(r.last_read_at),
  }));
}

export async function listMessages(conversationId: string): Promise<DmMessage[]> {
  if (!conversationId) return [];
  const { data } = await supabase
    .from("dm_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return (data as DmMessage[] | null) ?? [];
}

export async function sendMessage(conversationId: string, body: string): Promise<DmMessage | null> {
  const trimmed = body.trim();
  if (!trimmed) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("dm_messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, body: trimmed })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return (data as DmMessage | null) ?? null;
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);
}
