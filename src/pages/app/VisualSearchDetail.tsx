import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Share2 } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta, PhotoTile } from "@/components/brand/atoms";
import { Chip } from "@/components/brand/chip";
import { Button } from "@/components/ui/button";
import { feed, makers } from "@/lib/fixtures";
import { path, routes } from "@/lib/routes";

const IMGS = ["spec-full.jpg", "spec-handles.jpg", "spec-blades.jpg", "spec-negative.jpg"];
const TITLES = [
  "Bent ply lounge", "Steel stool, welded", "Rope seat study", "Oak dining chair",
  "Cast aluminium", "Woven back", "Stacking chair", "Cantilever frame",
  "Studio armchair", "Foam prototype", "Three leg stool", "Folding chair",
];
const CATS = ["Furniture", "Product", "Industrial", "Ceramics"];

/**
 * 31 · Visual search result, enlarged (G4). Big image, creator, category, and a
 * path to their profile or the project.
 */
export default function VisualSearchDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const i = Math.max(0, (Number((id ?? "vs1").replace("vs", "")) || 1) - 1);
  const maker = makers[i % makers.length];
  const title = TITLES[i % TITLES.length];
  const cat = CATS[i % CATS.length];
  const img = IMGS[i % IMGS.length];
  const more = IMGS.filter((m) => m !== img).slice(0, 3);

  return (
    <MobileShell
      footer={
        <div className="flex flex-none items-center gap-2.5 border-t border-tg-line px-[18px] py-3">
          <Button variant="outline" size="md" onClick={() => navigate("/pin")}>
            <Bookmark size={17} className="mr-1.5" />
            Save
          </Button>
          <span className="flex-1" />
          <Button size="md" onClick={() => navigate(path(routes.publicProfile, { id: maker.id }))}>
            View creator
          </Button>
        </div>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="relative">
          <PhotoTile width="100%" height={420} img={feed(img)} swatch="#161514" />
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
          <Chip>{cat}</Chip>
          <h1 className="mt-3 font-serif text-[26px] font-medium leading-tight tracking-[-0.02em]">
            {title}
          </h1>
          <Meta className="mt-2 block">
            {cat} · {maker.city} · 2026
          </Meta>

          <button
            type="button"
            onClick={() => navigate(path(routes.publicProfile, { id: maker.id }))}
            className="mt-4 flex w-full items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-3.5 text-left"
          >
            <Avatar maker={maker} size={46} ring />
            <div className="min-w-0 flex-1">
              <NameRow maker={maker} size={15} />
              <Meta className="mt-0.5 block">
                {maker.role} · {maker.city}
              </Meta>
            </div>
            <Button variant="primary" size="sm">Connect</Button>
          </button>

          <div className="mb-2.5 mt-6 flex items-baseline justify-between">
            <span className="font-display text-[13px] font-semibold text-tg-ink">
              More from {maker.name.split(" ")[0]}
            </span>
            <button
              type="button"
              onClick={() => navigate(path(routes.publicProfile, { id: maker.id }))}
              className="font-mono text-[12px] tracking-meta text-tg-terra"
            >
              View work
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {more.map((m) => (
              <PhotoTile key={m} width="100%" height={92} radius={11} img={feed(m)} swatch="#E7DDCB" />
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate(path(routes.projectDetail, { id: "e1" }))}
            className="mt-5 font-display text-[13.5px] font-semibold text-tg-terra"
          >
            Open project
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
