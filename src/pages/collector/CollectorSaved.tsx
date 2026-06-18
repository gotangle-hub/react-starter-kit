import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { RefreshHint } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { feedAsset as feed } from "@/lib/feed-asset";

/** 16 · Saved (collector) — saved work organised into collections (G7). */
const COLLECTIONS = [
  { name: "Quiet interiors", count: 34, imgs: ["spec-full.jpg", "spec-negative.jpg", "spec-handles.jpg"] },
  { name: "Type I love", count: 21, imgs: ["spec-negative.jpg", "spec-blades.jpg", "spec-full.jpg"] },
  { name: "Ceramics", count: 18, imgs: ["spec-handles.jpg", "spec-full.jpg", "spec-blades.jpg"] },
  { name: "Material studies", count: 12, imgs: ["spec-blades.jpg", "spec-handles.jpg", "spec-negative.jpg"] },
];

export default function CollectorSaved() {
  const navigate = useNavigate();
  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="flex flex-none items-center justify-between px-[22px] pb-1 pt-1.5">
        <div>
          <Meta>Your collections</Meta>
          <div className="mt-0.5 font-serif text-[26px] font-medium tracking-[-0.02em]">Saved</div>
        </div>
        <button type="button" aria-label="New collection" className="flex h-[38px] w-[38px] items-center justify-center rounded-pill bg-tg-emph">
          <Plus size={20} className="text-tg-emph-text" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4">
        <RefreshHint />
        <div className="grid grid-cols-2 gap-3.5">
          {COLLECTIONS.map((c) => (
            <button key={c.name} type="button" onClick={() => navigate(`/project/${c.imgs[0]}`)} className="text-left">
              <div className="grid h-[130px] grid-cols-[2fr_1fr] grid-rows-2 gap-[3px] overflow-hidden rounded-lg border border-tg-line">
                <span className="row-span-2 bg-cover bg-center" style={{ backgroundImage: `url(${feed(c.imgs[0])})` }} />
                <span className="bg-cover bg-center" style={{ backgroundImage: `url(${feed(c.imgs[1])})` }} />
                <span className="bg-cover bg-center" style={{ backgroundImage: `url(${feed(c.imgs[2])})` }} />
              </div>
              <div className="mt-2.5 font-display text-[14.5px] font-semibold">{c.name}</div>
              <Meta>{c.count} saved</Meta>
            </button>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
