/**
 * Brand loading ring — same visual language as the Splash loader (G15).
 * Border-2 pill with a coloured top arc; the colour token swaps automatically
 * in dark mode (yellow ↔ blue per G15). Use anywhere we previously showed
 * only a "…" busy label so uploads/saves have a consistent circular spinner.
 */
type Props = {
  size?: number;
  className?: string;
  /** Stroke colour for the spinning arc. Defaults to the brand yellow token. */
  tone?: "yellow" | "blue" | "ink";
};

const TONE: Record<NonNullable<Props["tone"]>, string> = {
  yellow: "var(--tg-yellow)",
  blue: "var(--tg-blue)",
  ink: "var(--tg-ink)",
};

export function LoadingRing({ size = 16, className = "", tone = "yellow" }: Props) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-pill border-2 border-tg-line align-[-3px] ${className}`}
      style={{
        width: size,
        height: size,
        borderTopColor: TONE[tone],
        animationDuration: "0.9s",
      }}
    />
  );
}

export default LoadingRing;
