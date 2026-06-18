import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Heart, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta, PhotoTile } from "@/components/brand/atoms";
import { Chip } from "@/components/brand/chip";
import { Button } from "@/components/ui/button";
import { countCommentsForPost } from "@/services/comments";
import { supabase } from "@/integrations/supabase/client";
import { getProfileById, makerFromProfile } from "@/services/profile";
import { postCoverUrl, type PostRow } from "@/services/work";
import type { Maker } from "@/lib/profile-shape";

/** 24 · Project detail (G3). Full project from real data — images, title, maker, credits, caption. */
export default function ProjectDetail() {
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
    })();
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    countCommentsForPost(id).then((n) => { if (alive) setCommentCount(n); });
    const channel = supabase
      .channel(`comments-count:${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${id}` },
        () => { countCommentsForPost(id).then((n) => { if (alive) setCommentCount(n); }); },
      )
      .subscribe();
    return () => { alive = false; supabase.removeChannel(channel); };
  }, [id]);

  if (!post) {
    return (
      <MobileShell>
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <Meta>This project is no longer available.</Meta>
        </div>
      </MobileShell>
    );
  }

  const cover = postCoverUrl(post);

  return (
    <MobileShell
      footer={
        <div className="flex flex-none items-center gap-4 border-t border-tg-line px-[18px] py-3">
          <button type="button" className="flex items-center gap-1.5 text-tg-ink">
            <Heart size={22} />
          </button>
          <button type="button" className="flex items-center gap-1.5 text-tg-ink" onClick={() => navigate("/project/" + post.id + "/comments")}>
            <MessageCircle size={22} />
            <span className="font-display text-[13px] font-semibold">{commentCount}</span>
          </button>
          <button type="button" className="flex items-center gap-1.5 text-tg-ink" onClick={() => navigate("/pin")}>
            <Bookmark size={22} />
          </button>
          <span className="flex-1" />
          <Button size="sm" onClick={() => navigate("/request")}>Connect</Button>
        </div>
      }
    >
      <div className="relative">
        <PhotoTile width="100%" height={420} img={cover ?? undefined} swatch="#161514" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-pill bg-black/35 text-white backdrop-blur">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button type="button" aria-label="Share" className="flex h-9 w-9 items-center justify-center rounded-pill bg-black/35 text-white backdrop-blur">
              <Share2 size={18} />
            </button>
            <button type="button" aria-label="More" onClick={() => navigate("/post-menu")} className="flex h-9 w-9 items-center justify-center rounded-pill bg-black/35 text-white backdrop-blur">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-[22px] py-5">
        {post.category && <Chip>{post.category}</Chip>}
        <h1 className="mt-3 font-serif text-[34px] font-medium leading-none tracking-[-0.025em]">{post.title}</h1>
        <Meta className="mt-2 block">{[post.place, post.year].filter(Boolean).join(" · ")}</Meta>

        {maker && (
          <button type="button" onClick={() => navigate("/u/" + (maker.handle ?? maker.id))} className="mt-4 flex w-full items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-3 text-left">
            <Avatar maker={maker} size={42} />
            <div className="flex-1">
              <NameRow maker={maker} size={14.5} />
              <Meta className="mt-0.5 block">{maker.role}{maker.city ? ` · ${maker.city}` : ""}</Meta>
            </div>
            <Button variant="outline" size="sm">Follow</Button>
          </button>
        )}

        {post.caption && (
          <p className="mt-5 font-body text-[15.5px] leading-relaxed text-tg-ink">{post.caption}</p>
        )}
      </div>
    </MobileShell>
  );
}
