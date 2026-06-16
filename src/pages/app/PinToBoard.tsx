import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import { BottomSheet } from "@/components/app/bottom-sheet";
import { Meta, PhotoTile } from "@/components/brand/atoms";
import { feed, pinBoards } from "@/lib/fixtures";
import { cn } from "@/lib/utils";

/**
 * 26 · Pin to a board. A bottom sheet to pin the current work into one of the
 * user's pin ups, or create a new one.
 */
export default function PinToBoard() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

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

        <div className="flex flex-col gap-2">
          {pinBoards.map((b) => {
            const on = selected === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelected(b.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border bg-tg-card p-2.5 text-left transition-colors duration-fast",
                  on ? "border-tg-blue-accent" : "border-tg-line",
                )}
              >
                <PhotoTile
                  width={48}
                  height={48}
                  radius={10}
                  img={feed(b.cover)}
                  swatch="#E7DDCB"
                  className="flex-none"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-[14.5px] font-semibold text-tg-ink">{b.name}</div>
                  <Meta className="mt-0.5 block">{b.count} pins</Meta>
                </div>
                <span
                  className={cn(
                    "flex h-6 w-6 flex-none items-center justify-center rounded-pill border",
                    on ? "border-tg-blue-accent bg-tg-blue" : "border-tg-line",
                  )}
                >
                  {on && <Check size={15} className="text-white" />}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!selected}
          onClick={() => navigate(-1)}
          className={cn(
            "mt-5 w-full rounded-pill py-3.5 font-display text-[14.5px] font-semibold transition-opacity duration-fast",
            selected ? "bg-tg-blue text-white" : "bg-tg-stone2 text-tg-brown-soft",
          )}
        >
          Pin here
        </button>
      </div>
    </BottomSheet>
  );
}
