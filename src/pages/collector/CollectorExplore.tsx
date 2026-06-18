import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Compass, MoreHorizontal, Plus, UserPlus } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { Avatar } from "@/components/brand/avatar";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Meta } from "@/components/brand/atoms";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { listExploreWork, postCoverUrl, type PostRow } from "@/services/work";
import { getProfilesByIds, makerFromProfile } from "@/services/profile";
import type { Maker } from "@/lib/profile-shape";

/**
 * 12/13 · Explore (collector). Edge-to-edge real feed; tapping reveals controls.
 */
export default function CollectorExplore() {
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);
  const [index, setIndex] = useState(0);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [makers, setMakers] = useState<Map<string, Maker>>(new Map());

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await listExploreWork(30);
      if (!alive) return;
      setPosts(list);
      const profiles = await getProfilesByIds(list.map((p) => p.author_id));
      if (!alive) return;
      const m = new Map<string, Maker>();
      profiles.forEach((row, id) => m.set(id, makerFromProfile(row) as Maker));
      setMakers(m);
    })();
    return () => { alive = false; };
  }, []);

  const post = posts[index];
  const maker = post ? makers.get(post.author_id) : undefined;
  const cover = post ? postCoverUrl(post) : null;

  if (!post) {
    return (
      <MobileShell footer={<AppTabBar />} className="bg-tg-feed-bg">
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
            <Compass size={22} />
          </span>
          <h2 className="mt-4 font-serif text-[20px] font-medium tracking-[-0.01em] text-tg-ink">Nothing in Explore yet</h2>
          <Meta className="mt-1.5 block max-w-[260px]">When designers publish work to Explore, you&rsquo;ll see it here.</Meta>
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
          style={{ backgroundImage: cover ? `url(${cover})` : undefined, backgroundColor: cover ? undefined : "var(--tg-ink)", backgroundSize: "cover", backgroundPosition: "center" }}
          aria-label="Reveal controls"
        />

        <div className={cn("pointer-events-none absolute inset-0 flex flex-col justify-between transition-opacity duration-base", revealed ? "opacity-100" : "opacity-0")}>
          <div className="bg-gradient-to-b from-black/45 to-transparent p-4 pt-6">
            <div className="pointer-events-auto flex items-center gap-2.5">
              {maker && <Avatar maker={maker} size={36} ring />}
              <div className="flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="font-display text-[14px] font-semibold text-white">{maker?.name ?? "Member"}</span>
                  {maker?.verified && <VerifiedBadge size={15} />}
                </span>
                <span className="font-mono text-[11px] text-white/70">{[post.category, post.place].filter(Boolean).join(" · ")}</span>
              </div>
              <button type="button" className="text-white" aria-label="More" onClick={() => navigate(routes.postMenu)}>
                <MoreHorizontal size={22} />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-t from-black/55 to-transparent p-4 pb-5">
            <div className="font-serif text-[24px] font-medium leading-tight tracking-[-0.02em] text-white">{post.title}</div>
            <div className="pointer-events-auto mt-3 flex items-center gap-2.5">
              <button type="button" onClick={() => navigate(routes.followConfirm)} className="flex items-center gap-2 rounded-pill bg-white/15 px-4 py-2.5 font-display text-[13px] font-semibold text-white backdrop-blur">
                <UserPlus size={16} />
                Follow
              </button>
              <button type="button" onClick={() => navigate(routes.collectorSaved)} className="flex items-center gap-2 rounded-pill bg-white px-4 py-2.5 font-display text-[13px] font-semibold text-tg-ink">
                <Bookmark size={16} />
                Save
              </button>
              <span className="flex-1" />
              <button type="button" onClick={() => navigate(`/project/${post.id}`)} className="rounded-pill bg-white/15 px-4 py-2.5 font-display text-[13px] font-semibold text-white backdrop-blur">
                Open
              </button>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {posts.map((_, i) => (
            <span key={i} className={cn("h-1 rounded-pill transition-all", i === index ? "w-5 bg-white" : "w-1 bg-white/40")} />
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
