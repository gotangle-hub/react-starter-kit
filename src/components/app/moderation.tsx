import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { BottomSheet } from "@/components/app/bottom-sheet";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Reason picker sheet (report / block / unconnect / uncollaborate). A radio list
 * of reasons + an "Other" free-text, a confidential-review note, and a submit
 * that routes onward.
 */
export function ReasonSheet({
  title,
  subtitle,
  reasons,
  note,
  submitLabel,
  onSubmit,
  danger = false,
}: {
  title: string;
  subtitle?: string;
  reasons: string[];
  note?: string;
  submitLabel: string;
  onSubmit: () => void;
  danger?: boolean;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [other, setOther] = useState(false);
  const accent = danger ? "border-destructive" : "border-tg-blue-accent";
  const dot = danger ? "bg-destructive" : "bg-tg-blue-accent";

  return (
    <BottomSheet title={title} full>
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2">
          {subtitle && <p className="mb-3 font-body text-[14px] leading-snug text-tg-brown">{subtitle}</p>}
          {reasons.map((r, i) => {
            const on = picked === i && !other;
            return (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setPicked(i);
                  setOther(false);
                }}
                className="flex w-full items-center gap-3 border-b border-tg-line-soft py-3.5 text-left"
              >
                <span className={cn("flex h-5 w-5 flex-none items-center justify-center rounded-pill border-[1.5px]", on ? accent : "border-tg-line")}>
                  {on && <span className={cn("h-2.5 w-2.5 rounded-pill", dot)} />}
                </span>
                <span className="flex-1 font-body text-[14px] leading-snug text-tg-ink">{r}</span>
              </button>
            );
          })}
          <button type="button" onClick={() => setOther(true)} className="flex w-full items-start gap-3 py-3.5 text-left">
            <span className={cn("mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-pill border-[1.5px]", other ? accent : "border-tg-line")}>
              {other && <span className={cn("h-2.5 w-2.5 rounded-pill", dot)} />}
            </span>
            <span className="flex-1">
              <span className="font-body text-[14px] text-tg-ink">Other</span>
              {other && (
                <textarea
                  autoFocus
                  rows={3}
                  placeholder="Tell us more…"
                  className="mt-2 w-full resize-none rounded-DEFAULT border border-tg-line bg-tg-card px-3 py-2.5 text-[14px] text-tg-ink outline-none placeholder:text-tg-brown-soft focus:border-tg-blue-accent"
                />
              )}
            </span>
          </button>
          {note && (
            <div className="mt-2 flex items-center gap-2">
              <Check size={13} className="text-tg-brown-soft" />
              <Meta>{note}</Meta>
            </div>
          )}
        </div>
        <div className="flex-none border-t border-tg-line px-5 py-3 pb-6">
          <Button full size="lg" variant={danger ? "destructive" : "primary"} disabled={picked === null && !other} onClick={onSubmit}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}

/** "Are you sure" destructive confirm dialog. */
export function ConfirmSheet({
  icon: Icon,
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  danger = true,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  danger?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <BottomSheet>
      <div className="px-6 pb-7 pt-2 text-center">
        <span className={cn("mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-pill", danger ? "bg-destructive/12 text-destructive" : "bg-tg-stone2 text-tg-ink")}>
          <Icon size={24} />
        </span>
        <h2 className="font-serif text-[24px] font-medium tracking-[-0.02em] text-tg-ink">{title}</h2>
        <p className="mx-auto mt-2 max-w-[300px] font-body text-[14.5px] leading-relaxed text-tg-brown">{body}</p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Button full size="lg" variant={danger ? "destructive" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button full size="lg" variant="ghost" onClick={() => navigate(-1)}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}

export interface MenuAction {
  icon: LucideIcon;
  label: string;
  sub?: string;
  danger?: boolean;
  to?: string;
  onClick?: () => void;
}

/** ⋯ action menu (post / person). */
export function ActionMenu({ title, actions }: { title?: string; actions: MenuAction[] }) {
  const navigate = useNavigate();
  return (
    <BottomSheet title={title}>
      <div className="px-2 pb-6 pt-1">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => (a.onClick ? a.onClick() : a.to ? navigate(a.to) : undefined)}
            className="flex w-full items-center gap-3.5 rounded-DEFAULT px-4 py-3.5 text-left hover:bg-tg-stone2"
          >
            <a.icon size={20} className={a.danger ? "text-destructive" : "text-tg-ink"} />
            <span className="flex-1">
              <span className={cn("block font-display text-[15px] font-medium", a.danger ? "text-destructive" : "text-tg-ink")}>{a.label}</span>
              {a.sub && <span className="block font-body text-[12.5px] text-tg-brown">{a.sub}</span>}
            </span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
