import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Lock, Plus } from "lucide-react";

import { WebPage } from "@/components/web/web-page";
import { RightRail } from "@/components/web/right-rail";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { listMyBoards, type Board } from "@/services/boards";

/**
 * Desktop Pin ups — single column with right rail, 3-up board grid.
 * Mirrors the mobile PinBoards page; real data only (G14).
 */
export function PinUpsDesktop() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMyBoards().then((b) => {
      if (!cancelled) setBoards(b);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <WebPage maxWidth={1100} rightRail={<RightRail />}>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-[34px] font-medium leading-none tracking-[-0.02em] text-tg-ink">
            Pin ups
          </h1>
          <Meta className="mt-2 block">References you keep coming back to.</Meta>
        </div>
        <Button variant="outlineAccent" size="sm" onClick={() => navigate(routes.pinToBoard)}>
          <Plus size={15} />
          New pin up
        </Button>
      </div>

      {boards && boards.length > 0 ? (
        <ul className="mt-8 grid grid-cols-2 gap-5 min-[1000px]:grid-cols-3">
          {boards.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                className="group flex w-full flex-col rounded-2xl border border-tg-line bg-tg-card p-4 text-left transition hover:border-tg-ink/20"
              >
                <span className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-tg-stone2 text-tg-brown">
                  <Bookmark size={28} />
                </span>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="truncate font-display text-[15px] font-semibold text-tg-ink">
                    {b.title}
                  </span>
                  {b.is_private && <Lock size={12} className="text-tg-brown" />}
                </div>
                <Meta className="mt-0.5 block">{b.item_count ?? 0} pins</Meta>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-16 flex flex-col items-center rounded-2xl border border-dashed border-tg-line bg-tg-card px-6 py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-tg-stone2 text-tg-brown">
            <Bookmark size={26} />
          </span>
          <h2 className="mt-5 font-serif text-[24px] font-medium tracking-[-0.01em] text-tg-ink">
            No pin ups yet
          </h2>
          <Meta className="mt-2 block max-w-[320px]">
            Pin work from Explore to start your first board.
          </Meta>
        </div>
      )}
    </WebPage>
  );
}
