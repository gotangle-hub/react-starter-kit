import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LineChart, Plus } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Chip } from "@/components/brand/chip";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

/** Lightweight filter control rendered as a tappable, labelled box. */
function FilterBox({ label, value }: { label: string; value: string }) {
  const set = value !== "Any";
  return (
    <button
      type="button"
      className="flex min-w-0 flex-1 items-center justify-between gap-1.5 rounded-DEFAULT border border-tg-line bg-tg-card px-3 py-2.5 text-left"
    >
      <span className="min-w-0">
        <span className="block font-display text-[9.5px] font-semibold uppercase tracking-[0.08em] text-tg-brown-soft">
          {label}
        </span>
        <span
          className={cn(
            "block truncate text-[13px] font-medium",
            set ? "text-tg-ink" : "text-tg-brown-soft",
          )}
        >
          {value}
        </span>
      </span>
      <ChevronDown size={15} className="flex-none text-tg-brown-soft" />
    </button>
  );
}

/**
 * 54 · Salary database (G7, G14). Empty at launch — grows only from anonymous
 * community submissions; ships NO placeholder salaries. Filters for Location,
 * Title and Field; primary action is an anonymous submission.
 */
export default function SalaryDB() {
  const navigate = useNavigate();
  // No seeded data — the database starts empty and grows from the community (G14).
  const [entries] = useState<never[]>([]);

  return (
    <MobileShell header={<BackHeader title="Salary database" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-10">
        <RefreshHint />

        <Chip>Pay transparency</Chip>
        <h1 className="mt-3 font-serif text-[26px] font-medium leading-[1.06] tracking-[-0.02em]">
          What design actually pays — set by the people doing it.
        </h1>
        <p className="mt-2.5 text-[13.5px] leading-[1.5] text-tg-brown">
          Every figure here is contributed anonymously by the community. Open to
          designers, studios, institutions and students.
        </p>

        {/* Filters — Location · Title · Field */}
        <div className="mt-5 flex gap-2">
          <FilterBox label="Location" value="Any" />
          <FilterBox label="Title" value="Any" />
          <FilterBox label="Field" value="Any" />
        </div>

        {/* Primary action — add a salary anonymously */}
        <div className="mt-4">
          <Button full size="lg" onClick={() => navigate(routes.salarySubmit)}>
            <Plus size={17} strokeWidth={2.25} />
            Add a salary anonymously
          </Button>
          <Meta className="mt-2 block text-center">
            Never linked to your account. It helps spread fairness across the community.
          </Meta>
        </div>

        {/* Empty state — real, no placeholder salaries (G14) */}
        {entries.length === 0 && (
          <div className="mt-9 flex flex-col items-center rounded-lg border border-dashed border-tg-line bg-tg-stone2 px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tg-card">
              <LineChart size={24} className="text-tg-blue-accent" />
            </span>
            <h2 className="mt-4 font-serif text-[19px] font-medium leading-[1.15] tracking-[-0.01em]">
              The picture is still being drawn.
            </h2>
            <p className="mt-2 max-w-[16rem] text-[13px] leading-[1.5] text-tg-brown">
              No salaries have been shared yet. The database grows entirely from
              anonymous submissions — be one of the first to add yours.
            </p>
            <Button
              variant="outlineAccent"
              size="sm"
              className="mt-5"
              onClick={() => navigate(routes.salarySubmit)}
            >
              Contribute a salary
            </Button>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
