import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Pill } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { disciplines } from "@/lib/disciplines";
import { routes } from "@/lib/routes";
import { useAccountType } from "@/hooks/use-account-type";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { recordPracticeEvent } from "@/services/practice";

const TYPES = [
  "Gig / paid",
  "Part time",
  "Full time",
  "Competition partner",
  "Collaboration",
];

/**
 * 37 · Post a call out / brief.
 * Compose an open call: type, title, discipline, description, scope, budget &
 * timeline. When the author is a client this writes a row into
 * `client_briefs` (which also feeds the client Daily Practice streak).
 * For other account types, the form posts a call-out via existing flows.
 */
export default function PostCallout() {
  const navigate = useNavigate();
  const { accountType } = useAccountType();
  const { session } = useSession();
  const [type, setType] = useState(TYPES[0]);
  const [title, setTitle] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const toggle = (d: string) =>
    setPicked((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  async function submit() {
    if (!title.trim()) {
      setErr("Give your brief a title");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      if (accountType === "client" && session?.user?.id) {
        const { error } = await supabase.from("client_briefs").insert({
          client_id: session.user.id,
          title: title.trim(),
          brief_type: type,
          disciplines: picked,
          description: description || null,
          scope: scope || null,
          budget_text: budget || null,
          timeline: timeline || null,
        });
        if (error) throw error;
        const r = await recordPracticeEvent();
        if (
          r.granted_now ||
          (r.status && "granted_at" in r.status && r.status.granted_at &&
            !sessionStorage.getItem("practice-reward-shown"))
        ) {
          sessionStorage.setItem("practice-reward-shown", "1");
          navigate(routes.practiceReward);
          return;
        }
      }
      navigate(routes.callouts);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not post brief");
    } finally {
      setBusy(false);
    }
  }

  const ctaLabel = accountType === "client" ? "Post brief" : "Post call out";

  return (
    <MobileShell
      header={
        <div className="flex flex-none items-center gap-3 border-b border-tg-line px-[18px] py-3">
          <button type="button" onClick={() => navigate(-1)} aria-label="Close">
            <X size={22} className="text-tg-ink" />
          </button>
          <span className="flex-1 font-display text-[15px] font-semibold text-tg-ink">
            {accountType === "client" ? "New brief" : "New call out"}
          </span>
        </div>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-8">
        <h1 className="mt-4 font-serif text-[24px] font-medium leading-[1.08] tracking-[-0.02em] text-tg-ink">
          What do you need, and who for?
        </h1>

        <div className="mt-6 flex flex-col gap-5">
          <Field label="Type">
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <Pill key={t} on={type === t} onClick={() => setType(t)}>
                  {t}
                </Pill>
              ))}
            </div>
          </Field>

          <Field label="Title">
            <TextInput value={title} onChange={setTitle} placeholder="e.g. Looking for a lighting designer" />
          </Field>

          <Field label="Discipline">
            <div className="flex flex-wrap gap-2">
              {disciplines.slice(0, 12).map((d) => (
                <Pill key={d} small on={picked.includes(d)} onClick={() => toggle(d)}>
                  {d}
                </Pill>
              ))}
            </div>
          </Field>

          <Field label="Description">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the brief — what you're making, the tone, and what you're looking for in a partner."
              className="w-full resize-none rounded-DEFAULT border border-tg-line bg-tg-card px-3.5 py-3 font-body text-[14px] leading-[1.5] text-tg-ink outline-none placeholder:text-tg-brown-soft focus:border-tg-blue-accent"
            />
          </Field>

          <Field label="Scope">
            <TextInput value={scope} onChange={setScope} placeholder="e.g. Two living floors, lighting layer only" />
          </Field>

          <div className="flex gap-3">
            <div className="flex-1">
              <Field label="Budget / terms">
                <TextInput value={budget} onChange={setBudget} placeholder="18,000–24,000 AED" />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="Timeline">
                <TextInput value={timeline} onChange={setTimeline} placeholder="10 weeks" />
              </Field>
            </div>
          </div>

          {err ? (
            <p className="font-body text-[13px] text-tg-terra">{err}</p>
          ) : null}
        </div>
      </div>

      <div className="flex-none border-t border-tg-line px-[22px] py-3.5">
        <Button full size="lg" disabled={busy} onClick={submit}>
          {busy ? "Posting…" : ctaLabel}
        </Button>
      </div>
    </MobileShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
        {label}
      </div>
      {children}
    </div>
  );
}

function TextInput({
  value, onChange, placeholder,
}: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-DEFAULT border border-tg-line bg-tg-card px-3.5 py-3 font-body text-[14px] text-tg-ink outline-none placeholder:text-tg-brown-soft focus:border-tg-blue-accent"
    />
  );
}
