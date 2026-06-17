import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, MapPin, Send, Users } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Pill } from "@/components/brand/atoms";
import { TextField } from "@/components/app/fields";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

import { submitRegistrationRequest } from "@/services/institutions";

/**
 * 04 · Register your institution (G13). Submits to the register-institution
 * edge function which persists to public.institution_registration_requests
 * and (optionally) notifies the Tangle team by email.
 */
const ROLES = ["Faculty", "Department head", "Administration", "Student rep"];

export default function InstitutionRegister() {
  const navigate = useNavigate();
  const [institution_name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [contact_name, setContact] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [contact_email, setEmail] = useState("");
  const [approx_students, setStudents] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!institution_name.trim() || !contact_email.trim() || busy) return;
    setBusy(true);
    const { error } = await submitRegistrationRequest({
      institution_name: institution_name.trim(),
      location: location.trim() || undefined,
      contact_name: contact_name.trim() || undefined,
      contact_email: contact_email.trim(),
      role,
      approx_students: approx_students ? Number(approx_students) : undefined,
      notes: notes.trim() || undefined,
    });
    setBusy(false);
    if (error) {
      console.error("[institution-register] failed", error);
      alert("Couldn't send right now — please try again.");
      return;
    }
    navigate(routes.institutionFind);
  }

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" onClick={send} disabled={busy}>
            <Send size={16} />
            {busy ? "Sending…" : "Send request"}
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
          <TextField label="Institution name" icon={<Building2 size={17} />} placeholder="Your institution" value={institution_name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Country & city" icon={<MapPin size={17} />} placeholder="City, country" value={location} onChange={(e) => setLocation(e.target.value)} />
          <TextField label="Your name" placeholder="Your name" value={contact_name} onChange={(e) => setContact(e.target.value)} />
          <div>
            <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">Your role</div>
            <div className="flex flex-wrap gap-1.5">
              {ROLES.map((r) => (
                <Pill key={r} small on={role === r} onClick={() => setRole(r)}>{r}</Pill>
              ))}
            </div>
          </div>
          <TextField label="Work email" mono icon={<Mail size={17} />} type="email" placeholder="you@school.edu" value={contact_email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Approx. students" icon={<Users size={17} />} type="number" placeholder="e.g. 640" value={approx_students} onChange={(e) => setStudents(e.target.value)} />
          <TextField label="Anything we should know" placeholder="A line about your programme" value={notes} onChange={(e) => setNotes(e.target.value)} />
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
