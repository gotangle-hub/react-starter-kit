import { useEffect, useState } from "react";

/**
 * Viewport detection for the responsive WEB shell. Breakpoints match the
 * reference spec (`Lovable Prompt - Tangle on Web.md`):
 *
 *   mobile   <700px          → bottom tab bar, no sidebar, no rail (existing mobile UI)
 *   tablet   700–1099px      → icon-only collapsed sidebar, no right rail
 *   desktop  ≥1100px         → full labelled sidebar + right rail
 *
 * The native Capacitor app ALWAYS reports `mobile` regardless of viewport, so
 * the iOS/Android build keeps today's mobile experience byte-for-byte
 * identical — the web shell never renders inside the app store binary.
 */
export type WebViewport = "mobile" | "tablet" | "desktop";

export const TABLET_BREAKPOINT = 700;
export const DESKTOP_BREAKPOINT = 1100;

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
  return useWebViewport() !== "mobile";
}

/** Convenience: true ONLY inside the native Capacitor app (iOS / Android binaries). */
export function useIsNativeApp(): boolean {
  const [native, setNative] = useState<boolean>(() => isNativeApp());
  useEffect(() => setNative(isNativeApp()), []);
  return native;
}
