import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** Subtle "promoted" label for boosted content (G6) — never shouts. */
export function PromotedTag() {
  return (
    <span className="inline-flex items-center rounded-chip bg-tg-stone2 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-tg-brown">
      Promoted
    </span>
  );
}

/** A back header with a title, for pushed (non-tab) screens. */
export function BackHeader({
  title,
  right,
  onBack,
}: {
  title?: ReactNode;
  right?: ReactNode;
  onBack?: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-none items-center gap-3 border-b border-tg-line px-[18px] py-3">
      <button type="button" onClick={onBack ?? (() => navigate(-1))} aria-label="Back">
        <ArrowLeft size={22} className="text-tg-ink" />
      </button>
      {title && <span className="flex-1 font-display text-[15px] font-semibold text-tg-ink">{title}</span>}
      {right ?? <span className="flex-1" />}
    </div>
  );
}

/** Pull-to-refresh hint (G7). A quiet affordance at the top of feeds/lists. */
export function RefreshHint({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-2", className)}>
      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-tg-brown-soft">
        Pull to refresh
      </span>
    </div>
  );
}
