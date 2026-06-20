import type { ReactNode } from "react";
import { useWebViewport } from "@/hooks/use-is-desktop";
import { useSession } from "@/hooks/use-session";
import { WebSidebar } from "@/components/web/web-sidebar";
import { WebFlyouts } from "@/components/web/flyouts";
import { cn } from "@/lib/utils";

/**
 * Tangle WEB page shell — desktop / tablet layout primitive.
 *
 * Mirrors the reference (`web.jsx` → `WebPage`): fixed left sidebar + a
 * centered main column with configurable max width. Optional `rail` slot for
 * the per-page right rail (Feed has one; Explore/Profile/etc. do not).
 *
 * Page components decide when to render this — typically:
 *   const vp = useWebViewport();
 *   if (vp !== "mobile") return <WebPage>...</WebPage>;
 *   return <MobileShell>...mobile...</MobileShell>;
 *
 * This keeps the mobile UI byte-for-byte unchanged: WebPage is only mounted on
 * tablet/desktop, and never inside the native Capacitor app.
 */
export function WebPage({
  children,
  rail,
  maxWidth = 1180,
  pad = "32px",
  className,
}: {
  children: ReactNode;
  rail?: ReactNode;
  /** Inner max-width in px. Reference uses 1000 (with rail) or 1180. */
  maxWidth?: number;
  /** CSS padding shorthand for the inner container. */
  pad?: string;
  className?: string;
}) {
  const viewport = useWebViewport();
  const { isAuthenticated } = useSession();
  const collapsed = viewport === "tablet";
  // Only show sidebar to authenticated users (logged-out lands on sign in).
  const showSidebar = isAuthenticated;

  return (
    <div className="flex min-h-[100dvh] w-full bg-tg-page-board font-display text-tg-ink">
      {showSidebar && <WebSidebar collapsed={collapsed} />}
      <main className="min-h-[100dvh] min-w-0 flex-1 overflow-y-auto">
        <div
          className={cn("mx-auto box-border", className)}
          style={{ maxWidth, padding: pad }}
        >
          {rail ? (
            <div className="flex items-start justify-center gap-9">
              <div className="min-w-0 flex-[0_1_600px]">{children}</div>
              <div className="hidden flex-none min-[1100px]:block">{rail}</div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
      {showSidebar && <WebFlyouts />}
    </div>
  );
}
