import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import type { Maker } from "@/lib/fixtures";

/** Progress dots (carousels, tour). The active dot stretches and takes the accent. */
export function Dots({ count, index }: { count: number; index: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: count }).map((_, k) => (
        <span
          key={k}
          className={cn(
            "h-[7px] rounded-pill transition-all duration-base",
            k === index ? "w-[22px] bg-tg-blue-accent" : "w-[7px] bg-tg-line",
          )}
        />
      ))}
    </div>
  );
}

/** Neutral skill pill — toggles to an inked fill when active. */
export function Pill({
  children,
  on = false,
  small = false,
  onClick,
}: {
  children: ReactNode;
  on?: boolean;
  small?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-pill border font-body tracking-body transition-colors duration-fast",
        small ? "px-2.5 py-1 text-[11.5px]" : "px-3 py-1.5 text-[13px]",
        on
          ? "border-tg-inv bg-tg-inv text-tg-inv-text"
          : "border-tg-line bg-transparent text-tg-brown hover:border-tg-ink-12",
      )}
    >
      {children}
    </button>
  );
}

/** Tiny monospace meta line (timestamps, locations, editorial detail). */
export function Meta({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn("font-mono text-[12px] leading-[1.4] tracking-meta text-tg-brown", className)}
    >
      {children}
    </span>
  );
}

/** Maker name + verified tick. Optionally shows the @handle below or inline. */
export function NameRow({
  maker,
  size = 14,
  className,
  showHandle = false,
}: {
  maker: Pick<Maker, "name" | "verified"> & { handle?: string | null };
  size?: number;
  className?: string;
  showHandle?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="font-display font-semibold text-tg-ink" style={{ fontSize: size }}>
        {maker.name}
      </span>
      {maker.verified && <VerifiedBadge size={size + 1} />}
      {showHandle && maker.handle && (
        <span className="font-mono text-[11.5px] text-tg-brown-soft">@{maker.handle}</span>
      )}
    </span>
  );
}

/**
 * Warm placeholder image tile. With `img` it shows the photo; otherwise a warm
 * flat swatch with a faint diagonal hatch — never a grey box.
 */
export function PhotoTile({
  width,
  height = "100%",
  label,
  swatch = "#EEE6D6",
  radius = 0,
  img,
  className,
  style,
}: {
  width?: number | string;
  height?: number | string;
  label?: string;
  swatch?: string;
  radius?: number;
  img?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        width,
        height,
        borderRadius: radius,
        background: swatch,
        backgroundImage: img
          ? `url(${img})`
          : "repeating-linear-gradient(135deg, rgba(0,0,0,.025) 0 10px, transparent 10px 20px)",
        backgroundSize: img ? "cover" : undefined,
        backgroundPosition: "center",
        ...style,
      }}
    >
      {label && (
        <span
          className="absolute bottom-2 left-2.5 font-mono text-[10px] tracking-[0.04em]"
          style={{
            color: img ? "#fff" : "var(--tg-brown)",
            opacity: img ? 0.9 : 0.75,
            textShadow: img ? "0 1px 2px rgba(0,0,0,.5)" : "none",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
