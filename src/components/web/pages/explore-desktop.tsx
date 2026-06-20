import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Heart } from "lucide-react";

import { WebPage } from "@/components/web/web-page";
import { Meta } from "@/components/brand/atoms";
import { rankItems } from "@/services/feed";
import { listExploreWork, postCoverUrl, type PostRow } from "@/services/work";
import { getProfilesByIds, makerFromProfile } from "@/services/profile";
import type { Maker } from "@/lib/profile-shape";

/**
 * Desktop Explore (reference: `web.jsx` → `WebExplore`).
 * 3-column CSS-columns masonry of work covers with maker overlay on hover.
 */
export function ExploreDesktop() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [makers, setMakers] = useState<Map<string, Maker>>(new Map());

  useEffect(() => {
    let alive = true;
    (async () => {
      const real = await listExploreWork(60);
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
      if (!alive) return;
      setPosts(ordered);
      const profiles = await getProfilesByIds(ordered.map((p) => p.author_id));
      if (!alive) return;
      const m = new Map<string, Maker>();
      profiles.forEach((row, id) => m.set(id, makerFromProfile(row) as Maker));
      setMakers(m);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <WebPage maxWidth={1240}>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-[34px] leading-none tracking-[-0.02em]">Explore</h1>
          <Meta className="mt-1.5 block">Work surfaced for you, ranked by what you spend time on.</Meta>
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-tg-line p-16 text-center">
          <Meta>Nothing in Explore yet. As designers publish work, it appears here.</Meta>
        </div>
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 min-[1100px]:columns-3 [column-fill:_balance]">
          {posts.map((p) => {
            const cover = postCoverUrl(p);
            const maker = makers.get(p.author_id);
            // Vary heights for masonry feel
            const h = 260 + ((p.id.charCodeAt(0) ?? 0) % 5) * 60;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => navigate(`/project/${p.id}`)}
                className="group mb-5 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-tg-line bg-tg-card text-left"
              >
                <div
                  className="relative w-full overflow-hidden bg-tg-stone2"
                  style={{ height: h }}
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt={p.title ?? ""}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-6 text-center font-serif text-[26px] leading-tight text-tg-brown">
                      {p.title}
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center gap-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="truncate font-display text-[13px] font-semibold">
                      {maker?.name ?? "Maker"}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-3 text-white/90">
                      <Heart size={16} />
                      <Bookmark size={16} />
                    </span>
                  </div>
                </div>
                {p.title && (
                  <div className="px-3.5 py-3">
                    <div className="truncate font-serif text-[15px] tracking-[-0.01em] text-tg-ink">
                      {p.title}
                    </div>
                    {maker && (
                      <Meta className="mt-0.5 block truncate">{maker.name}</Meta>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </WebPage>
  );
}
