import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";
import { BottomSheet } from "@/components/app/bottom-sheet";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { MentionInput, type MentionInputHandle } from "@/components/app/mention-input";
import { renderWithMentions } from "@/lib/mentions";
import { supabase } from "@/integrations/supabase/client";
import {
  addComment,
  listComments,
  type CommentWithAuthor,
} from "@/services/comments";
import { getMyProfile, makerFromProfile, type ProfileRow } from "@/services/profile";
import { logInteraction } from "@/services/feed";

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

/**
 * 25 · Comments (G8). Real comments via Supabase + realtime; keyboard stays
 * focused after send so users can keep typing (G8).
 */
export default function CommentsSheet() {
  const { id: postId } = useParams<{ id: string }>();
  const [list, setList] = useState<CommentWithAuthor[]>([]);
  const [text, setText] = useState("");
  const [meProfile, setMeProfile] = useState<ProfileRow | null>(null);
  const inputRef = useRef<MentionInputHandle>(null);

  useEffect(() => {
    if (!postId) return;
    let alive = true;
    (async () => {
      const [rows, mine] = await Promise.all([listComments(postId), getMyProfile()]);
      if (!alive) return;
      setList(rows);
      setMeProfile(mine);
    })();
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `post_id=eq.${postId}` },
        async () => {
          const fresh = await listComments(postId);
          if (alive) setList(fresh);
        },
      )
      .subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const send = async () => {
    const t = text.trim();
    if (!t || !postId) return;
    setText("");
    inputRef.current?.focus(); // G8 — keep keyboard open after send.
    try {
      await addComment(postId, t);
      logInteraction({ target_kind: "post", target_id: postId, kind: "comment" });
      // Realtime will refresh; also optimistically refetch in case channel is slow.
      const fresh = await listComments(postId);
      setList(fresh);
    } catch {
      setText(t);
    }
  };

  const meMaker = meProfile ? makerFromProfile(meProfile) : null;

  return (
    <BottomSheet title={list.length === 1 ? "1 comment" : `${list.length} comments`} full>
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
          {list.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
              <p className="font-display text-[15px] font-semibold text-tg-ink">No comments yet</p>
              <p className="mt-1 font-body text-[13px] text-tg-brown-soft">
                Be the first to leave one.
              </p>
            </div>
          ) : (
            list.map((c) => {
              const m = makerFromProfile(c.author);
              return (
                <div key={c.id} className="flex gap-3 py-3">
                  <Avatar maker={m} size={34} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <NameRow maker={m} size={13.5} showHandle />
                      <Meta>{timeAgo(c.created_at)}</Meta>
                    </div>
                    <p className="mt-0.5 font-body text-[14px] leading-snug text-tg-ink">{renderWithMentions(c.body)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex flex-none items-center gap-2.5 border-t border-tg-line px-4 py-3 pb-6">
          {meMaker && <Avatar maker={meMaker} size={32} />}
          <MentionInput
            ref={inputRef}
            value={text}
            onChange={setText}
            onSubmit={send}
            placeholder="Add a comment…"
            ariaLabel="Add a comment"
            className="w-full min-w-0 rounded-pill border border-tg-line bg-tg-card px-4 py-2.5 text-[14px] text-tg-ink outline-none placeholder:text-tg-brown-soft focus:border-tg-blue-accent"
          />
          <button
            type="button"
            onClick={send}
            onMouseDown={(e) => e.preventDefault()}
            disabled={!text.trim()}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-pill bg-tg-blue text-white disabled:opacity-40"
            aria-label="Send"
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
