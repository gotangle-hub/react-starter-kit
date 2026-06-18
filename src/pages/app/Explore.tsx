import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Plus } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { PromotedTag } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { feed, makerById, posts as fixturePosts, type Maker, type Post } from "@/lib/fixtures";
import { rankItems, logInteraction } from "@/services/feed";
import { listExploreWork, postCoverUrl } from "@/services/work";
import { getProfilesByIds, makerFromProfile } from "@/services/profile";
import { cn } from "@/lib/utils";

/**
 * 22/23 · Explore (G2, G3, G6, G7). Edge-to-edge personalised feed with NO chrome.
 * Tapping reveals overlay controls (save/pin, follow, comment, open, menu); tap
 * again hides them. Strong work breaks out via G3; boosted work woven in (G6).
 */
export default function Explore() {
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);
  const [index, setIndex] = useState(0);
  const [posts, setPosts] = useState<Post[]>(fixturePosts);
  const [realMakers, setRealMakers] = useState<Map<string, Maker & { avatarUrl?: string }>>(new Map());
  useEffect(() => {
    (async () => {
      // Pull real published work first, then fall back to fixtures so the feed
      // is never empty for new accounts.
      const real = await listExploreWork(30);
      const realAsPosts: Post[] = [];
      for (const p of real) {
        const img = postCoverUrl(p);
        if (!img) continue;
        realAsPosts.push({
          id: p.id,
          maker: p.author_id,
          img,
          title: p.title,
          cat: p.category ?? "",
          year: p.year ?? new Date(p.created_at).getFullYear(),
          place: p.place ?? "",
          likes: 0,
          comments: 0,
          saves: 0,
          usedIn: p.caption ?? "",
          promoted: p.promoted ?? false,
        });
      }

      // Resolve real author profiles so the overlay shows the actual maker
      // name + avatar (G14 — no fixture stand-ins for real posts).
      const profiles = await getProfilesByIds(realAsPosts.map((p) => p.maker));
      const m = new Map<string, Maker & { avatarUrl?: string }>();
      profiles.forEach((row, id) => {
        const mk = makerFromProfile(row);
        m.set(id, { ...mk, skills: row.disciplines ?? [], city: row.location ?? "" });
      });
      setRealMakers(m);

      const merged = [...realAsPosts, ...fixturePosts];
      const ranked = await rankItems(
        "posts",
        merged.map((p) => ({
          id: p.id,
          category: p.cat,
          promoted: p.promoted,
          base_score: p.likes + p.saves * 2,
        })),
      );
      const byId = new Map(merged.map((p) => [p.id, p]));
      setPosts(ranked.map((r) => byId.get(r.id)!).filter(Boolean));
    })();
  }, []);
  const post = posts[index] ?? fixturePosts[0];
  const maker = realMakers.get(post.maker) ?? makerById(post.maker);
  useEffect(() => {
    logInteraction({ target_kind: "post", target_id: post.id, kind: "view", category: post.cat });
  }, [post.id, post.cat]);

  return (
    <MobileShell footer={<AppTabBar />} className="bg-tg-feed-bg">
      <div className="relative min-h-0 flex-1">
        {/* The work, full bleed */}
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          className="absolute inset-0 h-full w-full"
          style={{
            backgroundImage: `url(${feed(post.img)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-label="Reveal controls"
        />

        {/* Overlay controls */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex flex-col justify-between transition-opacity duration-base",
            revealed ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="bg-gradient-to-b from-black/45 to-transparent p-4 pt-6">
            <div className="pointer-events-auto flex items-center gap-2.5">
              <Avatar maker={maker} size={36} ring />
              <div className="flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="font-display text-[14px] font-semibold text-white">{maker.name}</span>
                  {maker.verified && <VerifiedBadge size={15} />}
                </span>
                <span className="font-mono text-[11px] text-white/70">
                  {post.cat} · {post.place} · {post.year}
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
              <Action icon={<Heart size={22} />} count={post.likes} />
              <Action icon={<MessageCircle size={22} />} count={post.comments} onClick={() => navigate("/project/" + post.id)} />
              <Action icon={<Bookmark size={22} />} count={post.saves} onClick={() => navigate("/pin")} />
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

        {/* Next/prev affordance — tap the side rails (kept subtle) */}
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
