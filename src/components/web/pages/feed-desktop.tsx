import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Heart, ImageIcon, MessageCircle, MoreHorizontal, Send } from "lucide-react";

import { WebPage } from "@/components/web/web-page";
import { RightRail } from "@/components/web/right-rail";
import { Avatar } from "@/components/brand/avatar";
import { Meta, NameRow } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { rankItems } from "@/services/feed";
import { listExploreWork, postCoverUrl, type PostRow } from "@/services/work";
import {
  getMyProfile,
  listProfiles,
  makerFromProfile,
  type ProfileRow,
} from "@/services/profile";
import type { Maker } from "@/lib/profile-shape";
import { routes } from "@/lib/routes";

/**
 * Desktop Feed — Tangle Web reference layout (`web.jsx` → `WebFeed` +
 * `WebPostCard`). Centered ~600px column of large work cards, composer at
 * top, right rail to the side (handled by `WebPage`'s `rail` slot).
 *
 * Data: real `posts` via `listExploreWork`, ranked through the existing feed
 * service. Same data plumbing as the mobile Home — no parallel logic.
 */
export function FeedDesktop() {
  const navigate = useNavigate();
  const [me, setMe] = useState<ProfileRow | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [makers, setMakers] = useState<Map<string, Maker>>(new Map());

  useEffect(() => {
    let alive = true;
    (async () => {
      const [profile, work, peers] = await Promise.all([
        getMyProfile(),
        listExploreWork(20),
        listProfiles({ limit: 24, excludeSelf: true }),
      ]);
      if (!alive) return;
      setMe(profile);
      const peerMap = new Map(peers.map((p) => [p.id, makerFromProfile(p) as Maker]));
      setMakers(peerMap);
      const ranked = await rankItems(
        "posts",
        work.map((w) => ({ id: w.id, category: w.discipline ?? "general", base_score: 0 })),
      );
      const byId = new Map(work.map((w) => [w.id, w]));
      setPosts(ranked.map((r) => byId.get(r.id)).filter(Boolean) as PostRow[]);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const meMaker = me ? (makerFromProfile(me) as Maker) : null;

  return (
    <WebPage rail={<RightRail />} maxWidth={1000}>
      {/* Composer */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-tg-line bg-tg-bg p-3.5">
        {meMaker ? (
          <Avatar maker={meMaker} size={44} />
        ) : (
          <div className="h-11 w-11 flex-none rounded-full bg-tg-stone2" />
        )}
        <div className="flex-1 text-[15px] text-tg-brown-soft">Share a piece of work…</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(routes.addWork)}
          className="gap-1.5"
        >
          <ImageIcon size={16} />
          Upload
        </Button>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-tg-line p-12 text-center">
          <Meta className="block">
            Nothing surfaced for you yet. As makers add work, your feed will fill in.
          </Meta>
        </div>
      ) : (
        posts.map((p) => {
          const maker = makers.get(p.author_id) ?? null;
          const cover = postCoverUrl(p);
          return (
            <article
              key={p.id}
              className="mb-6 overflow-hidden rounded-2xl border border-tg-line bg-tg-bg"
            >
              {/* Header */}
              <header className="flex items-center gap-3 px-4 py-3.5">
                {maker ? (
                  <Avatar maker={maker} size={42} />
                ) : (
                  <div className="h-[42px] w-[42px] flex-none rounded-full bg-tg-stone2" />
                )}
                <div className="min-w-0 flex-1">
                  {maker ? <NameRow maker={maker} size={14.5} /> : <div className="h-4" />}
                  {maker && (
                    <Meta className="mt-0.5 block">
                      {maker.role}
                      {maker.city ? ` · ${maker.city}` : ""}
                    </Meta>
                  )}
                </div>
                <Button variant="outlineAccent" size="sm">
                  Connect
                </Button>
                <button className="text-tg-brown" aria-label="More">
                  <MoreHorizontal size={20} />
                </button>
              </header>

              {/* Media */}
              <button
                type="button"
                onClick={() => navigate(`/project/${p.id}`)}
                className="relative block h-[420px] w-full overflow-hidden bg-tg-stone2"
              >
                {cover ? (
                  <img
                    src={cover}
                    alt={p.title ?? ""}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-10 text-center font-serif text-[34px] leading-tight text-tg-brown">
                    {p.title}
                  </div>
                )}
                {p.category && (
                  <span className="absolute left-3.5 top-3.5 rounded-full bg-tg-ink/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-white">
                    {p.category}
                  </span>
                )}
              </button>

              {/* Actions + caption */}
              <div className="px-4 pb-4 pt-3.5">
                <div className="flex items-center gap-5">
                  <button className="inline-flex items-center gap-1.5 text-tg-ink" aria-label="Like">
                    <Heart size={22} />
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 text-tg-ink"
                    aria-label="Comment"
                    onClick={() => navigate(`/project/${p.id}/comments`)}
                  >
                    <MessageCircle size={22} />
                  </button>
                  <button className="text-tg-ink" aria-label="Share">
                    <Send size={21} />
                  </button>
                  <button className="ml-auto text-tg-ink" aria-label="Save">
                    <Bookmark size={22} />
                  </button>
                </div>
                {p.title && (
                  <div className="mt-3.5 font-serif text-[20px] leading-tight tracking-[-0.01em]">
                    {p.title}
                  </div>
                )}
                {p.caption && (
                  <p className="mt-2 text-[14px] leading-[1.55] text-tg-brown">{p.caption}</p>
                )}
              </div>
            </article>
          );
        })
      )}
    </WebPage>
  );
}
