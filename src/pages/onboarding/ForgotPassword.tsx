import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Meta } from "@/components/brand/atoms";
import { MobileShell } from "@/components/app/mobile-shell";
import { TextField } from "@/components/app/fields";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { supabase } from "@/integrations/supabase/client";

/** 01 · Forgot password — enter email, send 6-digit OTP. */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const send = async () => {
    if (!isValidEmail) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setError(null);
    const cleaned = email.trim();

    // 1. Determine how this email signs in (password vs OAuth/institution).
    let method: "password" | "oauth" | "unknown" = "password";
    let providers: string[] = [];
    try {
      const { data, error: err } = await supabase.functions.invoke("check-recovery-method", {
        body: { email: cleaned },
      });
      if (!err && data) {
        method = (data as { method?: string }).method as typeof method;
        providers = (data as { providers?: string[] }).providers ?? [];
      }
    } catch {
      // Soft-fail: proceed as password to never reveal account state.
    }

    if (method === "oauth") {
      setBusy(false);
      navigate(routes.resetOAuth, { state: { email: cleaned, providers } });
      return;
    }

    // 2. Trigger the recovery email (OTP). Don't surface errors — privacy.
    await supabase.auth.resetPasswordForEmail(cleaned);
    setBusy(false);
    navigate(routes.resetCode, { state: { email: cleaned } });
  };

  return (
    <MobileShell
      footer={
        <div className="flex-none px-[22px] pb-7">
          <Button full size="lg" onClick={send} disabled={busy}>
            {busy ? "Sending…" : "Send reset code"}
          </Button>
          <p className="mt-3.5 text-center">
            <Meta>
              Remembered it?{" "}
              <button
                type="button"
                className="text-tg-blue-accent"
                onClick={() => navigate(routes.signIn)}
              >
                Sign in
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
        <Logo size={26} />
        <p className="mt-5 font-display text-[11px] font-bold uppercase tracking-[0.13em] text-tg-brown-soft">
          Reset password
        </p>
        <h1 className="mt-2 font-serif text-[28px] font-medium leading-[1.08] tracking-[-0.02em]">
          Forgot your password?
        </h1>
        <p className="mt-2.5 max-w-[320px] font-body text-[14px] leading-relaxed text-tg-brown">
          Enter the email linked to your account and we'll send a code to reset it.
        </p>

        <div className="mt-6">
          <TextField
            label="Email"
            mono
            icon={<Mail size={17} />}
            type="email"
            placeholder="you@studio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        {error && (
          <p className="mt-2.5 text-[12.5px] text-tg-terra" role="alert">
            {error}
          </p>
        )}
      </div>
    </MobileShell>
  );
}
