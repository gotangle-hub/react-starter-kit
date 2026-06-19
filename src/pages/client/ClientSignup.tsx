import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Chip } from "@/components/brand/chip";
import { Meta, Pill } from "@/components/brand/atoms";
import { LocationField, TextField } from "@/components/app/fields";
import { UsernamePicker } from "@/components/app/username-picker";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { supabase } from "@/integrations/supabase/client";
import { checkUsernameAvailable } from "@/services/usernames";
import { validateReferralCode } from "@/lib/referral";

const CLIENT_TYPES = ["Developer", "Private client", "Brand / company", "Event", "Agency", "Other"];
const HIRING_FOR = ["One off project", "Ongoing work", "A competition", "Event coverage", "Full time role", "Just looking"];

/** 03 · Create a client account — name, email, password, client type. */
export default function ClientSignup() {
  const navigate = useNavigate();
  const [type, setType] = useState("Private client");
  const [hiring, setHiring] = useState("One off project");
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
    const r = await validateReferralCode(referral, "client");
    if (!r) return;
    if (r.ok) {
      setReferralValidCode(r.code);
      setReferralMsg({ ok: true, text: `${r.code} applied — ${r.months} months Pro free.` });
    } else {
      setReferralMsg({ ok: false, text: r.message });
    }
  };

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
    const stillFree = await checkUsernameAvailable(username);
    if (!stillFree) {
      setError("That username was just taken — try another.");
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${routes.clientHome}`,
        data: {
          account_type: "client",
          display_name: name || undefined,
          username,
          client_type: type,
          hiring_for: hiring,
          ...(referralValidCode ? { referral_code: referralValidCode } : {}),
        },
      },
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate(routes.verifyEmail, { state: { email: email.trim(), next: routes.clientConsent } });
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
            {busy ? "Creating account…" : "Create account"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-none items-center gap-3 px-[22px] pt-1.5">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={22} className="text-tg-ink" />
        </button>
        <span className="font-display text-[15px] font-semibold">Create a client account</span>
      </div>

      <div className="px-[22px] py-3.5">
        <Chip>Client</Chip>
        <h1 className="mb-1 mt-3 font-serif text-[27px] font-medium leading-[1.08] tracking-[-0.02em]">
          Tell us who's hiring.
        </h1>
        <p className="mb-5 font-body text-[14px] leading-relaxed text-tg-brown">
          This shapes how creatives see your briefs.
        </p>

        <div className="flex flex-col gap-3.5">
          <div>
            <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">I'm a</div>
            <div className="flex flex-wrap gap-1.5">
              {CLIENT_TYPES.map((t) => (
                <Pill key={t} on={type === t} onClick={() => setType(t)}>{t}</Pill>
              ))}
            </div>
            <Meta className="mt-2 block">e.g. a developer, someone building their home, or hiring a videographer for an event.</Meta>
          </div>

          <TextField
            label="Name / company"
            placeholder="Your name or company"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <UsernamePicker
            value={username}
            onChange={setUsername}
            onValidityChange={(s) => setUsernameOk(s.valid && s.available)}
            label="Account username"
            baseSuggestion={name}
          />
          <TextField
            label="Work email"
            mono
            icon={<Mail size={17} />}
            type="email"
            placeholder="you@company.co"
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

          <div>
            <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">I'm hiring for</div>
            <div className="flex flex-wrap gap-1.5">
              {HIRING_FOR.map((h) => (
                <Pill key={h} on={hiring === h} onClick={() => setHiring(h)}>{h}</Pill>
              ))}
            </div>
          </div>

          <LocationField label="Location" defaultValue="Dubai, UAE" />

          <div>
            <TextField
              label="Referral code (optional)"
              placeholder="Have one? Enter it"
              value={referral}
              onChange={(e) => { setReferral(e.target.value); setReferralMsg(null); setReferralValidCode(null); }}
              onBlur={checkReferral}
            />
            {referralMsg && (
              <p className={`mt-1.5 text-[12px] ${referralMsg.ok ? "text-tg-blue-accent" : "text-tg-terra"}`}>
                {referralMsg.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
