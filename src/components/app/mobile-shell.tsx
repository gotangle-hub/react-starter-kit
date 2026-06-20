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
 * Web layouts (non-native, ≥1024px):
 *   tablet  1024–1439px → icon-only sidebar + phone column
 *   desktop ≥1440px     → labelled sidebar + phone column + right rail
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
    <div className="flex min-h-[100dvh] w-full bg-tg-page-board lg:justify-start">
      {showWebChrome && <WebSidebar collapsed={sidebarCollapsed} />}
      <div className="flex min-h-[100dvh] flex-1 justify-center">
        <div
          className={cn(
            "relative flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden bg-tg-bg text-tg-ink",
            "lg:my-0 lg:h-[100dvh]",
            className,
          )}
        >
          {header}
          <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", contentClassName)}>
            {children}
          </div>
          {/* Hide bottom tab bar on desktop — sidebar replaces it. */}
          {footer && <div className="lg:hidden">{footer}</div>}
        </div>
      </div>
      {showWebChrome && <RightRail />}
    </div>
  );
}

