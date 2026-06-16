import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Chip } from "@/components/brand/chip";
import { Meta, Pill } from "@/components/brand/atoms";
import { LocationField, TextField } from "@/components/app/fields";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

const CLIENT_TYPES = ["Developer", "Private client", "Brand / company", "Event", "Agency", "Other"];
const HIRING_FOR = ["One off project", "Ongoing work", "A competition", "Event coverage", "Full time role", "Just looking"];

/** 03 · Create a client account — name, email, password, client type. */
export default function ClientSignup() {
  const navigate = useNavigate();
  const [type, setType] = useState("Private client");
  const [hiring, setHiring] = useState("One off project");

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" onClick={() => navigate(routes.clientConsent)}>
            Create account
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

          <TextField label="Name / company" defaultValue="" placeholder="Your name or company" />
          <TextField label="Work email" mono icon={<Mail size={17} />} type="email" placeholder="you@company.co" />
          <TextField label="Password" icon={<Lock size={17} />} type="password" placeholder="••••••••" />

          <div>
            <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">I'm hiring for</div>
            <div className="flex flex-wrap gap-1.5">
              {HIRING_FOR.map((h) => (
                <Pill key={h} on={hiring === h} onClick={() => setHiring(h)}>{h}</Pill>
              ))}
            </div>
          </div>

          <LocationField label="Location" defaultValue="Dubai, UAE" />
        </div>
      </div>
    </MobileShell>
  );
}
