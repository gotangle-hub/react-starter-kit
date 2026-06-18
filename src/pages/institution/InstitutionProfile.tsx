import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Camera, GraduationCap, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { InstLogo } from "@/components/app/inst-logo";
import { Meta, Pill } from "@/components/brand/atoms";
import { TextField } from "@/components/app/fields";
import { UsernamePicker } from "@/components/app/username-picker";
import { Button } from "@/components/ui/button";
import { recallInstitution } from "@/services/institutions";
import { routes } from "@/lib/routes";
import { updateMyProfile } from "@/services/profile";
import { checkUsernameAvailable } from "@/services/usernames";

/** 07 · Student profile setup — includes a unique @username. */
export default function InstitutionProfile() {
  const navigate = useNavigate();
  const inst = recallInstitution();
  const s = inst
    ? { name: inst.name, tint: inst.tint ?? "#161514", initials: inst.initials ?? inst.name.slice(0, 2).toUpperCase() }
    : { name: "Your institution", tint: "#161514", initials: "··" };
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameOk, setUsernameOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onContinue() {
    setError(null);
    if (!usernameOk) {
      setError("Pick an available username to continue.");
      return;
    }
    if (!(await checkUsernameAvailable(username))) {
      setError("That username was just taken — try another.");
      return;
    }
    setBusy(true);
    try {
      await updateMyProfile({ display_name: name || null, username });
      navigate(`${routes.institutionConsent}?role=student`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          {error && <p className="mb-2 text-[12.5px] text-tg-terra" role="alert">{error}</p>}
          <Button full size="lg" onClick={onContinue} disabled={busy}>
            {busy ? "Saving…" : "Enter Tangle"}
          </Button>
        </div>
      }
    >
      <BackHeader title="Set up your profile" />
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-3.5 pb-4">
        <span className="mb-3.5 inline-flex items-center gap-2.5 rounded-pill bg-tg-stone2 py-1.5 pl-2 pr-3">
          <InstLogo school={s} size={24} />
          <span className="font-display text-[12.5px] font-semibold">{s.name}</span>
          <span className="rounded-chip bg-tg-yellow px-1.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.1em] text-tg-ink dark:text-white">Student</span>
        </span>

        <div className="mb-4 flex items-center gap-3.5">
          <span className="flex h-16 w-16 flex-none items-center justify-center rounded-pill border-[1.5px] border-dashed border-tg-line">
            <Camera size={22} className="text-tg-brown-soft" />
          </span>
          <div>
            <div className="font-display text-[15px] font-semibold">Add a profile image</div>
            <Meta>No faces required — your work speaks.</Meta>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <TextField label="Name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <UsernamePicker
            value={username}
            onChange={setUsername}
            onValidityChange={(st) => setUsernameOk(st.valid && st.available)}
            label="Student username"
            baseSuggestion={name}
          />
          <TextField label="Programme" icon={<GraduationCap size={17} />} placeholder="e.g. MA Spatial Design" />
          <TextField label="Year" placeholder="e.g. Year 2 · graduating 2027" />
          <div>
            <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">Field</div>
            <div className="flex flex-wrap gap-1.5">
              {["Spatial", "Interior", "Exhibition", "Furniture", "Concept"].map((r, i) => (
                <Pill key={r} small on={i < 3}>{r}</Pill>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-[18px] flex gap-3 rounded-lg border border-tg-line bg-tg-blue-accent/5 p-3.5">
          <BadgeCheck size={20} className="mt-0.5 flex-none text-tg-blue-accent" />
          <span className="font-body text-[12.8px] leading-[1.5] text-tg-ink">
            When you graduate, your account stays exactly as it is — work, connections and all. It simply unlinks from {s.name} and becomes a free Designer account.
          </span>
        </div>

        <div className="mt-3 rounded-lg bg-tg-emph p-4 text-white">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-tg-yellow" />
            <span className="font-display text-[14px] font-semibold">Free while you study</span>
          </div>
          <p className="mt-2 font-body text-[12.5px] leading-[1.5] text-white/75">
            Every feature is free on your student account — unlimited collaborations, the full salary database and Student competitions included. Only paid promotion is excluded.
          </p>
        </div>
      </div>
    </MobileShell>
  );
}
