import { Check, GraduationCap } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { InstLogo } from "@/components/app/inst-logo";
import { Chip } from "@/components/brand/chip";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { schools } from "@/lib/fixtures";
import { cn } from "@/lib/utils";

const TIMELINE: { label: string; detail: string; state: "done" | "active" | "next" }[] = [
  { label: "Enrolled", detail: "Linked to your institution, every Pro feature free.", state: "done" },
  { label: "Graduating", detail: "Your campus link is winding down for class of 2027.", state: "active" },
  { label: "Designer account", detail: "You keep everything and continue as a free designer.", state: "next" },
];

/**
 * 44 · Graduation status. Shows the student's institutional link; on graduation the
 * account keeps all its work, connections and collaborations, drops the institutional
 * link and becomes a free Designer account.
 */
export default function StudentGraduation() {
  const school = schools[0];

  return (
    <MobileShell header={<BackHeader title="Graduation status" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-5 pb-12">
        {/* Current institutional link */}
        <div className="flex items-center gap-3.5 rounded-lg border border-tg-line bg-tg-card p-4">
          <InstLogo school={school} size={46} />
          <div className="min-w-0">
            <div className="truncate font-serif text-[18px] font-medium tracking-[-0.01em] text-tg-ink">
              {school.name}
            </div>
            <div className="mt-1.5">
              <Chip>Student · graduating 2027</Chip>
            </div>
          </div>
        </div>

        {/* What happens */}
        <h2 className="mt-7 font-serif text-[22px] font-medium leading-tight tracking-[-0.02em] text-tg-ink">
          When you graduate
        </h2>
        <p className="mt-2.5 font-body text-[14.5px] leading-relaxed text-tg-brown">
          Nothing you have made goes away. Your account keeps all its work, connections and
          collaborations. It simply drops the institutional link and continues as a free Designer
          account — you stay exactly where you left off, minus the campus subscription.
        </p>

        {/* Timeline */}
        <div className="mt-7 flex flex-col">
          {TIMELINE.map((step, i) => (
            <div key={step.label} className="flex gap-3.5">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-9 w-9 flex-none items-center justify-center rounded-pill border",
                    step.state === "done" && "border-tg-blue-accent bg-tg-blue text-white",
                    step.state === "active" && "border-tg-blue-accent text-tg-blue-accent",
                    step.state === "next" && "border-tg-line text-tg-brown-soft",
                  )}
                >
                  {step.state === "done" ? (
                    <Check size={17} strokeWidth={2.5} />
                  ) : (
                    <GraduationCap size={17} />
                  )}
                </span>
                {i < TIMELINE.length - 1 && (
                  <span
                    className={cn("my-1 w-px flex-1", step.state === "done" ? "bg-tg-blue-accent" : "bg-tg-line")}
                    style={{ minHeight: 26 }}
                  />
                )}
              </div>
              <div className="pb-6">
                <span
                  className={cn(
                    "font-display text-[15px] font-semibold",
                    step.state === "next" ? "text-tg-brown-soft" : "text-tg-ink",
                  )}
                >
                  {step.label}
                </span>
                <Meta className="mt-1 block max-w-[270px]">{step.detail}</Meta>
              </div>
            </div>
          ))}
        </div>

        {/* Action */}
        <Button variant="ghost" full size="lg">
          Mark as graduated
        </Button>
        <Meta className="mt-3 block text-center">
          This happens automatically when your institution confirms your graduation — you do not
          need to do anything.
        </Meta>
      </div>
    </MobileShell>
  );
}
