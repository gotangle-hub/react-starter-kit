import { useEffect, useState } from "react";

/**
 * Viewport detection for the responsive web shell.
 *
 *   mobile   <1024px        → bottom tab bar, no sidebar
 *   tablet   1024–1439px    → icon-only collapsed sidebar, no right rail
 *   desktop  ≥1440px        → full labelled sidebar + right rail
 *
 * The native app (Capacitor) always reports `mobile` regardless of viewport so
 * the App Store build is identical to today's mobile experience.
 */
export type WebViewport = "mobile" | "tablet" | "desktop";

const TABLET_BREAKPOINT = 1024;
const DESKTOP_BREAKPOINT = 1440;

function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

function readViewport(): WebViewport {
  if (typeof window === "undefined" || isNativeApp()) return "mobile";
  const w = window.innerWidth;
  if (w >= DESKTOP_BREAKPOINT) return "desktop";
  if (w >= TABLET_BREAKPOINT) return "tablet";
  return "mobile";
}

export function useWebViewport(): WebViewport {
  const [vp, setVp] = useState<WebViewport>(() => readViewport());

  useEffect(() => {
    if (typeof window === "undefined" || isNativeApp()) return;
    const handler = () => setVp(readViewport());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return vp;
}

/** Convenience: true when we're rendering any web layout (tablet or desktop). */
export function useIsDesktop(): boolean {
  const vp = useWebViewport();
  return vp !== "mobile";
}
