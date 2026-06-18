import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Compass } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { RefreshHint } from "@/components/app/bits";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/brand/avatar";
import { Pill, PhotoTile, Meta } from "@/components/brand/atoms";
import { routes } from "@/lib/routes";
import { listExploreWork, postCoverUrl, type PostRow } from "@/services/work";
import { getMyProfile, makerFromProfile, type ProfileRow } from "@/services/profile";
import type { Maker } from "@/lib/profile-shape";

const CATS = ["For you", "Architecture", "Type", "Ceramics", "Textiles", "Product"];
const HEIGHTS = [150, 200, 170, 230, 160, 210, 180, 190];

/** 11 · Discover (collector) — personalised masonry feed (G2, G3, G6, G7). */
export default function CollectorHome() {
  const navigate = useNavigate();
  const [cat, setCat] = useState("For you");
  const [me, setMe] = useState<Maker | null>(null);
  const [works, setWorks] = useState<PostRow[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [profile, list] = await Promise.all([getMyProfile(), listExploreWork(40)]);
      if (!alive) return;
      setMe(profile ? (makerFromProfile(profile as ProfileRow) as Maker) : null);
      setWorks(list);
    })();
    return () => { alive = false; };
  }, []);

  const filtered = cat === "For you" ? works : works.filter((w) => (w.category ?? "").toLowerCase() === cat.toLowerCase());

  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="flex flex-none items-center justify-between px-5 pt-2">
        <Logo size={23} />
        <div className="flex items-center gap-3.5">
          <button type="button" aria-label="Notifications"><Bell size={21} className="text-tg-ink" /></button>
          <button type="button" onClick={() => navigate(routes.collectorProfile)} aria-label="Your profile">
            {me ? (
              <Avatar maker={me} size={30} />
            ) : (
              <span className="inline-block h-[30px] w-[30px] rounded-pill bg-tg-stone2" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-none gap-2 overflow-x-auto px-5 py-3">
        {CATS.map((c) => (
          <Pill key={c} small on={cat === c} onClick={() => setCat(c)}>{c}</Pill>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <RefreshHint />
        {filtered.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
              <Compass size={22} />
            </span>
            <h2 className="mt-4 font-serif text-[20px] font-medium tracking-[-0.01em]">Nothing here yet</h2>
            <Meta className="mt-1.5 block max-w-[260px]">As designers publish work, it appears here ranked for you.</Meta>
          </div>
        ) : (
          <div className="[column-gap:10px]" style={{ columnCount: 2 }}>
            {filtered.map((w, i) => {
              const cover = postCoverUrl(w);
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => navigate(`/project/${w.id}`)}
                  className="mb-2.5 block w-full break-inside-avoid overflow-hidden rounded-lg"
                >
                  <PhotoTile
                    width="100%"
                    height={HEIGHTS[i % HEIGHTS.length]}
                    img={cover ?? undefined}
                    swatch="#E7DDCB"
                    label={w.title}
                    radius={12}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
