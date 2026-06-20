import { useEffect, useState } from "react";

/**
 * True when the current viewport is desktop-class (≥1024px) AND the app is
 * running in a real web browser (not the Capacitor native iOS/Android shell).
 *
 * The native app should always render the mobile UI regardless of viewport, so
 * we hard-gate to false whenever Capacitor is detected. This keeps the App
 * Store build identical to today's mobile experience.
 */
const DESKTOP_BREAKPOINT = 1024;

function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  // Capacitor injects `window.Capacitor` when running inside the native shell.
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (isNativeApp()) return false;
    return window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || isNativeApp()) return;
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}
