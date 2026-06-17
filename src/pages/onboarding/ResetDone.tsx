import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

/** 04 · Password updated — back to Sign in. */
export default function ResetDone() {
  const navigate = useNavigate();
  return (
    <MobileShell
      footer={
        <div className="flex-none px-[22px] pb-7">
          <Button full size="lg" onClick={() => navigate(routes.signIn, { replace: true })}>
            Sign in
          </Button>
        </div>
      }
    >
      <div className="flex-none px-[22px] pt-1.5">
        <Logo size={26} />
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-[22px] text-center">
        <span className="mb-5 inline-flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-tg-blue-accent/15 text-tg-blue-accent">
          <Check size={34} strokeWidth={2.4} />
        </span>
        <h1 className="mb-2.5 font-serif text-[27px] font-medium leading-[1.08] tracking-[-0.02em]">
          Password updated.
        </h1>
        <p className="max-w-[260px] font-body text-[14px] leading-relaxed text-tg-brown">
          You're all set. Sign in with your new password.
        </p>
      </div>
    </MobileShell>
  );
}
