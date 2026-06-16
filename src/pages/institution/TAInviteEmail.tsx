import { ExternalLink, Shapes } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Logo } from "@/components/brand/logo";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { schools } from "@/lib/fixtures";
import { routes } from "@/lib/routes";
import { useNavigate } from "react-router-dom";

/**
 * 27 · The email the TA receives from Tangle, rendered as an email preview card:
 * a from/to header, subject, body, and a prominent "Open in Tangle to accept"
 * button → taInviteAccept.
 */
export default function TAInviteEmail() {
  const navigate = useNavigate();
  const school = schools[0];
  const className = "Spatial Studio";
  const to = `mona@${school.domain}`;

  return (
    <MobileShell>
      <BackHeader title="TA invite" />

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-3.5 pb-6">
        {/* Email envelope card */}
        <div className="overflow-hidden rounded-[16px] border border-tg-line bg-tg-card">
          {/* From / to header */}
          <div className="flex items-center gap-3 border-b border-tg-line px-4 py-3.5">
            <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-pill bg-tg-emph">
              <Logo size={16} onDark />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-[14px] font-semibold text-tg-ink">Tangle</div>
              <Meta className="mt-0.5 block">from team@tangle.app · to {to}</Meta>
            </div>
            <Meta>now</Meta>
          </div>

          {/* Body */}
          <div className="px-4 py-4">
            <Meta className="block uppercase tracking-[0.1em]">Subject</Meta>
            <h1 className="mt-1.5 font-serif text-[22px] font-medium leading-[1.15] tracking-[-0.01em]">
              You&apos;ve been invited to assist {className}.
            </h1>
            <p className="mt-3 font-body text-[14px] leading-[1.6] text-tg-ink">
              You&apos;ve been invited to assist <b>{className}</b> at{" "}
              {school.name} as a TA. Open the class in Tangle to review what a TA
              can do and accept.
            </p>

            {/* Class preview */}
            <div className="my-4 flex items-center gap-3 rounded-[14px] border border-tg-line bg-tg-stone2 p-3.5">
              <span
                className="flex h-11 w-11 flex-none items-center justify-center rounded-[11px]"
                style={{ background: school.tint }}
              >
                <Shapes size={21} className="text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-[14.5px] font-semibold text-tg-ink">
                  {className}
                </div>
                <Meta className="mt-0.5 block">Studio class · {school.name}</Meta>
              </div>
            </div>

            <Button full size="lg" onClick={() => navigate(routes.taInviteAccept)}>
              <ExternalLink size={17} />
              Open in Tangle to accept
            </Button>

            <Meta className="mt-3 block text-center">
              This invite is tied to {to} and expires in 14 days.
            </Meta>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
