import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Bookmark, Lock } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { routes } from "@/lib/routes";
import { listMyBoards, type Board } from "@/services/boards";
import { useWebViewport } from "@/hooks/use-is-desktop";
import { PinUpsDesktop } from "@/components/web/pages/pinups-desktop";

/**
 * 27 · Pin ups (G7). Reads the user's boards from `boards` + `board_items`.
 * The empty state matches the original design — only the data is real now.
 */
export default function PinBoards() {
  const viewport = useWebViewport();
  if (viewport !== "mobile") return <PinUpsDesktop />;
  return <PinBoardsMobile />;
}

function PinBoardsMobile() {
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
    <MobileShell
      header={
        <BackHeader
          title="Pin ups"
          right={
            <button
              type="button"
              onClick={() => navigate(routes.pinToBoard)}
              className="flex items-center gap-1.5 text-tg-blue-accent"
            >
              <Plus size={17} />
              <span className="font-display text-[13px] font-semibold">New pin up</span>
            </button>
          }
        />
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-6">
        <RefreshHint />
        <Meta className="block">References you keep coming back to.</Meta>

        {boards && boards.length > 0 ? (
          <ul className="mt-5 grid grid-cols-2 gap-3">
            {boards.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  className="group flex w-full flex-col rounded-lg border border-tg-line bg-tg-card p-3 text-left"
                >
                  <span className="flex aspect-square w-full items-center justify-center rounded-DEFAULT bg-tg-stone2 text-tg-brown">
                    <Bookmark size={22} />
                  </span>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="truncate font-display text-[13.5px] font-semibold text-tg-ink">
                      {b.title}
                    </span>
                    {b.is_private && <Lock size={11} className="text-tg-brown" />}
                  </div>
                  <Meta className="block">{b.item_count ?? 0} pins</Meta>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
              <Bookmark size={22} />
            </span>
            <h2 className="mt-4 font-serif text-[20px] font-medium tracking-[-0.01em]">No pin ups yet</h2>
            <Meta className="mt-1.5 block max-w-[260px]">Pin work from Explore to start your first board.</Meta>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
