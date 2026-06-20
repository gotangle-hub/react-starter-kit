import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useWebViewport } from "@/hooks/use-is-desktop";
import { useSession } from "@/hooks/use-session";
import { WebSidebar } from "@/components/web/web-sidebar";
import { RightRail } from "@/components/web/right-rail";

/**
 * The app is mobile-first (390×844 reference). MobileShell fills the viewport
 * height, centres a phone-width column on larger screens, and gives screens a
 * single scroll area.
 *
 * Web layouts (non-native, breakpoints per the Tangle Web reference spec):
 *   mobile  <700px         → bottom tab bar, no sidebar (today's mobile UI)
 *   tablet  700–1099px     → icon-only sidebar (76px), no right rail
 *   desktop ≥1100px        → full labelled sidebar (244px) + right rail (320px)
 *
 * The native Capacitor app always reports `mobile` regardless of viewport, so
 * the App Store build keeps today's mobile experience exactly as it is.
 */
export function MobileShell({
  children,
  className,
  contentClassName,
  footer,
  header,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  footer?: ReactNode;
  header?: ReactNode;
}) {
  const viewport = useWebViewport();
  const { isAuthenticated } = useSession();
  const showWebChrome = viewport !== "mobile" && isAuthenticated;
  const sidebarCollapsed = viewport === "tablet";

  return (
    <div className="flex min-h-[100dvh] w-full bg-tg-page-board">
      {showWebChrome && <WebSidebar collapsed={sidebarCollapsed} />}
      <div className="flex min-h-[100dvh] flex-1 justify-center">
        <div
          className={cn(
            "relative flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden bg-tg-bg text-tg-ink",
            className,
          )}
        >
          {header}
          <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", contentClassName)}>
            {children}
          </div>
          {/* Bottom tab bar shows only on mobile (<700px). Sidebar replaces it above. */}
          {footer && <div className="min-[700px]:hidden">{footer}</div>}
        </div>
      </div>
      {showWebChrome && <RightRail />}
    </div>
  );
}
