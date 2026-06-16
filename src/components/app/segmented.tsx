import { cn } from "@/lib/utils";

/** Segmented control (e.g. Home top menu). The active segment lifts onto a card. */
export function Segmented({
  items,
  active,
  onChange,
}: {
  items: string[];
  active: string;
  onChange: (item: string) => void;
}) {
  return (
    <div className="flex gap-1 rounded-DEFAULT bg-tg-stone2 p-1">
      {items.map((it) => {
        const on = it === active;
        return (
          <button
            key={it}
            type="button"
            onClick={() => onChange(it)}
            className={cn(
              "flex-1 rounded-md px-1.5 py-2 text-[13px] tracking-body transition-all duration-fast",
              on
                ? "bg-tg-card font-semibold text-tg-ink shadow-card"
                : "font-medium text-tg-brown",
            )}
          >
            {it}
          </button>
        );
      })}
    </div>
  );
}
