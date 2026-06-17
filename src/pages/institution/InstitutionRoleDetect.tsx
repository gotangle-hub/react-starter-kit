import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Check, ChevronRight, GraduationCap, Presentation, ShieldAlert, Unlock } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { useSession } from "@/hooks/use-session";
import { detectRole, emailMatchesInstitution, recallInstitution, type Institution } from "@/services/institutions";

/**
 * 06 · Role detected (G13). After SSO sign-in we read the user's verified
 * email, confirm it belongs to the selected campus, and route to faculty or
 * student profile setup. The detection rule is per-institution (see
 * institutions.faculty_email_regex / student_email_regex); a sensible default
 * runs when those aren't set. The user can override if it looks wrong.
 */
export default function InstitutionRoleDetect() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [inst, setInst] = useState<Institution | null>(null);

  useEffect(() => { setInst(recallInstitution()); }, []);

  const email = session?.user?.email ?? "";
  const domainOk = useMemo(() => (inst && email ? emailMatchesInstitution(email, inst) : false), [inst, email]);
  const role = useMemo(() => detectRole(email, inst), [email, inst]);

  if (!inst) {
    return (
      <MobileShell>
        <BackHeader title="Welcome to your campus" />
        <div className="flex min-h-0 flex-1 flex-col justify-center px-[22px]">
          <Meta>No institution selected.</Meta>
          <Button className="mt-4" onClick={() => navigate(routes.institutionFind)}>Find your school</Button>
        </div>
      </MobileShell>
    );
  }

  const detected = role;
  const alternate = role === "faculty" ? "student" : "faculty";
  const goPrimary = () => navigate(detected === "faculty" ? routes.facultyProfile : routes.institutionProfile);
  const goAlternate = () => navigate(alternate === "faculty" ? routes.facultyProfile : routes.institutionProfile);

  return (
    <MobileShell
      footer={
        <div className="flex-none px-[22px] pb-7">
          <Button full size="lg" onClick={goPrimary}>
            Continue as {detected}
          </Button>
        </div>
      }
    >
      <BackHeader title="Welcome to your campus" />
      <div className="flex min-h-0 flex-1 flex-col justify-center px-[22px]">
        {email ? (
          <div className="mb-3.5 flex items-center gap-2">
            {domainOk ? (
              <>
                <BadgeCheck size={17} className="text-[#1F8A5B]" />
                <Meta className="!text-[#1F8A5B]">Signed in · {email}</Meta>
              </>
            ) : (
              <>
                <ShieldAlert size={17} className="text-tg-yellow" />
                <Meta>{email} isn&apos;t a @{inst.domain} address. You can still continue but the campus perks won&apos;t apply.</Meta>
              </>
            )}
          </div>
        ) : (
          <div className="mb-3.5">
            <Meta>Finishing sign-in…</Meta>
          </div>
        )}
        <h1 className="font-serif text-[29px] font-medium leading-[1.06] tracking-[-0.025em]">
          {detected === "faculty" ? "We recognised you as faculty." : "We recognised you as a student."}
        </h1>
        <p className="my-2.5 mb-5 font-body text-[14px] leading-relaxed text-tg-brown">
          Your role was detected automatically from your {inst.name} account. You can change it if this looks wrong.
        </p>

        <div className="flex items-center gap-3.5 rounded-lg bg-tg-emph p-4 text-white">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-md bg-white/15">
            {detected === "faculty" ? <Presentation size={23} /> : <GraduationCap size={23} />}
          </span>
          <div className="flex-1">
            <div className="font-display text-[16px] font-semibold capitalize">{detected}</div>
            <div className="mt-0.5 font-body text-[12.5px] text-white/70">
              {detected === "faculty"
                ? "Create classes, post documents, run studio crits."
                : "Join classes, share pins, build your portfolio."}
            </div>
          </div>
          <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-pill bg-tg-yellow">
            <Check size={14} strokeWidth={3} className="text-tg-ink dark:text-white" />
          </span>
        </div>

        <button
          type="button"
          onClick={goAlternate}
          className="mt-2.5 flex items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-3.5 text-left"
        >
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-tg-stone2">
            {alternate === "faculty" ? <Presentation size={19} className="text-tg-ink" /> : <GraduationCap size={19} className="text-tg-ink" />}
          </span>
          <div className="flex-1">
            <div className="font-display text-[14px] font-semibold capitalize">I&apos;m a {alternate}, not {detected}</div>
            <Meta className="mt-0.5 block">Switch to a {alternate} account</Meta>
          </div>
          <ChevronRight size={19} className="text-tg-brown-soft" />
        </button>

        <div className="mt-4 flex items-center gap-2">
          <Unlock size={14} className="text-tg-blue-accent" />
          <Meta>Every Pro feature is unlocked on campus accounts — only paid advertising is excluded.</Meta>
        </div>
      </div>
    </MobileShell>
  );
}
