import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * G3 · Trending badge. Surfaces a post's current reach tier (0–4) when it has
 * accelerated past the normal engagement curve. Hidden for tier 0/1 so it stays
 * meaningful. Labels match the velocity bands defined in `refresh_post_metrics`.
 */
const LABEL: Record<number, string> = {
  2: "Rising",
  3: "Trending",
  4: "Breakout",
};

export function TrendingBadge({
  tier,
  className,
  compact,
}: {
  tier: number | null | undefined;
  className?: string;
  compact?: boolean;
}) {
  const t = Math.max(0, Math.min(4, Number(tier ?? 0)));
  if (t < 2) return null;
  const label = LABEL[t] ?? "Trending";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill bg-tg-yellow/90 px-2 py-0.5 font-display text-[10.5px] font-semibold uppercase tracking-[0.06em] text-tg-ink",
        compact && "px-1.5",
        className,
      )}
      aria-label={`${label} — high engagement`}
    >
      <Flame size={11} strokeWidth={2.5} />
      {!compact && label}
    </span>
  );
}
