import type { ReactElement } from "react";
import { useWebViewport } from "@/hooks/use-is-desktop";
import { WebPhoneFrame } from "@/components/web/web-phone-frame";

/**
 * Route-level wrapper that renders any mobile page inside the desktop sidebar
 * shell as a centered phone-style column. Use for pages that don't have a
 * bespoke desktop layout. On mobile (Capacitor or <700px web), the page
 * renders bare so nothing about the mobile UI changes.
 *
 * Usage in App.tsx:
 *   <Route path={...} element={<DesktopFrame><Page /></DesktopFrame>} />
 */
export function DesktopFrame({ children }: { children: ReactElement }) {
  const viewport = useWebViewport();
  if (viewport === "mobile") return children;
  return <WebPhoneFrame>{children}</WebPhoneFrame>;
}
