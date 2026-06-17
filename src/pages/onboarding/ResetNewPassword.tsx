import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Eye, EyeOff, Lock } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** 03 · Set a new password — runs after OTP verify, so we're authenticated. */
export default function ResetNewPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = ((location.state ?? {}) as { email?: string }).email ?? "";

  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rules = {
    length: pw.length >= 8,
    number: /\d/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  };
  const allOk = rules.length && rules.number && rules.symbol;
  const matches = pw.length > 0 && pw === confirm;
  const ready = allOk && matches && !busy;

  const submit = async () => {
    if (!ready) {
      if (!allOk) setError("Your password doesn't meet the requirements yet.");
      else if (!matches) setError("The passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (err) {
      setError(err.message || "Couldn't update your password. Try again.");
      return;
    }
    // Sign out so the next screen actually requires the new password.
    await supabase.auth.signOut();
    navigate(routes.resetDone, { state: { email }, replace: true });
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
          <Button full size="lg" onClick={submit} disabled={!ready}>
            {busy ? "Updating…" : "Update password"}
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
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.13em] text-tg-brown-soft">
          New password
        </p>
        <h1 className="mt-2 mb-2 font-serif text-[27px] font-medium leading-[1.08] tracking-[-0.02em]">
          Set a new password.
        </h1>
        <p className="mb-5 font-body text-[14px] leading-relaxed text-tg-brown">
          Choose a strong password you'll remember.
        </p>

        <PwField
          label="New password"
          value={pw}
          onChange={setPw}
          show={showPw}
          onToggle={() => setShowPw((s) => !s)}
        />
        <div className="h-3.5" />
        <PwField
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          show={showConfirm}
          onToggle={() => setShowConfirm((s) => !s)}
        />

        <div className="mt-4 mb-2 space-y-2">
          <Rule ok={rules.length} label="At least 8 characters" />
          <Rule ok={rules.number} label="One number" />
          <Rule ok={rules.symbol} label="One symbol" />
          {confirm.length > 0 && <Rule ok={matches} label="Passwords match" />}
        </div>
      </div>
    </MobileShell>
  );
}

function PwField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
        {label}
      </span>
      <span className="flex items-center gap-2.5 rounded-DEFAULT border border-tg-line bg-tg-card px-3.5 py-3 focus-within:border-tg-blue-accent">
        <Lock size={17} className="text-tg-brown-soft" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          className="min-w-0 flex-1 border-none bg-transparent p-0 text-[14.5px] text-tg-ink outline-none placeholder:text-tg-brown-soft"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-tg-brown-soft"
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </label>
  );
}

function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "flex h-[18px] w-[18px] items-center justify-center rounded-full",
          ok ? "bg-tg-blue-accent text-white" : "bg-tg-stone2 text-transparent",
        )}
      >
        <Check size={12} strokeWidth={3} />
      </span>
      <span
        className={cn(
          "font-body text-[12.5px]",
          ok ? "text-tg-ink" : "text-tg-brown-soft",
        )}
      >
        {label}
      </span>
    </div>
  );
}
