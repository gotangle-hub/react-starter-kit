import { useState } from "react";
import { BookOpen, Lock, Mail, Shapes } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { TextField } from "@/components/app/fields";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * 25 · Professor creates a class. Classes are always private (stated, no toggle).
 * Choose Studio vs Theoretical (each with a one-line description), and optionally
 * invite a TA by email. "Create class" → taInvited if a TA email was entered, else
 * the classList.
 */
const TYPES = [
  {
    id: "studio" as const,
    icon: Shapes,
    title: "Studio class",
    desc: "Project briefs, crits, shared references and student work.",
  },
  {
    id: "theory" as const,
    icon: BookOpen,
    title: "Theoretical class",
    desc: "Readings, lectures, discussion and documents.",
  },
];

export default function ProfessorCreateClass() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [type, setType] = useState<"studio" | "theory">("studio");
  const [hasTA, setHasTA] = useState(false);
  const [taEmail, setTaEmail] = useState("");

  const create = () => {
    if (hasTA && taEmail.trim()) navigate(routes.taInvited);
    else navigate(routes.classList);
  };

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" onClick={create}>
            Create class
          </Button>
        </div>
      }
    >
      <BackHeader title="New class" />

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-3.5 pb-4">
        <h1 className="mb-4 font-serif text-[26px] font-medium leading-[1.08] tracking-[-0.02em]">
          Set up a class.
        </h1>

        <div className="flex flex-col gap-[14px]">
          <TextField
            label="Class name"
            icon={<BookOpen size={17} />}
            placeholder="e.g. Spatial Studio"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Class type */}
          <div>
            <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
              Class type
            </div>
            <div className="flex flex-col gap-2.5">
              {TYPES.map((t) => {
                const on = type === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-[13px] border-[1.5px] p-[13px] text-left transition-colors",
                      on
                        ? "border-tg-blue-accent bg-tg-stone2"
                        : "border-tg-line bg-tg-card",
                    )}
                  >
                    <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-md bg-tg-stone2">
                      <Icon size={19} className="text-tg-blue-accent" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-display text-[14.5px] font-semibold leading-tight text-tg-ink">
                        {t.title}
                      </span>
                      <span className="mt-1 block font-body text-[12px] leading-snug text-tg-brown">
                        {t.desc}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-pill border-[1.5px]",
                        on ? "border-tg-blue-accent" : "border-tg-line",
                      )}
                    >
                      {on && <span className="h-2.5 w-2.5 rounded-pill bg-tg-blue-accent" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Teaching assistant */}
          <div>
            <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
              Teaching assistant
            </div>
            <div className="flex items-center justify-between rounded-[12px] border border-tg-line bg-tg-card px-3.5 py-3">
              <span className="font-display text-[13.5px] font-medium text-tg-ink">
                Do you have a TA?
              </span>
              <div className="flex gap-1 rounded-pill bg-tg-stone2 p-[3px]">
                {[
                  { label: "Yes", val: true },
                  { label: "No", val: false },
                ].map((o) => {
                  const on = hasTA === o.val;
                  return (
                    <button
                      key={o.label}
                      type="button"
                      onClick={() => setHasTA(o.val)}
                      className={cn(
                        "rounded-pill px-[15px] py-1.5 font-display text-[12px] font-semibold transition-colors",
                        on ? "bg-tg-emph text-tg-emph-text" : "bg-transparent text-tg-brown",
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {hasTA && (
              <div className="mt-2.5">
                <TextField
                  label="Invite your TA by email"
                  icon={<Mail size={16} />}
                  mono
                  type="email"
                  placeholder="ta@school.edu"
                  value={taEmail}
                  onChange={(e) => setTaEmail(e.target.value)}
                />
                <Meta className="mt-2 block">
                  Your TA can post documents and help run the chat, but can&apos;t delete the class.
                </Meta>
              </div>
            )}
          </div>

          {/* Always private */}
          <div className="flex items-center gap-2.5 rounded-[12px] bg-tg-stone2 p-[13px]">
            <Lock size={16} strokeWidth={2.25} className="flex-none text-tg-brown" />
            <span className="flex-1 font-body text-[12.5px] leading-snug text-tg-brown">
              Every class is private — visible only to enrolled students.
            </span>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
