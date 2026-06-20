import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Heart, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";

import { WebPage } from "@/components/web/web-page";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta, PhotoTile } from "@/components/brand/atoms";
import { Chip } from "@/components/brand/chip";
import { Button } from "@/components/ui/button";
import { countCommentsForPost } from "@/services/comments";
import { supabase } from "@/integrations/supabase/client";
import { getProfileById, makerFromProfile } from "@/services/profile";
import { postCoverUrl, type PostRow } from "@/services/work";
import { logInteraction } from "@/services/feed";
import { TrendingBadge } from "@/components/brand/trending-badge";
import type { Maker } from "@/lib/profile-shape";

export function ProjectDetailDesktop() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState<PostRow | null>(null);
  const [maker, setMaker] = useState<Maker | null>(null);
  const [commentCount, setCommentCount] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
      if (!alive) return;
      const row = (data as PostRow | null) ?? null;
      setPost(row);
      if (row?.author_id) {
        const profile = await getProfileById(row.author_id);
        if (alive && profile) setMaker(makerFromProfile(profile) as Maker);
      }
      if (row) logInteraction({ target_kind: "post", target_id: row.id, kind: "view", category: row.category ?? undefined });
    })();
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    countCommentsForPost(id).then((n) => { if (alive) setCommentCount(n); });
    const channel = supabase
      .channel(`comments-count:${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${id}` },
        () => { countCommentsForPost(id).then((n) => { if (alive) setCommentCount(n); }); })
      .subscribe();
    return () => { alive = false; supabase.removeChannel(channel); };
  }, [id]);

  if (!post) {
    return (
      <WebPage maxWidth={1100}>
        <div className="py-24 text-center"><Meta>This project is no longer available.</Meta></div>
      </WebPage>
    );
  }

  const cover = postCoverUrl(post);

  return (
    <WebPage maxWidth={1180} pad="32px">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-tg-card text-tg-ink shadow-card"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex gap-2">
          <button type="button" aria-label="Share" className="flex h-9 w-9 items-center justify-center rounded-full bg-tg-card text-tg-ink shadow-card">
            <Share2 size={16} />
          </button>
          <button type="button" aria-label="More" onClick={() => navigate("/post-menu")} className="flex h-9 w-9 items-center justify-center rounded-full bg-tg-card text-tg-ink shadow-card">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 min-[1000px]:grid-cols-[1fr_360px]">
        {/* Media */}
        <div className="overflow-hidden rounded-2xl border border-tg-line bg-tg-stone2">
          <PhotoTile width="100%" height={620} img={cover ?? undefined} swatch="#161514" />
        </div>

        {/* Side panel */}
        <aside className="flex min-w-0 flex-col gap-5">
          {post.category && <Chip>{post.category}</Chip>}
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.02em] text-tg-ink">
              {post.title}
            </h1>
            <TrendingBadge tier={post.reach_tier} className="mt-1.5 flex-none" />
          </div>
          <Meta className="block">{[post.place, post.year].filter(Boolean).join(" · ")}</Meta>

          {maker && (
            <button
              type="button"
              onClick={() => navigate("/u/" + (maker.handle ?? maker.id))}
              className="flex w-full items-center gap-3 rounded-xl border border-tg-line bg-tg-card p-3 text-left"
            >
              <Avatar maker={maker} size={44} />
              <div className="flex-1">
                <NameRow maker={maker} size={14.5} />
                <Meta className="mt-0.5 block">{maker.role}{maker.city ? ` · ${maker.city}` : ""}</Meta>
              </div>
              <Button variant="outline" size="sm">Follow</Button>
            </button>
          )}

          {post.caption && (
            <p className="font-body text-[15.5px] leading-relaxed text-tg-ink">{post.caption}</p>
          )}

          <div className="flex items-center gap-3 border-t border-tg-line pt-4">
            <button type="button" className="flex items-center gap-1.5 text-tg-ink" aria-label="Like">
              <Heart size={20} />
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 text-tg-ink"
              onClick={() => navigate("/project/" + post.id + "/comments")}
            >
              <MessageCircle size={20} />
              <span className="font-display text-[13px] font-semibold">{commentCount}</span>
            </button>
            <button type="button" className="flex items-center gap-1.5 text-tg-ink" onClick={() => navigate("/pin")} aria-label="Pin">
              <Bookmark size={20} />
            </button>
            <span className="flex-1" />
            <Button size="sm" onClick={() => navigate("/request")}>Connect</Button>
          </div>
        </aside>
      </div>
    </WebPage>
  );
}
