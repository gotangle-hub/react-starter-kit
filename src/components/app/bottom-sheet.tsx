import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * Bottom sheet used for menus, comments, pin pickers, moderation flows, etc.
 * Renders a dimmed scrim over the phone column with a rounded panel that slides
 * up from the bottom. `onClose` defaults to navigating back.
 */
export function BottomSheet({
  children,
  title,
  onClose,
  className,
  full = false,
}: {
  children: ReactNode;
  title?: ReactNode;
  onClose?: () => void;
  className?: string;
  /** Tall sheet (e.g. comments) vs auto-height (menus). */
  full?: boolean;
}) {
  const navigate = useNavigate();
  const close = onClose ?? (() => navigate(-1));
  return (
    <div className="flex min-h-[100dvh] w-full justify-center bg-tg-page-board">
      <div className="relative flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden">
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute inset-0 bg-black/45 animate-fade-in"
        />
        <div
          className={cn(
            "relative mt-auto flex flex-col rounded-t-xl border-t border-tg-line bg-tg-bg",
            full ? "h-[88dvh]" : "max-h-[88dvh]",
            className,
          )}
        >
          <div className="flex flex-none items-center justify-center pt-2.5">
            <span className="h-1 w-10 rounded-pill bg-tg-line" />
          </div>
          {title && (
            <div className="flex flex-none items-center justify-between px-5 pb-3 pt-3">
              <div className="font-display text-[16px] font-semibold text-tg-ink">{title}</div>
              <button type="button" onClick={close} className="text-[13px] font-medium text-tg-brown">
                Close
              </button>
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
