import { useNavigate } from "react-router-dom";
import { ChevronRight, Folder, FolderPlus, Search } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { Meta } from "@/components/brand/atoms";
import { makers, studio } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

/** 16 · Talent pool (G4, G7). Searchable pool + shortlist folders/pipelines. */
const FOLDERS = [
  { name: "Pavilion shortlist", count: 6, tint: "var(--tg-blue)", faces: makers.slice(0, 3) },
  { name: "Type & lettering", count: 11, tint: "var(--tg-terra)", faces: makers.slice(1, 4) },
  { name: "Maybe — interiors", count: 4, tint: "var(--tg-purple)", faces: makers.slice(2, 5) },
];

export default function TalentPool() {
  const navigate = useNavigate();
  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="flex flex-none items-baseline justify-between px-[22px] pb-3 pt-2">
        <div>
          <Meta>Studio · {studio.name}</Meta>
          <div className="mt-0.5 font-serif text-[24px] font-medium tracking-[-0.02em]">Talent pool</div>
        </div>
        <button type="button" aria-label="New folder"><FolderPlus size={22} className="text-tg-ink" /></button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4">
        <RefreshHint />
        <button
          type="button"
          onClick={() => navigate(routes.searchPeople)}
          className="mb-3 flex w-full items-center gap-2.5 rounded-DEFAULT border border-tg-line bg-tg-stone2 px-3.5 py-3 text-left"
        >
          <Search size={17} className="text-tg-brown-soft" />
          <span className="text-[14px] text-tg-brown-soft">Search designers by discipline, city, availability…</span>
        </button>

        <div className="flex flex-col gap-3">
          {FOLDERS.map((f) => (
            <button key={f.name} type="button" onClick={() => navigate(routes.searchPeople)} className="rounded-lg border border-tg-line bg-tg-card p-4 text-left">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md" style={{ background: f.tint }}>
                  <Folder size={22} className="text-white" />
                </span>
                <div className="flex-1">
                  <div className="font-display text-[15.5px] font-semibold">{f.name}</div>
                  <Meta className="mt-0.5 block">{f.count} saved</Meta>
                </div>
                <ChevronRight size={20} className="text-tg-brown-soft" />
              </div>
              <div className="mt-3 flex items-center">
                {f.faces.map((m, i) => (
                  <span key={m.id} style={{ marginLeft: i ? -10 : 0 }}>
                    <Avatar maker={m} size={30} ring />
                  </span>
                ))}
                <span className="ml-2 font-mono text-[12px] text-tg-brown">+{f.count - f.faces.length} more</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
