import type { Maker } from "@/lib/fixtures";
import { cn } from "@/lib/utils";

/**
 * Initials avatar (no faces — the brand uses no faces). Tint comes from the
 * maker; falls back to ink.
 */
export function Avatar({
  maker,
  size = 40,
  ring = false,
  className,
}: {
  maker: Pick<Maker, "initials" | "tint">;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-none items-center justify-center rounded-pill font-display font-semibold text-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: maker.tint || "var(--tg-ink)",
        fontSize: Math.round(size * 0.36),
        letterSpacing: "0.01em",
        boxShadow: ring
          ? `0 0 0 2px var(--tg-card), 0 0 0 3.5px ${maker.tint || "var(--tg-ink)"}`
          : undefined,
      }}
    >
      {maker.initials}
    </span>
  );
}
