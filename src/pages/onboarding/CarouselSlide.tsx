import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Chip } from "@/components/brand/chip";
import { Dots } from "@/components/brand/atoms";
import { PhotoTile } from "@/components/brand/atoms";
import { MobileShell } from "@/components/app/mobile-shell";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function CarouselSlide({
  index,
  chip,
  head,
  sub,
  body,
  visual,
  next,
  cta = "Continue",
}: {
  index: number;
  chip: string;
  head: string;
  sub: string;
  body: string;
  visual: ReactNode;
  next: string;
  cta?: string;
}) {
  const navigate = useNavigate();
  return (
    <MobileShell>
      <div className="flex flex-none items-center justify-between px-[22px] pt-1.5">
        <Logo size={19} />
        <button
          type="button"
          onClick={() => navigate(routes.accountType)}
          className="text-[13px] font-medium text-tg-brown"
        >
          Skip
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center px-[22px]">
        <div className="mb-6">{visual}</div>
        <Chip>{chip}</Chip>
        <h1 className="mt-4 font-serif text-[40px] font-medium leading-none tracking-[-0.025em] text-tg-ink">
          {head}
        </h1>
        <p className="mt-1.5 font-serif text-[22px] font-medium leading-[1.1] tracking-[-0.02em] text-tg-blue-accent">
          {sub}
        </p>
        <p className="mt-4 max-w-[320px] font-body text-[15.5px] leading-relaxed text-tg-brown">
          {body}
        </p>
      </div>

      <div className="flex flex-none items-center justify-between px-[22px] pb-8">
        <Dots count={3} index={index} />
        <Button onClick={() => navigate(next)}>
          {cta}
          <ArrowRight size={17} />
        </Button>
      </div>
    </MobileShell>
  );
}

/** Slide 1 visual — a thread connecting a project to its makers (decorative). */
export function ThreadVisual() {
  return (
    <div className="relative mx-[-4px] mt-1 h-[230px]">
      <svg viewBox="0 0 350 230" className="absolute inset-0 h-full w-full">
        <path d="M95 70 C 150 70, 150 175, 250 175" fill="none" stroke="var(--tg-blue-accent)" strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" />
        <path d="M250 60 C 180 60, 200 130, 110 150" fill="none" stroke="var(--tg-blue-accent)" strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" />
      </svg>
      <div className="absolute left-1.5 top-4">
        <PhotoTile width={108} height={108} radius={14} swatch="#E7DDCB" label="project" />
      </div>
      <div className="absolute right-2 top-1.5">
        <DecoChip tint="#A85C3A" />
      </div>
      <div className="absolute bottom-1 right-[30px]">
        <DecoChip tint="#0107FF" />
      </div>
      <div className="absolute bottom-[22px] left-[30px]">
        <PhotoTile width={72} height={72} radius={12} swatch="#161514" />
      </div>
    </div>
  );
}

function DecoChip({ tint }: { tint: string }) {
  // Abstract, non-personal chip used purely for visual rhythm in onboarding.
  return (
    <div className="flex items-center gap-2 rounded-pill border border-tg-line bg-tg-card py-1.5 pl-1.5 pr-3 shadow-card">
      <span
        className="inline-block h-[30px] w-[30px] rounded-pill"
        style={{ background: tint }}
        aria-hidden
      />
      <span className="block h-1.5 w-16 rounded-pill bg-tg-line" aria-hidden />
    </div>
  );
}

/** Slide 2 visual — the interconnected creative network. */
export function NetVisual() {
  const cards = ["Projects", "Creators", "Competitions", "Call outs", "Collaborations", "Studios"];
  const pos = [[8, 8], [238, 10], [2, 170], [250, 172], [120, 2], [120, 196]];
  const lines = [[60, 40, 175, 115], [290, 46, 175, 115], [40, 150, 175, 115], [300, 160, 175, 115], [170, 30, 175, 115]];
  return (
    <div className="relative h-[230px]">
      <svg viewBox="0 0 350 230" className="absolute inset-0 h-full w-full">
        {lines.map((l, i) => (
          <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke="var(--tg-blue-accent)" strokeWidth="1.5" strokeOpacity="0.45" />
        ))}
        <circle cx="175" cy="115" r="5" fill="var(--tg-blue-accent)" />
      </svg>
      {pos.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-md border border-tg-line bg-tg-card px-3 py-1.5 font-display text-[12px] font-semibold text-tg-ink shadow-card"
          style={{ left: p[0], top: p[1] }}
        >
          {cards[i]}
        </div>
      ))}
    </div>
  );
}
