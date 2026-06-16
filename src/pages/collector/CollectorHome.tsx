import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { RefreshHint } from "@/components/app/bits";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/brand/avatar";
import { Pill, PhotoTile } from "@/components/brand/atoms";
import { feed, me, works } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

const CATS = ["For you", "Architecture", "Type", "Ceramics", "Textiles", "Product"];
const HEIGHTS = [150, 200, 170, 230, 160, 210, 180, 190];

/** 11 · Discover (collector) — personalised masonry feed (G2, G3, G6, G7). */
export default function CollectorHome() {
  const navigate = useNavigate();
  const [cat, setCat] = useState("For you");
  const feedWorks = [...works, ...works];

  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="flex flex-none items-center justify-between px-5 pt-2">
        <Logo size={23} />
        <div className="flex items-center gap-3.5">
          <button type="button" aria-label="Notifications"><Bell size={21} className="text-tg-ink" /></button>
          <button type="button" onClick={() => navigate(routes.collectorProfile)} aria-label="Your profile">
            <Avatar maker={me} size={30} />
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
        <div className="[column-gap:10px]" style={{ columnCount: 2 }}>
          {feedWorks.map((w, i) => (
            <button
              key={i}
              type="button"
              onClick={() => navigate(`/project/${w.id}`)}
              className="mb-2.5 block w-full break-inside-avoid overflow-hidden rounded-lg"
            >
              <PhotoTile
                width="100%"
                height={HEIGHTS[i % HEIGHTS.length]}
                img={w.img ? feed(w.img) : undefined}
                swatch={w.swatch ?? "#E7DDCB"}
                label={w.title}
                radius={12}
              />
            </button>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
