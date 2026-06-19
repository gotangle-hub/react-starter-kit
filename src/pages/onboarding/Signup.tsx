import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { Meta, Pill } from "@/components/brand/atoms";
import { MobileShell } from "@/components/app/mobile-shell";
import { LocationField, TextField } from "@/components/app/fields";
import { UsernamePicker } from "@/components/app/username-picker";
import { Button } from "@/components/ui/button";
import { disciplines } from "@/lib/disciplines";
import { routes } from "@/lib/routes";
import { useAccountType } from "@/hooks/use-account-type";
import { supabase } from "@/integrations/supabase/client";
import { checkUsernameAvailable } from "@/services/usernames";
import { validateReferralCode } from "@/lib/referral";

/** 07 · Create your designer profile. All design fields + Other (free text). */
export default function Signup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { accountType } = useAccountType();
  // Studio journey skips the personal "add work" step and goes to studio consent.
  const isStudio = params.get("type") === "studio";
  const next = isStudio ? routes.studioConsent : routes.addWork;
  const [selected, setSelected] = useState<Set<string>>(new Set(["Architecture", "Graphic"]));
  const [other, setOther] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameOk, setUsernameOk] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [referral, setReferral] = useState("");
  const [referralMsg, setReferralMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [referralValidCode, setReferralValidCode] = useState<string | null>(null);

  const checkReferral = async () => {
    setReferralMsg(null);
    setReferralValidCode(null);
    const r = await validateReferralCode(referral, isStudio ? "studio" : (accountType || "designer"));
    if (!r) return;
    if (r.ok) {
      setReferralValidCode(r.code);
      setReferralMsg({ ok: true, text: `${r.code} applied — ${r.months} months Pro free.` });
    } else {
      setReferralMsg({ ok: false, text: r.message });
    }
  };

  const toggle = (d: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });

  const handleContinue = async () => {
    setError(null);
    if (!email || !password) {
      setError("Enter an email and password to continue.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!usernameOk) {
      setError("Pick an available username to continue.");
      return;
    }
    // Re-verify availability right before submit (race-safe).
    const stillFree = await checkUsernameAvailable(username);
    if (!stillFree) {
      setError("That username was just taken — try another.");
      return;
    }
    setBusy(true);
    const resolvedType = isStudio ? "studio" : accountType;
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${routes.home}`,
        data: {
          account_type: resolvedType,
          display_name: name || undefined,
          username,
          disciplines: Array.from(selected),
          ...(referralValidCode ? { referral_code: referralValidCode } : {}),
        },
      },
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate(routes.verifyEmail, { state: { email: email.trim(), next } });
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
          <Button full size="lg" onClick={handleContinue} disabled={busy}>
            {busy ? "Creating account…" : "Continue"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-none items-center gap-3 px-[22px] pt-1.5">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={22} className="text-tg-ink" />
        </button>
        <span className="font-display text-[15px] font-semibold">Create your profile</span>
      </div>

      <div className="px-[22px] py-3.5">
        <div className="mb-[18px] flex items-center gap-3.5">
          <span className="flex h-16 w-16 flex-none items-center justify-center rounded-pill border-[1.5px] border-dashed border-tg-line">
            <Camera size={22} className="text-tg-brown-soft" />
          </span>
          <div>
            <div className="font-display text-[15px] font-semibold">Add a profile image</div>
            <Meta>No faces required — your work speaks.</Meta>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <TextField
            label="Name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <UsernamePicker
            value={username}
            onChange={setUsername}
            onValidityChange={(s) => setUsernameOk(s.valid && s.available)}
            label={isStudio ? "Studio username" : "Username"}
            baseSuggestion={name}
          />
          <TextField
            label="Email"
            mono
            placeholder="you@studio.co"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div>
            <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
              Field
            </div>
            <div className="flex flex-wrap gap-1.5">
              {disciplines.map((d) => (
                <Pill key={d} small on={selected.has(d)} onClick={() => toggle(d)}>
                  {d}
                </Pill>
              ))}
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <Pill small on={other} onClick={() => setOther((v) => !v)}>
                Other
              </Pill>
              {other && (
                <input
                  placeholder="Type your field…"
                  className="flex-1 rounded-pill border border-tg-line bg-tg-card px-3.5 py-2 text-[13px] text-tg-ink outline-none placeholder:text-tg-brown-soft focus:border-tg-blue-accent"
                />
              )}
            </div>
          </div>

          <LocationField label="Location" defaultValue="Dubai, UAE" />
        </div>
      </div>
    </MobileShell>
  );
}
