import { useNavigate } from "react-router-dom";
import { Plus, Bookmark } from "lucide-react";
import { BottomSheet } from "@/components/app/bottom-sheet";
import { Meta } from "@/components/brand/atoms";

/**
 * 26 · Pin to a board. Until the pin-boards backend is wired, this sheet lets
 * the user start their first board (G14: no fixture boards).
 */
export default function PinToBoard() {
  const navigate = useNavigate();
  return (
    <BottomSheet title="Pin to a board">
      <div className="px-5 pb-6 pt-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex w-full items-center gap-3 rounded-lg border border-dashed border-tg-line p-3 text-left"
        >
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-DEFAULT bg-tg-stone2">
            <Plus size={20} className="text-tg-blue-accent" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[14.5px] font-semibold text-tg-ink">Create a new pin up</div>
            <Meta className="mt-0.5 block">Start a fresh board for this reference</Meta>
          </div>
        </button>

        <div className="mb-2 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
          Your pin ups
        </div>

        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-tg-line bg-tg-card px-4 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
            <Bookmark size={20} />
          </span>
          <Meta className="block max-w-[240px]">You don&rsquo;t have any pin ups yet. Create one above to pin this reference.</Meta>
        </div>
      </div>
    </BottomSheet>
  );
}
