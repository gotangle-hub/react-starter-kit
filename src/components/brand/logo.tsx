import { cn } from "@/lib/utils";

/**
 * The Tangle wordmark (G15). The dot sits BEFORE the "t"; the dot + "t" carry
 * the accent colour (blue in light, yellow in dark — driven by --tg-blue-accent),
 * while the rest of the word is ink/beige. Reproduced in the editorial serif.
 *
 * `onDark` forces the always-dark treatment (beige word, yellow ".t") for use on
 * fixed dark panels regardless of the app theme.
 */
export function Logo({
  size = 24,
  onDark = false,
  className,
}: {
  size?: number;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("tangle-wordmark", className)}
      style={{
        fontSize: size,
        lineHeight: 1,
        ...(onDark ? { color: "var(--tg-cream)" } : {}),
      }}
    >
      <span
        className="tangle-mark tangle-mark-dot"
        style={onDark ? { color: "#F4D738" } : undefined}
      >
        .
      </span>
      <span className="tangle-mark" style={onDark ? { color: "#F4D738" } : undefined}>
        t
      </span>
      angle
    </span>
  );
}
