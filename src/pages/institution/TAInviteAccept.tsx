import { Check, Shapes, ShieldCheck, X } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { InstLogo } from "@/components/app/inst-logo";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { schools } from "@/lib/fixtures";
import { routes } from "@/lib/routes";
import { useNavigate } from "react-router-dom";

/**
 * 28 · The screen the TA invite link opens — a class card, a "what a TA can /
 * can't do" list, a "verified via your school email" line, and two actions:
 * Accept & join as TA → classList, Decline → back.
 */
const CAN = [
  "Post documents and lectures",
  "Help run the class group chat",
  "Add and share references",
];
const CANNOT = ["Delete the class", "Change the roster"];

export default function TAInviteAccept() {
  const navigate = useNavigate();
  const school = schools[0];
  const className = "Spatial Studio";
  const professor = "Prof. Rakan Lee";

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" onClick={() => navigate(routes.classList)}>
            <Check size={16} />
            Accept &amp; join as TA
          </Button>
          <div className="mt-2.5">
            <Button variant="ghost" full size="md" onClick={() => navigate(-1)}>
              Decline
            </Button>
          </div>
        </div>
      }
    >
      <BackHeader title="Join as TA" />

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-3.5 pb-4">
        {/* Class card */}
        <div className="mb-[18px] flex items-center gap-3 rounded-[16px] border border-tg-line bg-tg-card p-4">
          <span
            className="flex h-[50px] w-[50px] flex-none items-center justify-center rounded-[13px]"
            style={{ background: school.tint }}
          >
            <Shapes size={24} className="text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[16px] font-semibold text-tg-ink">{className}</div>
            <span className="mt-1 inline-flex items-center gap-1.5">
              <InstLogo school={school} size={16} />
              <Meta>{school.name}</Meta>
            </span>
          </div>
        </div>

        <h1 className="font-serif text-[27px] font-medium leading-[1.08] tracking-[-0.02em]">
          Join as a teaching assistant.
        </h1>
        <p className="my-2.5 font-body text-[14px] leading-relaxed text-tg-brown">
          {professor} invited you to help run this class.
        </p>

        {/* What a TA can do */}
        <div className="mb-2 mt-4 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
          What a TA can do
        </div>
        <div className="flex flex-col gap-2.5">
          {CAN.map((c) => (
            <div key={c} className="flex items-center gap-3">
              <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-pill bg-tg-stone2">
                <Check size={13} strokeWidth={3} className="text-tg-blue-accent" />
              </span>
              <span className="font-body text-[13.5px] leading-snug text-tg-ink">{c}</span>
            </div>
          ))}
        </div>

        {/* What a TA can't do */}
        <div className="mb-2 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
          What a TA can&apos;t do
        </div>
        <div className="flex flex-col gap-2.5">
          {CANNOT.map((c) => (
            <div key={c} className="flex items-center gap-3">
              <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-pill bg-tg-stone2">
                <X size={13} strokeWidth={3} className="text-tg-brown-soft" />
              </span>
              <span className="font-body text-[13.5px] leading-snug text-tg-brown">{c}</span>
            </div>
          ))}
        </div>

        {/* Verified line */}
        <div className="mt-[18px] flex items-center gap-2 rounded-[12px] bg-tg-stone2 p-3.5">
          <ShieldCheck size={15} className="flex-none text-tg-brown-soft" />
          <Meta>Verified via your school email · mona@{school.domain}</Meta>
          <VerifiedBadge size={15} />
        </div>
      </div>
    </MobileShell>
  );
}
