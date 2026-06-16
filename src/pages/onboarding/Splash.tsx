import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/brand/logo";
import { MobileShell } from "@/components/app/mobile-shell";
import { useSession } from "@/hooks/use-session";
import { useOnboarding } from "@/hooks/use-onboarding";
import { routes } from "@/lib/routes";

/**
 * 01 · Splash (G1). Centred wordmark — only the ".t" is coloured (blue light /
 * yellow dark via --tg-blue-accent). A loading ring spins below (yellow ring in
 * light, blue ring in dark via --tg-yellow). Auto-advances; if a session exists
 * and onboarding is done, skips straight to Home.
 */
export default function Splash() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSession();
  const { seen } = useOnboarding();

  useEffect(() => {
    const t = setTimeout(() => {
      if (isAuthenticated && seen) navigate(routes.home, { replace: true });
      else navigate(routes.welcome1, { replace: true });
    }, 1600);
    return () => clearTimeout(t);
  }, [isAuthenticated, seen, navigate]);

  return (
    <MobileShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <Logo size={76} className="tracking-[-0.03em]" />
        <span className="font-mono text-[13px] uppercase tracking-[0.18em] text-tg-brown-soft">
          A space for designers
        </span>
      </div>
      <div className="flex flex-none justify-center pb-10">
        <span
          className="h-[30px] w-[30px] animate-spin rounded-pill border-2 border-tg-ink-12"
          style={{ borderTopColor: "var(--tg-yellow)", animationDuration: "0.9s" }}
        />
      </div>
    </MobileShell>
  );
}
