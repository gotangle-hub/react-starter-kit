import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Meta, PhotoTile } from "@/components/brand/atoms";
import { feed, pinBoards } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

/**
 * 27 · Pin ups (G7). The user's collected boards — each a grid of pinned
 * references. Pull to refresh, plus a "New pin up" affordance.
 */
export default function PinBoards() {
  const navigate = useNavigate();

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
        <Meta className="block">{pinBoards.length} pin ups · references you keep coming back to</Meta>

        {pinBoards.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tg-stone2">
              <Plus size={24} className="text-tg-brown" />
            </span>
            <h2 className="mt-4 font-serif text-[20px] font-medium tracking-[-0.01em]">No pin ups yet</h2>
            <Meta className="mt-1.5 block">Pin work from Explore to start a board.</Meta>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3.5">
            {pinBoards.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => navigate(routes.pinToBoard)}
                className="overflow-hidden rounded-lg border border-tg-line bg-tg-card text-left"
              >
                <div className="relative">
                  <PhotoTile width="100%" height={120} img={feed(b.cover)} swatch="#E7DDCB" />
                  <div className="absolute inset-x-0 bottom-0 grid h-7 grid-cols-3 gap-px bg-tg-line/40 p-px">
                    {[0, 1, 2].map((k) => (
                      <span key={k} className="bg-tg-card/0" />
                    ))}
                  </div>
                </div>
                <div className="p-3">
                  <div className="truncate font-display text-[14px] font-semibold text-tg-ink">{b.name}</div>
                  <Meta className="mt-0.5 block">{b.count} pins</Meta>
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={() => navigate(routes.pinToBoard)}
              className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-tg-line text-tg-brown"
            >
              <Plus size={22} className="text-tg-blue-accent" />
              <span className="font-display text-[13px] font-semibold">New pin up</span>
            </button>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
