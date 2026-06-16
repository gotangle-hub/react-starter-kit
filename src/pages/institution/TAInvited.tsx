import { Clock, Info, MailCheck, RotateCw } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { useNavigate } from "react-router-dom";

/**
 * 26 · Professor's confirmation after inviting a TA. "Invite sent", a pending
 * badge, the TA email, Resend / Cancel, and a note that the TA gets an email to
 * accept. "Done" → classList.
 */
export default function TAInvited() {
  const navigate = useNavigate();
  const email = "mona@rca.ac.uk";

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" onClick={() => navigate(routes.classList)}>
            Done
          </Button>
        </div>
      }
    >
      <BackHeader title="Teaching assistant" />

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-3.5 pb-4">
        <div className="flex flex-col items-center pb-[18px] pt-3.5 text-center">
          <span className="mb-3.5 flex h-[58px] w-[58px] items-center justify-center rounded-pill bg-tg-stone2">
            <MailCheck size={28} className="text-tg-blue-accent" />
          </span>
          <div className="font-serif text-[25px] font-medium leading-[1.1] tracking-[-0.02em]">
            Invite sent.
          </div>
          <p className="mt-2 max-w-[280px] font-body text-[13.5px] leading-relaxed text-tg-brown">
            We emailed a link for your TA to join the class. They&apos;ll get an
            email to accept.
          </p>
        </div>

        {/* Pending TA card */}
        <div className="flex items-center gap-3 rounded-[14px] border border-dashed border-tg-line bg-tg-card p-3.5">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-pill bg-tg-stone2">
            <Clock size={20} className="text-tg-brown-soft" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-mono text-[14px] font-medium text-tg-ink">{email}</div>
            <span className="mt-1 inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-pill bg-tg-terra" />
              <Meta>Invited · awaiting reply</Meta>
            </span>
          </div>
          <span className="flex-none rounded-md border border-tg-line px-[7px] py-[5px] font-display text-[9px] font-bold uppercase tracking-[0.1em] text-tg-brown">
            TA
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            full
            size="md"
            onClick={() => navigate(routes.taInviteEmail)}
          >
            <RotateCw size={15} />
            Resend
          </Button>
          <Button variant="ghost" full size="md" onClick={() => navigate(routes.classList)}>
            Cancel invite
          </Button>
        </div>

        <div className="mt-[18px] flex gap-3 rounded-[12px] bg-tg-stone2 p-3.5">
          <Info size={16} className="mt-0.5 flex-none text-tg-blue-accent" />
          <span className="font-body text-[12.5px] leading-relaxed text-tg-brown">
            Once accepted, your TA can post documents, help run the chat and share
            references — but can&apos;t delete the class or change the roster.
          </span>
        </div>
      </div>
    </MobileShell>
  );
}
