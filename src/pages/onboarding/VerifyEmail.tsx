import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { routes } from "@/lib/routes";

const RESEND_COOLDOWN = 45;

/**
 * Email verification (6-digit OTP) — for every email/password signup.
 * OAuth & institution logins are pre-verified by the IdP and never hit this.
 *
 * Navigation contract: previous screen pushes location.state
 *   { email: string, next: string }
 * where `next` is the route to continue to once the code is accepted.
 */
export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as { email?: string; next?: string };
  const email = state.email ?? "";
  const next = state.next ?? routes.consent;

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resentAt, setResentAt] = useState<number | null>(null);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!email) navigate(routes.signup, { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const setDigit = (i: number, v: string) => {
    const ch = v.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = ch;
      return next;
    });
    if (ch && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const arr = Array(6).fill("");
    for (let i = 0; i < text.length; i++) arr[i] = text[i];
    setDigits(arr);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleKeyDown = (i: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const code = digits.join("");
  const ready = code.length === 6 && !busy;

  const verify = async () => {
    if (!ready) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });
    setBusy(false);
    if (err) {
      setError(err.message || "That code didn't match. Try again.");
      return;
    }
    navigate(next, { replace: true });
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setError(null);
    const { error: err } = await supabase.auth.resend({ type: "signup", email });
    if (err) {
      setError(err.message || "Couldn't resend. Try again in a moment.");
      return;
    }
    setResentAt(Date.now());
    setCooldown(RESEND_COOLDOWN);
  };

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          {error && (
            <p className="mb-2 text-[12.5px] text-tg-terra" role="alert">
              {error}
            </p>
          )}
          <Button full size="lg" onClick={verify} disabled={!ready}>
            {busy ? "Verifying…" : "Verify email"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-none items-center gap-3 px-[22px] pt-1.5">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={22} className="text-tg-ink" />
        </button>
        <span className="font-display text-[15px] font-semibold">Verify your email</span>
      </div>

      <div className="px-[22px] py-3.5">
        <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-pill border-[1.5px] border-tg-line bg-tg-card">
          <MailCheck size={20} className="text-tg-blue-accent" />
        </span>
        <h1 className="mb-2 font-serif text-[27px] font-medium leading-[1.08] tracking-[-0.02em]">
          Check your inbox.
        </h1>
        <p className="mb-1 font-body text-[14px] leading-relaxed text-tg-brown">
          We sent a 6-digit code to{" "}
          <span className="font-mono text-tg-ink">{email}</span>.
        </p>
        <Meta className="mb-5 block">Enter it below to activate your account.</Meta>

        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={handleKeyDown(i)}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              aria-label={`Digit ${i + 1}`}
              className="h-14 w-12 rounded-DEFAULT border border-tg-line bg-tg-card text-center font-mono text-[22px] text-tg-ink outline-none focus:border-tg-blue-accent"
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Meta>Didn't get it? Check spam.</Meta>
          <button
            type="button"
            onClick={resend}
            disabled={cooldown > 0}
            className="font-display text-[12.5px] font-semibold text-tg-blue-accent disabled:text-tg-brown-soft"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </div>
        {resentAt && cooldown > 0 && (
          <Meta className="mt-2 block">A fresh code is on its way.</Meta>
        )}
      </div>
    </MobileShell>
  );
}
