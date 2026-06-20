# Responsive web for Tangle — Designer core screens

## Goal

Add a desktop/tablet web experience (Instagram-style sidebar + multi-column) on top of the existing mobile app, with **zero regressions** to the current mobile UI or to what will ship as the native iOS/Android app via Capacitor.

One codebase, two presentations:
- Phone browser + native app → current mobile UI, unchanged
- Tablet/desktop browser → new responsive layout

The native App Store app bundles the web assets locally — it is not a browser pointing at gotangle.app. It only ever renders the mobile UI because its viewport is always phone-sized.

## Scope of this pass

**In scope (Designer journey only):**
- Responsive shell: left sidebar (labels + icons on desktop, icon-only on tablet), optional right rail, mobile keeps bottom tab bar
- Desktop layouts for: Home (Dashboard), Explore, Match, Messages (Inbox + threads), Notifications, Profile, Community, Competitions, Upload, Public profile, Project detail
- Logged-out flow on desktop = same as mobile (Splash → Carousel → AccountType → SignIn), just rendered inside a centered web container so it doesn't look broken on a wide screen

**Out of scope (later passes):**
- Studio, Client, Institution/Student, Collector desktop layouts (their mobile UI still works fine in a desktop browser; we just don't add custom desktop chrome yet)
- Settings sub-screens desktop polish
- PWA / installability / offline
- Capacitor setup (separate task when you're ready to ship to App Store)

## How it works

A single `useIsDesktop()` hook reads `window.matchMedia('(min-width: 1024px)')`. Above the breakpoint, a new `WebShell` wraps the page (sidebar + rail). Below, the existing `MobileShell` renders exactly as today. Pages themselves are the **same components** — they read the breakpoint and adapt their internal grid (e.g. Explore goes from 1-column full-bleed on mobile to a 3-column masonry on desktop; Inbox goes from list → thread navigation to a split list+thread pane).

No existing mobile component is rewritten. New desktop-only chrome lives in new files under `src/components/web/`.

## Breakpoints

- `< 1024px` → mobile UI (current app, untouched)
- `1024–1439px` → tablet web: collapsed icon-only sidebar, no right rail, 2-col content
- `≥ 1440px` → desktop web: full labelled sidebar, right rail (suggestions / trending), 3-col content where appropriate

## Native app guarantee

- `Capacitor.isNativePlatform()` short-circuits `useIsDesktop()` to always return false
- Native build forces mobile shell regardless of viewport
- Nothing in this pass touches auth, RLS, edge functions, database, payments, signup flows, or any business logic

## Files added

```
src/hooks/useIsDesktop.ts
src/components/web/WebShell.tsx
src/components/web/Sidebar.tsx
src/components/web/RightRail.tsx
src/components/web/WebTopBar.tsx
src/layouts/ResponsiveLayout.tsx     // chooses WebShell vs MobileShell
```

## Files edited (minimal)

- `src/App.tsx` — wrap authenticated Designer routes with `ResponsiveLayout` instead of `MobileShell` directly
- Designer pages listed above — add a `useIsDesktop()` branch for their internal layout (data, hooks, queries unchanged)

No edits to: auth pages, signup pages, settings, integrations, supabase client, schema, edge functions.

## Verification checklist

After build:
1. Phone width (375px) — every Designer screen looks identical to today
2. Tablet width (1024px) — sidebar collapses to icons, content reflows to 2-col
3. Desktop width (1440px+) — full sidebar with labels, right rail visible, Explore is a 3-col grid
4. All nav destinations reachable from the sidebar
5. Dark mode follows system on both shells
6. No console errors, no broken routes
7. Logged-out `/` still shows Splash → onboarding on every viewport

## App Store packaging (reference, not part of this task)

When you're ready to ship to App Store, separate Capacitor task:
1. `npx cap init` with your app ID/name
2. `npx cap add ios` and/or `npx cap add android`
3. `npm run build` → `npx cap sync` copies `dist/` into the native shells
4. Open in Xcode / Android Studio, sign, submit

The native app only ever ships the **built mobile UI**. Your web deploy at gotangle.app is independent — updating the web does not auto-update the App Store app (App Store has its own review/release cycle). That's the "proper app" behavior you want.

## Next passes (not now)

1. Studio desktop layouts
2. Client desktop layouts
3. Institution/Student desktop layouts (including Classes split-pane)
4. Collector desktop layouts
5. Capacitor setup + first TestFlight build
