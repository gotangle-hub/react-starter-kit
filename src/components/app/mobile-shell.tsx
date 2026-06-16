import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The app is mobile-first (390×844 reference). MobileShell fills the viewport
 * height, centres a phone-width column on larger screens, and gives screens a
 * single scroll area. No fake status bar/notch — this is the real product.
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
  return (
    <div className="flex min-h-[100dvh] w-full justify-center bg-tg-page-board">
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
        {footer}
      </div>
    </div>
  );
}
