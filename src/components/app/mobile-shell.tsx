import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { useSession } from "@/hooks/use-session";
import { WebSidebar } from "@/components/web/web-sidebar";

/**
 * The app is mobile-first (390×844 reference). MobileShell fills the viewport
 * height, centres a phone-width column on larger screens, and gives screens a
 * single scroll area. No fake status bar/notch — this is the real product.
 *
 * On desktop browsers (≥1024px, non-native), an Instagram-style sidebar is
 * rendered to the left of the phone-width content column. The native app
 * (Capacitor) always renders the mobile shell regardless of viewport, so the
 * App Store build is unaffected.
 */
export function MobileShell({
  children,
  className,
  contentClassName,
  /** Render a sticky footer (e.g. TabBar or a primary CTA) outside the scroll area. */
  footer,
  /** Render a sticky header outside the scroll area. */
  header,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  footer?: ReactNode;
  header?: ReactNode;
}) {
  const isDesktop = useIsDesktop();
  const { isAuthenticated } = useSession();
  const showSidebar = isDesktop && isAuthenticated;

  return (
    <div className="flex min-h-[100dvh] w-full bg-tg-page-board lg:justify-start">
      {showSidebar && <WebSidebar />}
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
    </div>
  );
}
