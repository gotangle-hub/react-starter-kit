import { Check } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Chip } from "@/components/brand/chip";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";
import { useSession } from "@/hooks/use-session";

function Swatch({
  name,
  className,
  note,
}: {
  name: string;
  className: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`h-16 rounded-md border border-tg-line ${className}`}
        aria-hidden
      />
      <div className="font-mono text-[11px] leading-tight text-tg-brown">
        {name}
        {note ? <span className="block text-tg-brown-soft">{note}</span> : null}
      </div>
    </div>
  );
}

export default function Foundation() {
  const { resolved, isSystem } = useTheme();
  const { backendReady } = useSession();

  const wired: { label: string; detail: string }[] = [
    { label: "Design tokens", detail: "ported to Tailwind theme (tokens/*.css + theme.jsx)" },
    { label: "G15 light/dark", detail: "single CSS-variable swap, system-follow + manual override" },
    { label: "React Router", detail: "Lovable structure: components / pages / hooks / lib" },
    { label: "Supabase data layer", detail: backendReady ? "configured" : "stubbed — runs without creds" },
    { label: "checkout() hook", detail: "full payment UI seam, no real processing (Stripe later)" },
  ];

  return (
    <div className="min-h-screen bg-tg-bg text-tg-ink">
      <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-12">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <Logo size={30} />
          <ThemeToggle />
        </header>

        {/* Editorial intro */}
        <section className="flex flex-col gap-5 animate-fade-in">
          <Chip>Foundation · Phase 0</Chip>
          <h1 className="font-display text-[clamp(40px,8vw,68px)] font-black leading-[0.96] tracking-display text-tg-ink">
            A space for designers.
          </h1>
          <p className="max-w-[60ch] font-body text-[17px] leading-relaxed text-tg-ink">
            The Lovable stack is up — Vite, React, TypeScript, Tailwind and
            shadcn/ui — with the Tangle design system ported intact. Every token
            swaps from one place, so light and dark are the same design.
          </p>
          <p className="tangle-meta">
            Theme in effect — <span className="text-tg-ink">{resolved}</span>
            {isSystem ? " · following system" : " · manual override"}
          </p>
        </section>

        {/* The G15 swap, made visible */}
        <section className="flex flex-col gap-5">
          <h2 className="tangle-eyebrow">The light / dark swap (G15)</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Swatch name="--tg-blue (fill)" className="bg-tg-blue" note="never swaps" />
            <Swatch
              name="--tg-blue-accent"
              className="bg-tg-blue-accent"
              note="blue ⇄ yellow"
            />
            <Swatch
              name="--tg-yellow (chip)"
              className="bg-tg-yellow"
              note="yellow ⇄ blue"
            />
            <Swatch name="--tg-terra (links)" className="bg-tg-terra" />
            <Swatch name="--tg-bg" className="bg-tg-bg" />
            <Swatch name="--tg-card" className="bg-tg-card" />
            <Swatch name="--tg-ink" className="bg-tg-ink" note="ink ⇄ beige" />
            <Swatch name="--tg-stone2" className="bg-tg-stone2" />
          </div>
          <p className="font-body text-[14px] leading-relaxed text-tg-brown">
            Toggle the control above (or change your OS appearance live) and
            watch blue and yellow swap while the verified tick below stays put —
            the one G15 exception.
          </p>
        </section>

        {/* Components */}
        <section className="grid gap-5 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Buttons &amp; marks</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Join</Button>
                <Button variant="outlineAccent">Connect</Button>
                <Button variant="ghost">Save</Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-[15px] font-semibold text-tg-ink">
                  Studio Mara
                </span>
                <VerifiedBadge size={16} />
                <span className="tangle-meta">verified · stays yellow</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Type specimen</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <span className="font-serif text-[28px] italic leading-none tracking-[-0.02em] text-tg-ink">
                Newsreader — editorial serif
              </span>
              <span className="font-display text-[15px] text-tg-ink">
                Archivo — grotesque body &amp; UI
              </span>
              <span className="font-mono text-[13px] text-tg-brown">
                IBM Plex Mono — 2026-06-16 · Dubai
              </span>
              <span className="font-marker text-[26px] text-tg-blue-accent">
                Caveat — marker accent
              </span>
            </CardContent>
          </Card>
        </section>

        {/* Foundation status */}
        <section className="flex flex-col gap-4">
          <h2 className="tangle-eyebrow">What Phase 0 wired up</h2>
          <ul className="flex flex-col gap-2.5">
            {wired.map((w) => (
              <li key={w.label} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-pill bg-tg-blue text-white">
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="font-body text-[15px] leading-snug text-tg-ink">
                  <span className="font-semibold">{w.label}</span>
                  <span className="text-tg-brown"> — {w.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="border-t border-tg-line pt-6">
          <p className="tangle-meta">
            Next: build the first journey on this foundation — Designer ·
            screens 01–99.
          </p>
        </footer>
      </div>
    </div>
  );
}
