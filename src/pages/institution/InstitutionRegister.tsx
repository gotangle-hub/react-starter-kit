import { useNavigate } from "react-router-dom";
import { Building2, Mail, Send, Users } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Pill } from "@/components/brand/atoms";
import { LocationField, TextField } from "@/components/app/fields";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

/**
 * 04 · Register your institution (G13). Interest form for unlisted schools —
 * on submit it's emailed to the Tangle team who follow up.
 */
export default function InstitutionRegister() {
  const navigate = useNavigate();
  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" onClick={() => navigate(routes.institutionFind)}>
            <Send size={16} />
            Send request
          </Button>
        </div>
      }
    >
      <BackHeader title="Register your institution" />
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-3.5 pb-4">
        <h1 className="font-serif text-[26px] font-medium leading-[1.08] tracking-[-0.02em]">
          Bring Tangle to your campus.
        </h1>
        <p className="my-2 mb-[18px] font-body text-[14px] leading-relaxed text-tg-brown">
          Tell us about your school. We review every request and get in touch about a campus subscription.
        </p>

        <div className="flex flex-col gap-3.5">
          <TextField label="Institution name" icon={<Building2 size={17} />} placeholder="Your institution" />
          <LocationField label="Country & city" placeholder="City, country" />
          <TextField label="Your name" placeholder="Your name" />
          <div>
            <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">Your role</div>
            <div className="flex flex-wrap gap-1.5">
              {["Faculty", "Department head", "Administration", "Student rep"].map((r, i) => (
                <Pill key={r} small on={i === 0}>{r}</Pill>
              ))}
            </div>
          </div>
          <TextField label="Work email" mono icon={<Mail size={17} />} type="email" placeholder="you@school.edu" />
          <TextField label="Approx. students" icon={<Users size={17} />} type="number" placeholder="e.g. 640" />
          <TextField label="Anything we should know" placeholder="A line about your programme" />
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-DEFAULT bg-tg-stone2 p-3.5">
          <Send size={17} className="text-tg-blue-accent" />
          <span className="font-body text-[12.5px] leading-snug text-tg-brown">
            This goes straight to the Tangle team — we usually reply within two working days.
          </span>
        </div>
      </div>
    </MobileShell>
  );
}
