import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { routes } from "@/lib/routes";

const RESEND_COOLDOWN = 45;

/** 02 · Enter the 6-digit recovery code we emailed. */
export default function ResetCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = ((location.state ?? {}) as { email?: string }).email ?? "";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!email) navigate(routes.forgotPassword, { replace: true });
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
      type: "recovery",
    });
    setBusy(false);
    if (err) {
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("expired")) setError("That code has expired. Resend a new one.");
      else if (msg.includes("invalid")) setError("That code didn't match. Try again.");
      else setError(err.message || "Couldn't verify that code.");
      return;
    }
    navigate(routes.resetNewPassword, { state: { email }, replace: true });
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setError(null);
    await supabase.auth.resetPasswordForEmail(email);
    setCooldown(RESEND_COOLDOWN);
  };

  const fmt = (s: number) => `0:${s.toString().padStart(2, "0")}`;

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
            {busy ? "Verifying…" : "Verify code"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-none items-center gap-3 px-[22px] pt-1.5">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={22} className="text-tg-ink" />
        </button>
        <span className="font-display text-[15px] font-semibold">Reset password</span>
      </div>

      <div className="px-[22px] py-3.5">
        <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-pill border-[1.5px] border-tg-line bg-tg-card">
          <MailCheck size={20} className="text-tg-blue-accent" />
        </span>
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.13em] text-tg-brown-soft">
          Check your email
        </p>
        <h1 className="mt-2 mb-2 font-serif text-[27px] font-medium leading-[1.08] tracking-[-0.02em]">
          Enter the code.
        </h1>
        <p className="mb-5 font-body text-[14px] leading-relaxed text-tg-brown">
          We sent a 6-digit code to{" "}
          <span className="font-mono text-tg-ink">{email}</span>. Enter it below.
        </p>

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
            {cooldown > 0 ? `Resend in ${fmt(cooldown)}` : "Resend code"}
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
