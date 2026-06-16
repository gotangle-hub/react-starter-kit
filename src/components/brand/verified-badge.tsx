/**
 * The verified tick — the one true mark that NEVER swaps between light and dark
 * (G15 exception). Yellow badge, dark check, in both modes. Granted automatically
 * by identity verification (G11).
 */
export function VerifiedBadge({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="inline-block flex-none align-middle"
      aria-label="Verified"
      role="img"
    >
      <path
        d="M12 1.5l2.39 1.74 2.95-.02 .9 2.8 2.4 1.72-.91 2.8.92 2.8-2.4 1.72-.9 2.8-2.96-.02L12 22.5l-2.39-1.74-2.95.02-.9-2.8-2.4-1.72.91-2.8-.92-2.8 2.4-1.72.9-2.8 2.96.02L12 1.5z"
        fill="var(--tg-verified-badge)"
      />
      <path
        d="M8 12l2.6 2.6L16 9.2"
        stroke="var(--tg-verified-check)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
