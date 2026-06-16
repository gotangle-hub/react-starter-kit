import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { cn } from "@/lib/utils";

export function SettingsScaffold({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <MobileShell>
      <BackHeader title={title} />
      <div className="min-h-0 flex-1 overflow-y-auto px-[18px] py-4 pb-10">{children}</div>
    </MobileShell>
  );
}

export interface SettingRow {
  icon: LucideIcon;
  label: string;
  value?: string;
  sub?: string;
  to?: string;
  verified?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

export function SettingsGroup({ title, rows }: { title?: string; rows: SettingRow[] }) {
  const navigate = useNavigate();
  return (
    <div className="mb-6">
      {title && (
        <div className="mb-2 px-1 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">{title}</div>
      )}
      <div className="overflow-hidden rounded-lg border border-tg-line bg-tg-card">
        {rows.map((r, i) => (
          <button
            key={r.label}
            type="button"
            onClick={() => (r.onClick ? r.onClick() : r.to ? navigate(r.to) : undefined)}
            className={cn("flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-tg-stone2", i > 0 && "border-t border-tg-line-soft")}
          >
            <r.icon size={19} className={r.danger ? "text-destructive" : "text-tg-ink"} />
            <span className="flex-1">
              <span className={cn("flex items-center gap-1.5 font-display text-[14.5px] font-medium", r.danger ? "text-destructive" : "text-tg-ink")}>
                {r.label}
                {r.verified && <VerifiedBadge size={15} />}
              </span>
              {r.sub && <span className="block font-body text-[12.5px] text-tg-brown">{r.sub}</span>}
            </span>
            {r.value && <span className="font-mono text-[12px] text-tg-brown">{r.value}</span>}
            {!r.danger && <ChevronRight size={17} className="text-tg-brown-soft" />}
          </button>
        ))}
      </div>
    </div>
  );
}

/** A labelled toggle row for notification/privacy settings. */
export function ToggleRow({
  label,
  sub,
  defaultOn = false,
}: {
  label: string;
  sub?: string;
  defaultOn?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 border-t border-tg-line-soft px-4 py-3.5 first:border-t-0">
      <span className="flex-1">
        <span className="block font-display text-[14.5px] font-medium text-tg-ink">{label}</span>
        {sub && <span className="block font-body text-[12.5px] text-tg-brown">{sub}</span>}
      </span>
      <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />
      <span className="relative h-6 w-10 flex-none rounded-pill bg-tg-line transition-colors peer-checked:bg-tg-blue">
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-pill bg-white transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
