import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { LocationField, TextField } from "@/components/app/fields";
import { Meta, Pill } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { disciplines } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

/**
 * 55 · Anonymous salary submission (G14). Fields: Field, Title, Pay per month,
 * Location. Nothing is linked to the user's account.
 */
export default function SalarySubmit() {
  const navigate = useNavigate();
  const [field, setField] = useState<string | null>(null);

  return (
    <MobileShell
      header={<BackHeader title="Add a salary" />}
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" onClick={() => navigate(routes.salarySubmitted)}>
            Submit anonymously
          </Button>
        </div>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-6">
        <h1 className="mt-3 font-serif text-[24px] font-medium leading-[1.08] tracking-[-0.02em]">
          Share a number. Make pay fairer.
        </h1>
        <p className="mt-2 text-[13.5px] leading-[1.5] text-tg-brown">
          Your entry joins the community database to help everyone negotiate from
          the same picture.
        </p>

        {/* Privacy note — nothing is linked to the account */}
        <div className="mt-4 flex items-start gap-2.5 rounded-DEFAULT border border-tg-line bg-tg-stone2 px-3.5 py-3">
          <ShieldCheck size={18} className="mt-0.5 flex-none text-tg-blue-accent" />
          <Meta className="leading-[1.5]">
            Completely anonymous. This is never linked to your name, profile or
            account — not now, not later.
          </Meta>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {/* Field — pills */}
          <div>
            <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
              Field
            </div>
            <div className="flex flex-wrap gap-1.5">
              {disciplines.map((d) => (
                <Pill
                  key={d}
                  small
                  on={field === d}
                  onClick={() => setField((v) => (v === d ? null : d))}
                >
                  {d}
                </Pill>
              ))}
            </div>
          </div>

          <TextField label="Title" placeholder="e.g. Senior Designer" />
          <TextField
            label="Pay per month"
            mono
            type="text"
            inputMode="numeric"
            placeholder="e.g. 12,000 AED"
          />
          <LocationField label="Location" />
        </div>

        <Meta className="mt-5 block text-center">
          One honest figure makes the whole community stronger.
        </Meta>
      </div>
    </MobileShell>
  );
}
