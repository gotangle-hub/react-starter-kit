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
import { recallInstitution, type Institution } from "@/services/institutions";
import { lovable } from "@/integrations/lovable";

/**
 * 05 · School email login (G13). The school selected on InstitutionFind drives
 * which SSO provider we route through (Google Workspace or Microsoft). On
 * successful OAuth the browser lands back on /institution/role for auto role
 * detection.
 */
export default function InstitutionLogin() {
  const navigate = useNavigate();
  const [inst, setInst] = useState<Institution | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const i = recallInstitution();
    if (!i) {
      navigate(routes.institutionFind, { replace: true });
      return;
    }
    setInst(i);
  }, [navigate]);

  if (!inst) return null;

  const providerLabel = inst.sso_provider === "microsoft" ? "Microsoft" : "Google";

  async function signIn() {
    if (!inst || busy) return;
    setBusy(true);
    const provider = inst.sso_provider === "microsoft" ? "microsoft" : "google";
    const redirect = `${window.location.origin}${routes.institutionRoleDetect}`;
    // Hint the IdP toward the right hosted-domain (Google) or account picker.
    const extraParams: Record<string, string> =
      provider === "google" ? { hd: inst.domain, prompt: "select_account" } : { prompt: "select_account" };
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: redirect, extraParams });
    if (result.error) {
      console.error("[institution-login] OAuth failed", result.error);
      setBusy(false);
      return;
    }
    if (result.redirected) return; // browser will navigate to IdP
    navigate(routes.institutionRoleDetect);
  }

  return (
    <MobileShell
      footer={
        <div className="flex-none px-[22px] pb-7">
          <Button full size="lg" onClick={signIn} disabled={busy}>
            {busy ? "Opening sign-in…" : `Continue with ${providerLabel}`}
          </Button>
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
          {inst.name} uses {providerLabel} Workspace. Use your campus account to verify you&apos;re part of the school.
        </p>

        <button
          type="button"
          onClick={signIn}
          disabled={busy}
          className={cn(
            "flex h-[52px] items-center justify-center gap-2.5 rounded-DEFAULT border-[1.5px] font-display text-[15px] font-semibold",
            providerLabel === "Google"
              ? "border-[#DADCE0] bg-white text-[#3C4043]"
              : "border-[#0F0F0F] bg-[#0F0F0F] text-white",
          )}
        >
          <Mail size={18} />
          Continue with {providerLabel} · @{inst.domain}
        </button>

        <div className="my-[18px] flex items-center gap-3">
          <span className="h-px flex-1 bg-tg-line" />
          <Meta>or</Meta>
          <span className="h-px flex-1 bg-tg-line" />
        </div>

        <TextField label={`Email — must end in @${inst.domain}`} mono icon={<Mail size={17} />} placeholder={`you@${inst.domain}`} />
        <div className="mt-3 flex items-center gap-2">
          <ShieldCheck size={15} className="text-tg-brown-soft" />
          <Meta>Only @{inst.domain} addresses can join this campus.</Meta>
        </div>
      </div>
    </MobileShell>
  );
}
