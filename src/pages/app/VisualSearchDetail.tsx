import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Share2 } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta, PhotoTile } from "@/components/brand/atoms";
import { Chip } from "@/components/brand/chip";
import { Button } from "@/components/ui/button";
import { path, routes } from "@/lib/routes";
import { supabase } from "@/integrations/supabase/client";
import { getProfileById, makerFromProfile } from "@/services/profile";
import { postCoverUrl, listWorkByUser, type PostRow } from "@/services/work";
import type { Maker } from "@/lib/profile-shape";

/** 31 · Visual search result, enlarged (G4). Real post + creator. */
export default function VisualSearchDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState<PostRow | null>(null);
  const [maker, setMaker] = useState<Maker | null>(null);
  const [more, setMore] = useState<PostRow[]>([]);

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
        const others = await listWorkByUser(row.author_id);
        if (alive) setMore(others.filter((p) => p.id !== row.id).slice(0, 3));
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (!post) {
    return (
      <MobileShell>
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <Meta>This piece is no longer available.</Meta>
        </div>
      </MobileShell>
    );
  }

  const cover = postCoverUrl(post);

  return (
    <MobileShell
      footer={
        <div className="flex flex-none items-center gap-2.5 border-t border-tg-line px-[18px] py-3">
          <Button variant="outline" size="md" onClick={() => navigate("/pin")}>
            <Bookmark size={17} className="mr-1.5" />
            Save
          </Button>
          <span className="flex-1" />
          {maker && (
            <Button size="md" onClick={() => navigate(path(routes.publicProfile, { id: maker.handle ?? maker.id }))}>
              View creator
            </Button>
          )}
        </div>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="relative">
          <PhotoTile width="100%" height={420} img={cover ?? undefined} swatch="#161514" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="flex h-10 w-10 items-center justify-center rounded-pill bg-black/40 text-white backdrop-blur"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Share"
              className="flex h-10 w-10 items-center justify-center rounded-pill bg-black/40 text-white backdrop-blur"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        <div className="px-[22px] py-5">
          {post.category && <Chip>{post.category}</Chip>}
          <h1 className="mt-3 font-serif text-[26px] font-medium leading-tight tracking-[-0.02em]">
            {post.title}
          </h1>
          <Meta className="mt-2 block">
            {[post.category, post.place, post.year].filter(Boolean).join(" · ")}
          </Meta>

          {maker && (
            <button
              type="button"
              onClick={() => navigate(path(routes.publicProfile, { id: maker.handle ?? maker.id }))}
              className="mt-4 flex w-full items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-3.5 text-left"
            >
              <Avatar maker={maker} size={46} ring />
              <div className="min-w-0 flex-1">
                <NameRow maker={maker} size={15} />
                <Meta className="mt-0.5 block">
                  {maker.role}{maker.city ? ` · ${maker.city}` : ""}
                </Meta>
              </div>
              <Button variant="primary" size="sm">Connect</Button>
            </button>
          )}

          {more.length > 0 && maker && (
            <>
              <div className="mb-2.5 mt-6 flex items-baseline justify-between">
                <span className="font-display text-[13px] font-semibold text-tg-ink">
                  More from {maker.name.split(" ")[0]}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(path(routes.publicProfile, { id: maker.handle ?? maker.id }))}
                  className="font-mono text-[12px] tracking-meta text-tg-terra"
                >
                  View work
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {more.map((m) => (
                  <PhotoTile key={m.id} width="100%" height={92} radius={11} img={postCoverUrl(m) ?? undefined} swatch="#E7DDCB" />
                ))}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => navigate(path(routes.projectDetail, { id: post.id }))}
            className="mt-5 font-display text-[13.5px] font-semibold text-tg-terra"
          >
            Open project
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
