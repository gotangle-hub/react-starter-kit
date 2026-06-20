/**
 * Tangle custom icon set for the WEB sidebar — ported verbatim from the
 * reference (`web.jsx` → `TIcon`). Simple geometric editorial line marks.
 *
 * Drawn in the blue accent (blue in light mode, yellow in dark — same swap as
 * the `.t` in the logo). Active state uses a slightly heavier stroke.
 *
 * Used ONLY in the desktop/tablet web shell. The mobile/native app keeps its
 * existing lucide icons and is untouched.
 */
export type TIconName =
  | "home"
  | "search"
  | "explore"
  | "discover"
  | "competitions"
  | "community"
  | "messages"
  | "notifications"
  | "create"
  | "profile"
  | "more";

interface TIconProps {
  name: TIconName;
  size?: number;
  active?: boolean;
  /** CSS color value. Defaults to `currentColor` so it inherits text color. */
  color?: string;
}

export function TIcon({ name, size = 24, active = false, color = "currentColor" }: TIconProps) {
  const sw = active ? 2 : 1.6;
  const P = {
    fill: "none" as const,
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const dot = (cx: number, cy: number, r = 1.3) => (
    <circle cx={cx} cy={cy} r={r} fill={color} stroke="none" />
  );

  const shapes: Record<TIconName, JSX.Element> = {
    // archway / doorway
    home: (
      <g>
        <path d="M5 21V12a7 7 0 0 1 14 0v9" {...P} />
        <path d="M3.5 21h17" {...P} />
      </g>
    ),
    // viewfinder brackets
    search: (
      <g>
        <path d="M5 9V5h4" {...P} />
        <path d="M15 5h4v4" {...P} />
        <path d="M19 15v4h-4" {...P} />
        <path d="M9 19H5v-4" {...P} />
        {dot(12, 12, 1.4)}
      </g>
    ),
    // faceted diamond / wayfinder
    explore: (
      <g>
        <path d="M12 3.5 20.5 12 12 20.5 3.5 12Z" {...P} />
        {dot(12, 12, 1.5)}
      </g>
    ),
    // stacked frames
    discover: (
      <g>
        <rect x="8" y="4" width="12" height="12" rx="1.5" {...P} />
        <rect x="4" y="8" width="12" height="12" rx="1.5" {...P} fill="hsl(var(--tg-bg))" />
      </g>
    ),
    // medal + ribbon
    competitions: (
      <g>
        <circle cx="12" cy="9" r="5" {...P} />
        <path d="M9 13.4 7.7 21l4.3-2.6L16.3 21 15 13.4" {...P} />
      </g>
    ),
    // three-circle network
    community: (
      <g>
        <circle cx="7" cy="8" r="2.4" {...P} />
        <circle cx="17" cy="8" r="2.4" {...P} />
        <circle cx="12" cy="17" r="2.4" {...P} />
        <path d="M9 8.6h6M8.6 9.9 10.6 15M15.4 9.9 13.4 15" {...P} />
      </g>
    ),
    // square speech frame
    messages: (
      <g>
        <rect x="4" y="5" width="16" height="11" rx="1.5" {...P} />
        <path d="M8 16v4l4-4" {...P} />
        <path d="M8 10h8" {...P} />
      </g>
    ),
    // spark / asterisk
    notifications: (
      <g>
        <path d="M12 5v14M6 8.5l12 7M18 8.5l-12 7" {...P} />
      </g>
    ),
    // upload arrow
    create: (
      <g>
        <path d="M12 16V5" {...P} />
        <path d="M7.5 9.5 12 5l4.5 4.5" {...P} />
        <path d="M5 19h14" {...P} />
      </g>
    ),
    // person silhouette (sidebar fallback if no avatar)
    profile: (
      <g>
        <circle cx="12" cy="8.5" r="3.5" {...P} />
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" {...P} />
      </g>
    ),
    // three ragged editorial lines
    more: (
      <g>
        <path d="M5 8h14M5 12h10M5 16h6" {...P} />
      </g>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ display: "block", flex: "none" }}
      aria-hidden
    >
      {shapes[name]}
    </svg>
  );
}
