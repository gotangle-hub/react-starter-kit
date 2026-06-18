import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Compass, Heart, MessageCircle, MoreHorizontal, Plus } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { PromotedTag } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Meta } from "@/components/brand/atoms";
import { rankItems, logInteraction } from "@/services/feed";
import { listExploreWork, postCoverUrl, type PostRow } from "@/services/work";
import { getProfilesByIds, makerFromProfile } from "@/services/profile";
import { countCommentsForPosts } from "@/services/comments";
import { cn } from "@/lib/utils";
import type { Maker } from "@/lib/profile-shape";

/**
 * 22/23 · Explore (G2, G3, G6, G7). Edge-to-edge personalised feed with NO
 * chrome, built from real published work. Tapping reveals overlay controls.
 */
export default function Explore() {
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);
  const [index, setIndex] = useState(0);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [makers, setMakers] = useState<Map<string, Maker>>(new Map());
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    (async () => {
      const real = await listExploreWork(40);
      const ranked = await rankItems(
        "posts",
        real.map((p) => ({
          id: p.id,
          category: p.category,
          promoted: p.promoted ?? false,
          base_score: 0,
        })),
      );
      const byId = new Map(real.map((p) => [p.id, p]));
      const ordered = ranked.map((r) => byId.get(r.id)).filter(Boolean) as PostRow[];
      setPosts(ordered);

      const profiles = await getProfilesByIds(ordered.map((p) => p.author_id));
      const m = new Map<string, Maker>();
      profiles.forEach((row, id) => m.set(id, makerFromProfile(row) as Maker));
      setMakers(m);

      const c = await countCommentsForPosts(ordered.map((p) => p.id));
      setCounts(c);
    })();
  }, []);

  const post = posts[index];
  const maker = post ? makers.get(post.author_id) : undefined;
  const cover = post ? postCoverUrl(post) : null;

  useEffect(() => {
    if (post) logInteraction({ target_kind: "post", target_id: post.id, kind: "view", category: post.category ?? undefined });
  }, [post]);

  if (!post) {
    return (
      <MobileShell footer={<AppTabBar />} className="bg-tg-feed-bg">
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
            <Compass size={22} />
          </span>
          <h2 className="mt-4 font-serif text-[20px] font-medium tracking-[-0.01em] text-tg-ink">Nothing in Explore yet</h2>
          <Meta className="mt-1.5 block max-w-[260px]">When designers publish work to Explore, it appears here ranked for you.</Meta>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell footer={<AppTabBar />} className="bg-tg-feed-bg">
      <div className="relative min-h-0 flex-1">
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          className="absolute inset-0 h-full w-full"
          style={{
            backgroundImage: cover ? `url(${cover})` : undefined,
            backgroundColor: cover ? undefined : "var(--tg-ink)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-label="Reveal controls"
        />

        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex flex-col justify-between transition-opacity duration-base",
            revealed ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="bg-gradient-to-b from-black/45 to-transparent p-4 pt-6">
            <div className="pointer-events-auto flex items-center gap-2.5">
              {maker && <Avatar maker={maker} size={36} ring />}
              <div className="flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="font-display text-[14px] font-semibold text-white">{maker?.name ?? "Member"}</span>
                  {maker?.verified && <VerifiedBadge size={15} />}
                </span>
                <span className="font-mono text-[11px] text-white/70">
                  {[post.category, post.place, post.year].filter(Boolean).join(" · ")}
                </span>
              </div>
              {post.promoted && <PromotedTag />}
              <button type="button" className="text-white" aria-label="More" onClick={() => navigate("/post-menu")}>
                <MoreHorizontal size={22} />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-t from-black/55 to-transparent p-4 pb-5">
            <button
              type="button"
              onClick={() => navigate("/project/" + post.id)}
              className="pointer-events-auto block text-left font-serif text-[26px] font-medium leading-tight tracking-[-0.02em] text-white"
            >
              {post.title}
            </button>
            <div className="pointer-events-auto mt-3 flex items-center gap-5 text-white">
              <Action icon={<Heart size={22} />} count={0} />
              <Action icon={<MessageCircle size={22} />} count={counts.get(post.id) ?? 0} onClick={() => navigate("/project/" + post.id)} />
              <Action icon={<Bookmark size={22} />} count={0} onClick={() => navigate("/pin")} />
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => navigate("/project/" + post.id)}
                className="rounded-pill bg-white px-4 py-2 font-display text-[13px] font-semibold text-tg-ink"
              >
                Open project
              </button>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {posts.map((_, i) => (
            <span
              key={i}
              className={cn("h-1 rounded-pill transition-all", i === index ? "w-5 bg-white" : "w-1 bg-white/40")}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Next"
          onClick={() => {
            setIndex((i) => (i + 1) % posts.length);
            setRevealed(false);
          }}
          className="absolute bottom-16 right-4 flex h-11 w-11 items-center justify-center rounded-pill bg-white/15 text-white backdrop-blur"
        >
          <Plus size={20} className="rotate-45" />
        </button>
      </div>
    </MobileShell>
  );
}

function Action({
  icon,
  count,
  onClick,
}: {
  icon: React.ReactNode;
  count: number;
  onClick?: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5">
      {icon}
      <span className="font-display text-[13px] font-semibold">{count}</span>
    </button>
  );
}
