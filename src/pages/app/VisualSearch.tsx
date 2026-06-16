import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Bookmark, SlidersHorizontal, X } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { Meta } from "@/components/brand/atoms";
import { feed, makerById } from "@/lib/fixtures";
import { path, routes } from "@/lib/routes";
import { semanticSearch, type SearchMatch } from "@/services/search";

const HEIGHTS = [150, 200, 170, 230, 160, 210, 190, 180, 220, 150, 200, 175];

/**
 * 30 · Visual search results (G4, G7). A masonry grid of every relevant piece
 * across the platform — matched by meaning, not by keyword. Results come from
 * the platform's intelligent search; the powering technology is never named.
 */
export default function VisualSearch() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const location = useLocation();
  const q = params.get("q") ?? "";
  const imageDataUrl = (location.state as { imageDataUrl?: string } | null)?.imageDataUrl;
  const headerLabel = imageDataUrl ? "your image" : q || "all";

  const [matches, setMatches] = useState<SearchMatch[] | null>(null);
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!q && !imageDataUrl) { setMatches([]); return; }
      const m = await semanticSearch(
        imageDataUrl
          ? { mode: "image", image_data_url: imageDataUrl, limit: 24 }
          : { mode: "text", query: q, limit: 24 },
      );
      if (!cancel) setMatches(m);
    })();
    return () => { cancel = true; };
  }, [q, imageDataUrl]);

  const tiles = useMemo(() => {
    return (matches ?? []).map((m, i) => {
      const meta = m.metadata as { title?: string; cat?: string; maker?: string; img?: string; swatch?: string };
      return {
        id: m.ref_id,
        img: meta.img,
        swatch: meta.swatch ?? "#161514",
        h: HEIGHTS[i % HEIGHTS.length],
        maker: makerById(meta.maker ?? ""),
        title: meta.title ?? m.content.split(".")[0],
        cat: meta.cat ?? "",
      };
    });
  }, [matches]);

  return (
    <MobileShell footer={null} header={<BackHeader title={`Results · "${headerLabel}"`} />}>
      <div className="flex-none px-[22px] pt-3">
        <div className="flex items-center gap-2.5 rounded-DEFAULT border-[1.5px] border-tg-blue-accent bg-tg-card px-3.5 py-2.5">
          <span className="flex-1 font-display text-[15px] font-medium text-tg-ink">{headerLabel}</span>
          <button type="button" aria-label="Clear search" onClick={() => navigate(routes.search)}>
            <X size={17} className="text-tg-brown-soft" />
          </button>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <Meta>Matched by meaning, not keyword</Meta>
          <button type="button" className="inline-flex items-center gap-1.5 text-tg-blue-accent">
            <SlidersHorizontal size={13} />
            <span className="font-display text-[12px] font-semibold">Filter</span>
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <RefreshHint />
        {matches === null ? (
          <div className="px-2 pt-6"><Meta>Looking…</Meta></div>
        ) : tiles.length === 0 ? (
          <div className="px-2 pt-6"><Meta>No results yet — try another query.</Meta></div>
        ) : (
          <div className="[column-count:2] [column-gap:10px]">
            {tiles.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => navigate(path(routes.visualSearchDetail, { id: t.id }))}
                className="relative mb-2.5 block w-full overflow-hidden rounded-lg border border-tg-line bg-tg-card text-left [break-inside:avoid]"
              >
                {t.img ? (
                  <img src={feed(t.img)} alt={t.title} className="block w-full object-cover" style={{ height: t.h }} />
                ) : (
                  <div
                    className="flex w-full items-end p-3 font-mono text-[13px] leading-[1.3] text-white"
                    style={{ height: t.h, background: t.swatch }}
                  >
                    {t.title}
                  </div>
                )}

                <span className="absolute right-2 top-2 flex h-[30px] w-[30px] items-center justify-center rounded-pill bg-black/40 backdrop-blur">
                  <Bookmark size={15} className="text-white" />
                </span>

                <span className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-pill bg-black/45 py-1 pl-1 pr-2.5 backdrop-blur">
                  <Avatar maker={t.maker} size={18} />
                  <span className="font-display text-[10.5px] font-semibold text-white">
                    {t.maker.name.split(" ")[0]}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
