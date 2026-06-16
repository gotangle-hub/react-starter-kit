import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { BackHeader } from "@/components/app/bits";
import { Chip } from "@/components/brand/chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "blue" | "yellow" | "ok";

/** Confirmation state (85–93). Centred editorial success screen. */
export function StateSuccess({
  icon: Icon,
  tone = "ok",
  chip,
  title,
  body,
  primary,
  secondary,
}: {
  icon: LucideIcon;
  tone?: Tone;
  chip: string;
  title: string;
  body: string;
  primary: { label: string; to: string };
  secondary?: { label: string; to: string };
}) {
  const navigate = useNavigate();
  // ok = blue fill (stays blue); blue = blue accent; yellow = yellow accent (swaps)
  const ring =
    tone === "yellow" ? "bg-tg-yellow text-tg-ink" : tone === "blue" ? "bg-tg-blue-accent/15 text-tg-blue-accent" : "bg-tg-blue text-white";

  return (
    <MobileShell>
      <BackHeader />
      <div className="flex flex-1 flex-col items-center justify-center px-9 text-center">
        <span className={cn("mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-pill", ring)}>
          <Icon size={28} strokeWidth={2} />
        </span>
        <Chip>{chip}</Chip>
        <h1 className="mt-3.5 font-serif text-[30px] font-medium leading-[1.08] tracking-[-0.025em]">{title}</h1>
        <p className="mt-3 max-w-[300px] font-body text-[15px] leading-relaxed text-tg-brown">{body}</p>
        <div className="mt-7 flex w-full max-w-[300px] flex-col gap-2.5">
          <Button full size="lg" onClick={() => navigate(primary.to)}>
            {primary.label}
          </Button>
          {secondary && (
            <Button full size="lg" variant="ghost" onClick={() => navigate(secondary.to)}>
              {secondary.label}
            </Button>
          )}
        </div>
      </div>
    </MobileShell>
  );
}

const TAB_FOOTER: Record<string, boolean> = {
  home: true,
  explore: true,
  search: true,
  messages: true,
  profile: true,
};

/** Empty state (94–99). Keeps the tab bar + header; real empty copy, never placeholder. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  cta,
  header,
  showTabBar = true,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  cta?: { label: string; to: string; icon?: LucideIcon };
  header?: React.ReactNode;
  showTabBar?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <MobileShell footer={showTabBar && TAB_FOOTER ? <AppTabBar /> : undefined}>
      {header ?? <BackHeader />}
      <div className="flex flex-1 flex-col items-center justify-center px-9 text-center">
        <span className="mb-[18px] flex h-[66px] w-[66px] items-center justify-center rounded-pill bg-tg-stone2">
          <Icon size={28} className="text-tg-brown-soft" />
        </span>
        <h2 className="font-display text-[18px] font-semibold text-tg-ink">{title}</h2>
        <p className="mt-2 max-w-[270px] font-body text-[13.5px] leading-[1.55] text-tg-brown">{body}</p>
        {cta && (
          <div className="mt-[18px]">
            <Button variant="outline" onClick={() => navigate(cta.to)}>
              {cta.icon && <cta.icon size={15} />}
              {cta.label}
            </Button>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
