import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Meta } from "@/components/brand/atoms";
import { MobileShell } from "@/components/app/mobile-shell";
import { SocialButton, TextField } from "@/components/app/fields";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

/** 05 · Sign in (G1). Only reachable when logged out. */
export default function SignIn() {
  const navigate = useNavigate();
  return (
    <MobileShell
      footer={
        <div className="flex-none px-[22px] pb-7">
          {/* On success: persist session and go Home (G1). Stubbed until backend. */}
          <Button full size="lg" onClick={() => navigate(routes.home)}>
            Sign in
          </Button>
          <p className="mt-3.5 text-center">
            <Meta>
              New here?{" "}
              <button type="button" className="text-tg-blue-accent" onClick={() => navigate(routes.accountType)}>
                Create an account
              </button>
            </Meta>
          </p>
        </div>
      }
    >
      <div className="flex-none px-[22px] pt-1.5">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={22} className="text-tg-ink" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center px-[22px]">
        <Logo size={30} />
        <h1 className="mt-5 font-serif text-[34px] font-medium leading-[1.04] tracking-[-0.025em]">
          Welcome back to the network.
        </h1>
        <p className="mt-2.5 max-w-[300px] font-body text-[15px] leading-relaxed text-tg-brown">
          Sign in to pick up your collaborations, call outs and connections.
        </p>

        <div className="mt-7 flex flex-col gap-2.5">
          <SocialButton brand="apple" />
          <SocialButton brand="google" />
        </div>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-tg-line" />
          <Meta>or</Meta>
          <span className="h-px flex-1 bg-tg-line" />
        </div>

        <div className="flex flex-col gap-3">
          <TextField label="Email" mono icon={<Mail size={17} />} type="email" placeholder="you@studio.co" defaultValue="" />
          <TextField label="Password" icon={<Lock size={17} />} type="password" placeholder="••••••••" />
        </div>
        <div className="mt-2.5 text-right">
          <button type="button">
            <Meta>Forgot password?</Meta>
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
