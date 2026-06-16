import { useNavigate } from "react-router-dom";
import { BadgeCheck, Check, ChevronRight, GraduationCap, Presentation, Unlock } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { schools } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

/**
 * 06 · Role detected (G13). After institution login the app auto-detects whether
 * the person is faculty or a student and routes them to the matching profile
 * setup. The detected role can be switched if it looks wrong.
 */
export default function InstitutionRoleDetect() {
  const navigate = useNavigate();
  const s = schools[0];

  return (
    <MobileShell
      footer={
        <div className="flex-none px-[22px] pb-7">
          <Button full size="lg" onClick={() => navigate(routes.facultyProfile)}>
            Continue as faculty
          </Button>
        </div>
      }
    >
      <BackHeader title="Welcome to your campus" />
      <div className="flex min-h-0 flex-1 flex-col justify-center px-[22px]">
        <div className="mb-3.5 flex items-center gap-2">
          <BadgeCheck size={17} className="text-[#1F8A5B]" />
          <Meta className="!text-[#1F8A5B]">Signed in · rakan@{s.domain}</Meta>
        </div>
        <h1 className="font-serif text-[29px] font-medium leading-[1.06] tracking-[-0.025em]">
          We recognised you as faculty.
        </h1>
        <p className="my-2.5 mb-5 font-body text-[14px] leading-relaxed text-tg-brown">
          Your role was detected automatically from the {s.name} directory. You can change it if this looks wrong.
        </p>

        {/* Detected role */}
        <div className="flex items-center gap-3.5 rounded-lg bg-tg-emph p-4 text-white">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-md bg-white/15">
            <Presentation size={23} />
          </span>
          <div className="flex-1">
            <div className="font-display text-[16px] font-semibold">Faculty</div>
            <div className="mt-0.5 font-body text-[12.5px] text-white/70">Create classes, post documents, run studio crits.</div>
          </div>
          <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-pill bg-tg-yellow">
            <Check size={14} strokeWidth={3} className="text-tg-ink dark:text-white" />
          </span>
        </div>

        {/* Switch */}
        <button
          type="button"
          onClick={() => navigate(routes.institutionProfile)}
          className="mt-2.5 flex items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-3.5 text-left"
        >
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-tg-stone2">
            <GraduationCap size={19} className="text-tg-ink" />
          </span>
          <div className="flex-1">
            <div className="font-display text-[14px] font-semibold">I'm a student, not faculty</div>
            <Meta className="mt-0.5 block">Switch to a student account</Meta>
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
