import type { ReactNode } from "react";
import { WebPage } from "@/components/web/web-page";

/**
 * Tangle WEB phone frame — wraps an unchanged mobile page inside the desktop
 * sidebar shell, presenting it as a centered "device" column with the page
 * board behind. This is the pragmatic desktop treatment for pages that don't
 * yet have a bespoke desktop layout: the user gets the proper web sidebar +
 * flyouts, while the page content remains byte-for-byte identical to mobile.
 *
 * Mobile (Capacitor) never reaches here — pages branch on useWebViewport().
 */
export function WebPhoneFrame({ children }: { children: ReactNode }) {
  return (
    <WebPage maxWidth={520} pad="24px">
      <div className="overflow-hidden rounded-3xl border border-tg-line bg-tg-bg shadow-card">
        <div className="min-h-[720px]">{children}</div>
      </div>
    </WebPage>
  );
}
