import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { MobileShell } from "@/components/app/mobile-shell";
import { routes } from "@/lib/routes";

/**
 * 10 · Welcome — community message (G12). Shown once, immediately after the
 * account is created. "Start exploring" continues into the once-only tour.
 */
export default function WelcomeToTangle() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || routes.tour; // designer tour by default
  return (
    <MobileShell className="bg-tg-emph text-white">
      <div className="relative flex flex-1 flex-col justify-center overflow-hidden bg-tg-emph px-[26px]">
        <span className="pointer-events-none absolute -right-[60px] -top-[60px] h-[220px] w-[220px] rounded-pill bg-tg-yellow/15" />
        <span className="pointer-events-none absolute -bottom-[80px] -left-[50px] h-[200px] w-[200px] rounded-pill bg-white/[0.06]" />

        <div className="relative">
          <Logo size={30} onDark />
          <h1 className="my-5 font-serif text-[36px] font-medium leading-[1.05] tracking-[-0.03em] text-white">
            Welcome to the network.
          </h1>

          <div className="rounded-lg border border-white/15 bg-white/10 p-[22px] backdrop-blur">
            <Sparkles size={20} className="text-tg-yellow" />
            <p className="mt-3 font-body text-[16px] leading-[1.6] text-white">
              You're part of a community built on ideas, not noise. Make work with
              people who share your passion, credit each other openly, and keep it
              fair.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-none bg-tg-emph px-[22px] pb-7 pt-4">
        <button
          type="button"
          onClick={() => navigate(next)}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-DEFAULT bg-white font-display text-[15px] font-semibold text-tg-ink active:scale-[0.99]"
        >
          Start exploring
          <ArrowRight size={17} className="text-tg-ink" />
        </button>
      </div>
    </MobileShell>
  );
}
