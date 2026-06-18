import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Plus, X } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Chip } from "@/components/brand/chip";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { salaryService } from "@/services/salary";
import type { SalaryEntry } from "@/lib/types";

/** Inline filter — styled like the editorial field but powered by a native select. */
function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const set = value !== "";
  return (
    <label className="relative flex min-w-0 flex-1 items-center rounded-DEFAULT border border-tg-line bg-tg-card px-3 py-2.5 text-left">
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[9.5px] font-semibold uppercase tracking-[0.08em] text-tg-brown-soft">
          {label}
        </span>
        <span
          className={cn(
            "block truncate text-[13px] font-medium",
            set ? "text-tg-ink" : "text-tg-brown-soft",
          )}
        >
          {set ? value : "Any"}
        </span>
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label={label}
      >
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

/**
 * 54 · Salary database (G7, G14). Empty at launch — grows only from anonymous
 * community submissions; ships NO placeholder salaries. Filters for Location,
 * Title and Field; primary action is an anonymous submission.
 */
export default function SalaryDB() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<SalaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [field, setField] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    salaryService
      .list({ location: location || undefined, title: title || undefined, field: field || undefined })
      .then((rows) => {
        if (active) {
          setEntries(rows);
          setError(null);
        }
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Could not load salaries.");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [location, title, field]);

  // Build filter option lists from the loaded data so users can only pick
  // values that actually exist in the community database (G14).
  const { locationOptions, titleOptions, fieldOptions } = useMemo(() => {
    const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b));
    return {
      locationOptions: uniq(entries.map((e) => e.location)),
      titleOptions: uniq(entries.map((e) => e.title)),
      fieldOptions: uniq(entries.map((e) => e.field)),
    };
  }, [entries]);

  const hasFilters = !!(location || title || field);

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
          <FilterSelect label="Location" value={location} options={locationOptions} onChange={setLocation} />
          <FilterSelect label="Title" value={title} options={titleOptions} onChange={setTitle} />
          <FilterSelect label="Field" value={field} options={fieldOptions} onChange={setField} />
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => { setLocation(""); setTitle(""); setField(""); }}
            className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-tg-brown-soft"
          >
            <X size={12} /> Clear filters
          </button>
        )}

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

        {/* Results */}
        {!loading && entries.length > 0 && (
          <ul className="mt-6 divide-y divide-tg-line-soft overflow-hidden rounded-lg border border-tg-line bg-tg-card">
            {entries.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 px-3.5 py-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-medium text-tg-ink">{e.title}</div>
                  <div className="mt-0.5 truncate text-[12px] text-tg-brown-soft">
                    {e.field} · {e.location}
                  </div>
                </div>
                <div className="flex-none text-right">
                  <div className="font-mono text-[14px] font-semibold text-tg-ink">
                    {Number(e.payPerMonth).toLocaleString()} {e.currency}
                  </div>
                  <div className="text-[10.5px] uppercase tracking-[0.08em] text-tg-brown-soft">per month</div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p className="mt-6 text-center text-[12.5px] text-red-500">{error}</p>
        )}

        {/* Empty state — real, no placeholder salaries (G14) */}
        {!loading && entries.length === 0 && !error && (
          <div className="mt-9 flex flex-col items-center rounded-lg border border-dashed border-tg-line bg-tg-stone2 px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tg-card">
              <LineChart size={24} className="text-tg-blue-accent" />
            </span>
            <h2 className="mt-4 font-serif text-[19px] font-medium leading-[1.15] tracking-[-0.01em]">
              {hasFilters ? "Nothing matches those filters yet." : "The picture is still being drawn."}
            </h2>
            <p className="mt-2 max-w-[16rem] text-[13px] leading-[1.5] text-tg-brown">
              {hasFilters
                ? "Try clearing a filter, or be the first to contribute a number for this slice."
                : "No salaries have been shared yet. The database grows entirely from anonymous submissions — be one of the first to add yours."}
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
