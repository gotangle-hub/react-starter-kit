# Tangle screen-build API (read before building any screen)

Build each screen as a single default-export React component in `src/pages/app/<Name>.tsx`.
Mobile-first (≤440px column). **Both light & dark must work** — only ever use the
token classes below; **never** hardcode hex colours. **No emoji.** **Never name the
search/recommendation technology in UI copy (G4)** — say "Suggested", "For you",
"Smart search", "Find competitions".

## Shells & layout
- `import { MobileShell } from "@/components/app/mobile-shell"` — `<MobileShell footer={<TabBar/>} header={...}>`. Props: `children, className?, contentClassName?, footer?, header?`. It already fills height + provides the scroll area.
- `import { TabBar } from "@/components/app/tab-bar"` — bottom 5-tab nav (Home/Explore/Search/Messages/You). No props; auto-highlights by route. Use on tab-root screens.
- `import { AppHeader } from "@/components/app/app-header"` — wordmark + bell + avatar. Props: `unread?`. Use on tab roots.
- `import { BackHeader, PromotedTag, RefreshHint } from "@/components/app/bits"` — `BackHeader{title?, right?, onBack?}` (pushed screens); `PromotedTag` (boosted label, G6); `RefreshHint` (pull-to-refresh hint, G7 — put at top of feeds/lists).
- `import { BottomSheet } from "@/components/app/bottom-sheet"` — `<BottomSheet title? onClose? full?>`. Dimmed scrim + slide-up panel; `onClose` defaults to `navigate(-1)`. Use for menus/sheets/confirm dialogs.
- `import { Segmented } from "@/components/app/segmented"` — `{items: string[], active, onChange}`.

## Brand atoms
- `import { Logo } from "@/components/brand/logo"` — `{size?, onDark?}`. `onDark` for fixed dark panels.
- `import { Chip } from "@/components/brand/chip"` — yellow chip (swaps to blue in dark). One-ish per screen.
- `import { VerifiedBadge } from "@/components/brand/verified-badge"` — yellow tick, NEVER swaps.
- `import { Avatar } from "@/components/brand/avatar"` — `{maker, size?, ring?}` where maker has `{initials, tint}`.
- `import { Dots, Pill, Meta, NameRow, PhotoTile } from "@/components/brand/atoms"`:
  - `Dots{count, index}`; `Pill{children, on?, small?, onClick?}`; `Meta{children, className?}` (mono meta line);
  - `NameRow{maker:{name,verified}, size?}`; `PhotoTile{width?, height?, img?, swatch?, radius?, label?, className?, style?}` (use `feed(name)` for img).

## shadcn primitives
- `import { Button } from "@/components/ui/button"` — `variant`: `primary`(blue fill, white) | `dark` | `outline` | `outlineAccent`(swaps blue/yellow) | `ghost` | `quiet` | `destructive`; `size`: `sm|md|lg|icon`; `full?`.
- `import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"`.

## Data & nav
- `import { ... } from "@/lib/fixtures"`: `makers, makerById(id), me, works, posts, comments, callOuts, competitions, tangleComps, notifications, community, chats, pinBoards, designerPlans, disciplines, cities, feed(name)`. Types: `Maker, Work, Post, CallOut, Competition, Notification, CommunityPost, Chat`. This is DEV data — also build the real **empty state** where a screen specifies one (G14). Never invent NEW placeholder names; reuse fixtures.
- `import { routes, path } from "@/lib/routes"` — use `routes.x`; for param routes use `path(routes.projectDetail, {id})`.
- `import { useNavigate, useParams } from "react-router-dom"`.
- `import { useCheckout } from "@/hooks/use-checkout"` — payment seam for Plans/Billing/Checkout/Promote (`checkout(req)`, no real charge).
- `import { cn } from "@/lib/utils"`.
- Icons: `import { IconName } from "lucide-react"` (sizes 14–24, strokeWidth 1.75 default).

## Token classes (these encode the G15 swap — use ONLY these for colour)
- Surfaces: `bg-tg-bg` (page), `bg-tg-card`, `bg-tg-stone2` (sunken), `bg-tg-emph`+`text-tg-emph-text` (dark editorial panel), `bg-tg-inv`+`text-tg-inv-text`, `bg-tg-feed-bg` (full-bleed feed).
- Text: `text-tg-ink` (body), `text-tg-brown` (meta), `text-tg-brown-soft` (faint), `text-tg-terra` (links).
- Accent: `bg-tg-blue` (FILL only, stays blue, put white text on it) · `text-tg-blue-accent`/`border-tg-blue-accent` (blue→yellow in dark) · `bg-tg-yellow` (yellow→blue in dark).
- Lines: `border-tg-line`, `border-tg-line-soft`.
- Type: `font-serif` (Newsreader — titles/wordmark), `font-display`/`font-body` (Archivo), `font-mono` (IBM Plex Mono — meta).
- Radii: `rounded-chip` (4px) `rounded-DEFAULT` (10) `rounded-lg` (16) `rounded-xl` (24) `rounded-pill`. Shadows: `shadow-card`, `shadow-float`.

## Reference (optional, for fidelity)
The original prototype screens are in `/home/munamaam/tangle/app/*.jsx` (window-global,
inline styles using `TG_C`/`TG_FONT`). Read the relevant one for layout/copy, but PORT
to the API above — do not copy inline styles or `TG_*`. The exemplars already built in
this stack: `src/pages/app/Home.tsx`, `Explore.tsx`, `ProjectDetail.tsx`, `CommentsSheet.tsx`.

Do NOT edit shared files, `App.tsx`, `fixtures.ts`, or `routes.ts` — the integrator wires
routes. Only create your assigned `src/pages/app/<Name>.tsx` files.
