import { useNavigate } from "react-router-dom";
import { Mail, ShieldCheck } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { InstLogo } from "@/components/app/inst-logo";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Meta } from "@/components/brand/atoms";
import { TextField } from "@/components/app/fields";
import { Button } from "@/components/ui/button";
import { schools } from "@/lib/fixtures";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * 05 · School email login (G13). Once a school is selected, the app determines
 * which login system it uses (Google Workspace, Microsoft, …) and routes the
 * user through that provider to authenticate with their campus email.
 */
export default function InstitutionLogin() {
  const navigate = useNavigate();
  const s = schools[0]; // selected school (Google Workspace)
  const isGoogle = s.provider === "Google";

  return (
    <MobileShell
      footer={
        <div className="flex-none px-[22px] pb-7">
          <Button full size="lg" onClick={() => navigate(routes.institutionRoleDetect)}>
            Send sign-in link
          </Button>
        </div>
      }
    >
      <BackHeader title="Join your campus" />
      <div className="flex min-h-0 flex-1 flex-col justify-center px-[22px]">
        <div className="mb-6 flex items-center gap-3.5 rounded-lg border border-tg-line bg-tg-card p-3.5">
          <InstLogo school={s} size={50} />
          <div className="min-w-0 flex-1">
            <div className="font-display text-[16px] font-semibold">{s.name}</div>
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
          {s.name} uses {s.provider} Workspace. Use your campus account to verify you're a student.
        </p>

        {/* Provider button — auto-selected from the school's login system */}
        <button
          type="button"
          onClick={() => navigate(routes.institutionRoleDetect)}
          className={cn(
            "flex h-[52px] items-center justify-center gap-2.5 rounded-DEFAULT border-[1.5px] font-display text-[15px] font-semibold",
            isGoogle ? "border-[#DADCE0] bg-white text-[#3C4043]" : "border-[#0F0F0F] bg-[#0F0F0F] text-white",
          )}
        >
          <Mail size={18} />
          Continue with {s.provider} · @{s.domain}
        </button>

        <div className="my-[18px] flex items-center gap-3">
          <span className="h-px flex-1 bg-tg-line" />
          <Meta>or</Meta>
          <span className="h-px flex-1 bg-tg-line" />
        </div>

        <TextField label={`Email — must end in @${s.domain}`} mono icon={<Mail size={17} />} placeholder={`you@${s.domain}`} />
        <div className="mt-3 flex items-center gap-2">
          <ShieldCheck size={15} className="text-tg-brown-soft" />
          <Meta>Only @{s.domain} addresses can join this campus.</Meta>
        </div>
      </div>
    </MobileShell>
  );
}
