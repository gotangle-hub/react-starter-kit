import type { Maker } from "@/lib/profile-shape";
import { cn } from "@/lib/utils";

/**
 * Initials avatar (no faces — the brand uses no faces). Tint comes from the
 * maker; falls back to ink. If `avatarUrl` is provided, that image is rendered
 * on top of the tint so real uploaded avatars take precedence.
 */
export function Avatar({
  maker,
  size = 40,
  ring = false,
  className,
}: {
  maker: Pick<Maker, "initials" | "tint"> & { avatarUrl?: string };
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  const hasImg = Boolean(maker.avatarUrl);
  return (
    <span
      className={cn(
        "inline-flex flex-none items-center justify-center overflow-hidden rounded-pill font-display font-semibold text-white",
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
      {hasImg ? (
        <img src={maker.avatarUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        maker.initials
      )}
    </span>
  );
}
