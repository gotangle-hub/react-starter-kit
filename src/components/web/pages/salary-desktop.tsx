import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Plus, X } from "lucide-react";

import { WebPage } from "@/components/web/web-page";
import { RightRail } from "@/components/web/right-rail";
import { Chip } from "@/components/brand/chip";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { salaryService } from "@/services/salary";
import type { SalaryEntry } from "@/lib/types";

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
    <label className="relative flex min-w-0 flex-1 items-center rounded-DEFAULT border border-tg-line bg-tg-card px-4 py-3 text-left">
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[10px] font-semibold uppercase tracking-[0.08em] text-tg-brown-soft">
          {label}
        </span>
        <span className={cn("block truncate text-[14px] font-medium", set ? "text-tg-ink" : "text-tg-brown-soft")}>
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

/** Desktop Salary database — wider filters row, two-column results, right rail. */
export function SalaryDesktop() {
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

  const { locationOptions, titleOptions, fieldOptions } = useMemo(() => {
    const uniq = (arr: string[]) =>
      Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b));
    return {
      locationOptions: uniq(entries.map((e) => e.location)),
      titleOptions: uniq(entries.map((e) => e.title)),
      fieldOptions: uniq(entries.map((e) => e.field)),
    };
  }, [entries]);

  const hasFilters = !!(location || title || field);

  return (
    <WebPage maxWidth={1100} rail={<RightRail />}>
      <Chip>Pay transparency</Chip>
      <h1 className="mt-4 max-w-[760px] font-serif text-[40px] font-medium leading-[1.05] tracking-[-0.02em] text-tg-ink">
        What design actually pays — set by the people doing it.
      </h1>
      <p className="mt-3 max-w-[640px] text-[15px] leading-[1.55] text-tg-brown">
        Every figure here is contributed anonymously by the community. Open to designers, studios,
        institutions and students.
      </p>

      <div className="mt-7 flex flex-wrap items-stretch gap-3">
        <FilterSelect label="Location" value={location} options={locationOptions} onChange={setLocation} />
        <FilterSelect label="Title" value={title} options={titleOptions} onChange={setTitle} />
        <FilterSelect label="Field" value={field} options={fieldOptions} onChange={setField} />
        <Button size="lg" onClick={() => navigate(routes.salarySubmit)} className="shrink-0">
          <Plus size={16} strokeWidth={2.25} />
          Add a salary anonymously
        </Button>
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={() => { setLocation(""); setTitle(""); setField(""); }}
          className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-tg-brown-soft"
        >
          <X size={12} /> Clear filters
        </button>
      )}
      <Meta className="mt-2 block">
        Never linked to your account. It helps spread fairness across the community.
      </Meta>

      {!loading && entries.length > 0 && (
        <ul className="mt-8 grid grid-cols-1 gap-3 min-[900px]:grid-cols-2">
          {entries.map((e) => (
            <li
              key={e.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-tg-line bg-tg-card px-4 py-3.5"
            >
              <div className="min-w-0">
                <div className="truncate font-display text-[15px] font-semibold text-tg-ink">{e.title}</div>
                <div className="mt-0.5 truncate text-[12.5px] text-tg-brown-soft">
                  {e.field} · {e.location}
                </div>
              </div>
              <div className="flex-none text-right">
                <div className="font-mono text-[15px] font-semibold text-tg-ink">
                  {Number(e.payPerMonth).toLocaleString()} {e.currency}
                </div>
                <div className="text-[10.5px] uppercase tracking-[0.08em] text-tg-brown-soft">per month</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-8 text-center text-[13px] text-red-500">{error}</p>}

      {!loading && entries.length === 0 && !error && (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-tg-line bg-tg-card px-6 py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-tg-stone2">
            <LineChart size={28} className="text-tg-blue-accent" />
          </span>
          <h2 className="mt-5 font-serif text-[24px] font-medium leading-[1.15] tracking-[-0.01em] text-tg-ink">
            {hasFilters ? "Nothing matches those filters yet." : "The picture is still being drawn."}
          </h2>
          <p className="mt-2 max-w-[420px] text-[14px] leading-[1.55] text-tg-brown">
            {hasFilters
              ? "Try clearing a filter, or be the first to contribute a number for this slice."
              : "No salaries have been shared yet. The database grows entirely from anonymous submissions — be one of the first to add yours."}
          </p>
          <Button variant="outlineAccent" size="sm" className="mt-6" onClick={() => navigate(routes.salarySubmit)}>
            Contribute a salary
          </Button>
        </div>
      )}
    </WebPage>
  );
}
