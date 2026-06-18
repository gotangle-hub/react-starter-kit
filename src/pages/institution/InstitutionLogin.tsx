import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ShieldCheck } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { InstLogo } from "@/components/app/inst-logo";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Meta } from "@/components/brand/atoms";
import { TextField } from "@/components/app/fields";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { recallInstitution, emailMatchesInstitution, type Institution } from "@/services/institutions";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

/**
 * 05 · School email login (G13). The selected institution drives the auth path.
 * Google Workspace campuses use managed Google OAuth with the `hd` hint pinned
 * to the institution domain so users physically cannot pick a personal Gmail.
 * Other campuses (Microsoft, plain email) fall back to a verified email-OTP
 * link sent to their @institution address. Either way the resulting session
 * is then matched against the institution server-side on the next screen.
 */
export default function InstitutionLogin() {
  const navigate = useNavigate();
  const [inst, setInst] = useState<Institution | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkSent, setLinkSent] = useState(false);

  useEffect(() => {
    const i = recallInstitution();
    if (!i) {
      navigate(routes.institutionFind, { replace: true });
      return;
    }
    setInst(i);
  }, [navigate]);

  if (!inst) return null;
  const usesGoogle = inst.sso_provider === "google";
  const providerLabel = usesGoogle ? "Google" : inst.sso_provider === "microsoft" ? "Microsoft" : "email";

  async function signInGoogle() {
    if (!inst || busy) return;
    setBusy(true);
    setError(null);
    const redirect = `${window.location.origin}${routes.institutionRoleDetect}`;
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: redirect,
      extraParams: { hd: inst.domain, prompt: "select_account" },
    });
    if (result.error) {
      setError(result.error.message ?? "Sign-in failed");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate(routes.institutionRoleDetect);
  }

  async function sendMagicLink() {
    if (!inst || busy) return;
    setError(null);
    const e = email.trim().toLowerCase();
    if (!e) { setError("Enter your campus email."); return; }
    if (!emailMatchesInstitution(e, inst)) {
      setError(`Use your @${inst.domain} address.`);
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: e,
      options: { emailRedirectTo: `${window.location.origin}${routes.institutionRoleDetect}` },
    });
    setBusy(false);
    if (err) { setError(err.message); return; }
    setLinkSent(true);
  }

  return (
    <MobileShell
      footer={
        <div className="flex-none px-[22px] pb-7">
          <Button full size="lg" onClick={usesGoogle ? signInGoogle : sendMagicLink} disabled={busy}>
            {busy ? "Working…" : usesGoogle ? `Continue with Google` : linkSent ? "Resend link" : `Email me a sign-in link`}
          </Button>
          {linkSent && (
            <p className="mt-3 text-center text-[12.5px] text-tg-blue-accent">
              Link sent to {email}. Open it on this device to finish signing in.
            </p>
          )}
        </div>
      }
    >
      <BackHeader title="Join your campus" />
      <div className="flex min-h-0 flex-1 flex-col justify-center px-[22px]">
        <div className="mb-6 flex items-center gap-3.5 rounded-lg border border-tg-line bg-tg-card p-3.5">
          <InstLogo school={{ tint: inst.tint ?? "#161514", initials: inst.initials ?? inst.name.slice(0, 2).toUpperCase() }} size={50} />
          <div className="min-w-0 flex-1">
            <div className="font-display text-[16px] font-semibold">{inst.name}</div>
            <span className="mt-1 inline-flex items-center gap-1.5">
              <VerifiedBadge size={13} />
              <Meta>Verified campus · students free</Meta>
            </span>
          </div>
        </div>

        <h1 className="font-serif text-[30px] font-medium leading-[1.05] tracking-[-0.025em]">
          Sign in with your school email.
        </h1>
        <p className="my-2.5 mb-6 max-w-[300px] font-body text-[14.5px] leading-relaxed text-tg-brown">
          {inst.name} uses {providerLabel === "email" ? "campus email" : `${providerLabel} Workspace`}. We&apos;ll verify your @{inst.domain} address before linking your account.
        </p>

        {usesGoogle ? (
          <button
            type="button"
            onClick={signInGoogle}
            disabled={busy}
            className={cn(
              "flex h-[52px] items-center justify-center gap-2.5 rounded-DEFAULT border-[1.5px] font-display text-[15px] font-semibold",
              "border-[#DADCE0] bg-white text-[#3C4043]",
            )}
          >
            <Mail size={18} />
            Continue with Google · @{inst.domain}
          </button>
        ) : (
          <div className="flex flex-col gap-2.5">
            <TextField
              label={`Email — must end in @${inst.domain}`}
              mono
              icon={<Mail size={17} />}
              type="email"
              placeholder={`you@${inst.domain}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}

        {error && (
          <p className="mt-3 text-[12.5px] text-tg-terra" role="alert">{error}</p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <ShieldCheck size={15} className="text-tg-brown-soft" />
          <Meta>Only @{inst.domain}{inst.alt_domains.length ? ` (or ${inst.alt_domains.map((d) => "@" + d).join(", ")})` : ""} addresses can join this campus.</Meta>
        </div>
      </div>
    </MobileShell>
  );
}
