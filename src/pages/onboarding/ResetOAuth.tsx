import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

/** 05 · This email signs in with Google / institution — no password to reset. */
export default function ResetOAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { providers = [] } = (location.state ?? {}) as { providers?: string[] };

  const label = formatProviders(providers);

  return (
    <MobileShell
      footer={
        <div className="flex-none px-[22px] pb-7">
          <Button full size="lg" onClick={() => navigate(routes.signIn, { replace: true })}>
            Back to sign in
          </Button>
        </div>
      }
    >
      <div className="flex flex-none items-center justify-between px-[22px] pt-1.5">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={22} className="text-tg-ink" />
        </button>
        <Logo size={22} />
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-[22px] text-center">
        <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-[18px] bg-tg-stone2 text-tg-brown">
          <Lock size={30} />
        </span>
        <h1 className="mb-2.5 font-serif text-[25px] font-medium leading-[1.08] tracking-[-0.02em]">
          No password needed.
        </h1>
        <p className="max-w-[280px] font-body text-[14px] leading-relaxed text-tg-brown">
          This email signs in with{" "}
          <span className="font-semibold text-tg-ink">{label}</span>. Use that option on the sign-in
          screen instead.
        </p>
      </div>
    </MobileShell>
  );
}

function formatProviders(providers: string[]): string {
  const known: Record<string, string> = {
    google: "Google",
    azure: "Microsoft",
    apple: "Apple",
    saml: "your institution",
  };
  const mapped = providers.map((p) => known[p] ?? p);
  if (mapped.length === 0) return "Google or your institution";
  if (mapped.length === 1) return mapped[0];
  return `${mapped.slice(0, -1).join(", ")} or ${mapped[mapped.length - 1]}`;
}
