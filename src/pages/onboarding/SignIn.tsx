import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Meta } from "@/components/brand/atoms";
import { MobileShell } from "@/components/app/mobile-shell";
import { SocialButton, TextField } from "@/components/app/fields";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { authService } from "@/services/auth";
import { lovable } from "@/integrations/lovable/index";

/** 05 · Sign in (G1). Only reachable when logged out. */
export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    const { error: err } = await authService.signInWithPassword(email.trim(), password);
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate(routes.home);
  };

  const handleGoogle = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + routes.home,
    });
    if (result.error) {
      setError(result.error.message ?? "Google sign-in failed.");
      return;
    }
    if (result.redirected) return;
    navigate(routes.home);
  };

  return (
    <MobileShell
      footer={
        <div className="flex-none px-[22px] pb-7">
          <Button full size="lg" onClick={handleSignIn} disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
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
          <SocialButton brand="apple" disabled />
          <SocialButton brand="google" onClick={handleGoogle} />
        </div>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-tg-line" />
          <Meta>or</Meta>
          <span className="h-px flex-1 bg-tg-line" />
        </div>

        <div className="flex flex-col gap-3">
          <TextField
            label="Email"
            mono
            icon={<Mail size={17} />}
            type="email"
            placeholder="you@studio.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            icon={<Lock size={17} />}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <p className="mt-2.5 text-[12.5px] text-tg-terra" role="alert">
            {error}
          </p>
        )}
        <div className="mt-2.5 text-right">
          <button type="button" onClick={() => navigate(routes.forgotPassword)}>
            <Meta>Forgot password?</Meta>
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
