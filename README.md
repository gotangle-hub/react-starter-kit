# Tangle — app (Lovable stack)

Vite + React + TypeScript · Tailwind CSS + shadcn/ui · React Router. Built to drop
into Lovable, which provides the Supabase backend (auth, database, storage) and
publishing.

## Run

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # type-check + production build
```

## Structure (Lovable-standard)

```
src/
  components/   ui (shadcn) · brand (Logo, Chip, VerifiedBadge, Avatar) ·
                app (shells, sheets, scaffolds: mobile-shell, tab-bar, bottom-sheet,
                consent-step, coachmark-tour, state-screens, moderation, settings-kit,
                legal-doc, fields, …) · theme-toggle
  pages/        Foundation.tsx · onboarding/ · app/ (core) · studio/ · client/ ·
                institution/ · collector/
  hooks/        use-theme · use-session (G1) · use-onboarding (G12) · use-checkout (seam)
  lib/          supabase client · types · routes · consent · fixtures (dev data) · utils
  services/     auth (G1) · uploads (G9) · salary (G14)
  index.css     all design tokens as CSS variables + the G15 dark swap
tailwind.config.ts   tokens → Tailwind theme (colours resolve to the variables)
```

## Journeys (all 5 built · 144 routes)

AccountType branches into every flow. Designer (individual/studio), Client, Institution
and Collector each have their own onboarding spine; the core app surfaces (Home, Explore,
Project, Search, Messages, Profile, Salary, moderation, confirmations, empty states) are
shared components reused across journeys. `fixtures.ts` is dev-only data — replaced by
Supabase. Payment actions go through `useCheckout()` (no real charge until Stripe).

## Design tokens (G15)

Ported from `../tokens/*.css` and `../app/theme.jsx`. The light/dark swap lives in
**one place** — the `.dark` overrides in `src/index.css`. Components never branch on
mode; `bg-tg-yellow`, `text-tg-blue-accent`, etc. swap automatically.

- Blue **fill** (`--tg-blue`) never swaps; blue **accent** (`--tg-blue-accent`) and
  **yellow** (`--tg-yellow`) swap blue ⇄ yellow in dark.
- The verified tick (`--tg-verified-*`) never swaps — the G15 exception.
- Theme follows the OS by default (live), with a manual light/dark/system override
  persisted in `localStorage` under `tangle.theme`.

## Backend & payments

- `src/lib/supabase.ts` — runs without credentials (UI still works); lights up when
  Lovable injects `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- `src/hooks/use-checkout.ts` — full payment UI seam; `checkout()` does **no real
  processing**. Replace `processPayment` with a Stripe call in Lovable.
