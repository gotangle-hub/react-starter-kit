import { useNavigate } from "react-router-dom";
import { Plus, Bookmark } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { routes } from "@/lib/routes";

/**
 * 27 · Pin ups (G7). Backend for boards isn't wired yet — show a real empty
 * state (G14) until the `pin_boards` table is built.
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
        <Meta className="block">References you keep coming back to.</Meta>

        <div className="mt-16 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
            <Bookmark size={22} />
          </span>
          <h2 className="mt-4 font-serif text-[20px] font-medium tracking-[-0.01em]">No pin ups yet</h2>
          <Meta className="mt-1.5 block max-w-[260px]">Pin work from Explore to start your first board.</Meta>
        </div>
      </div>
    </MobileShell>
  );
}
