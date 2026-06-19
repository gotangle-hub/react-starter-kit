import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Pill, Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { disciplines } from "@/lib/disciplines";
import { routes } from "@/lib/routes";
import {
  loadPreferences,
  savePreferences,
  DEFAULT_PREFERENCES,
  type MatchPreferences,
  type Intent,
} from "@/services/match";

const AVAILABILITY = [
  { v: null, label: "Any" },
  { v: "open_to_work", label: "Open to work" },
  { v: "open_to_collab", label: "Open to collab" },
  { v: "full_time", label: "Full-time" },
];
const EXPERIENCE = [
  { v: null, label: "Any" },
  { v: "student", label: "Student" },
  { v: "junior", label: "Junior" },
  { v: "mid", label: "Mid" },
  { v: "senior", label: "Senior" },
];
const ACCOUNT_TYPES = [
  { v: "designer", label: "Designer" },
  { v: "studio", label: "Studio" },
];
const RECENCY = [
  { v: null, label: "Any time" },
  { v: 7, label: "Past week" },
  { v: 30, label: "Past month" },
  { v: 90, label: "Past 3 months" },
];

/** 19 · "Looking for…" filters — every filter unlocked for every account type. */
export default function MatchFilters() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<MatchPreferences>(DEFAULT_PREFERENCES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => setPrefs(await loadPreferences()))();
  }, []);

  function update<K extends keyof MatchPreferences>(k: K, v: MatchPreferences[K]) {
    setPrefs((p) => ({ ...p, [k]: v }));
  }
  function toggleArr<T>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  async function apply() {
    setSaving(true);
    await savePreferences(prefs);
    setSaving(false);
    navigate(routes.match);
  }

  return (
    <MobileShell
      header={
        <BackHeader
          title="Looking for…"
          right={
            <button type="button" onClick={() => setPrefs(DEFAULT_PREFERENCES)}>
              <Meta>Reset</Meta>
            </button>
          }
        />
      }
      footer={
        <div className="border-t border-tg-line bg-tg-bg px-[22px] py-4">
          <Button full size="lg" onClick={apply} disabled={saving}>
            {saving ? "Saving…" : "Show results"}
          </Button>
        </div>
      }
    >
      <div className="px-[22px] pb-6 pt-3">
        <Section label="Intent">
          <div className="flex gap-2">
            {(["connection", "collaboration"] as Intent[]).map((i) => (
              <Pill key={i} on={prefs.intent === i} onClick={() => update("intent", i)}>
                {i === "connection" ? "Connection" : "Collaboration"}
              </Pill>
            ))}
          </div>
        </Section>

        <Section label="Design field (multi-select)">
          <div className="flex flex-wrap gap-2">
            {disciplines.map((d) => (
              <Pill
                key={d}
                on={prefs.disciplines.includes(d)}
                onClick={() => update("disciplines", toggleArr(prefs.disciplines, d))}
              >
                {d}
              </Pill>
            ))}
          </div>
        </Section>

        <Section label="Location">
          <input
            type="text"
            placeholder="Any city or country"
            value={prefs.location ?? ""}
            onChange={(e) => update("location", e.target.value || null)}
            className="w-full rounded-pill border border-tg-line bg-tg-card px-4 py-3 font-display text-[14px] text-tg-ink placeholder:text-tg-brown focus:outline-none focus:ring-1 focus:ring-tg-blue"
          />
        </Section>

        <Section label="Availability">
          <div className="flex flex-wrap gap-2">
            {AVAILABILITY.map((a) => (
              <Pill
                key={a.label}
                on={prefs.availability === a.v}
                onClick={() => update("availability", a.v)}
              >
                {a.label}
              </Pill>
            ))}
          </div>
        </Section>

        <Section label="Experience level">
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE.map((x) => (
              <Pill
                key={x.label}
                on={prefs.experience_level === x.v}
                onClick={() => update("experience_level", x.v)}
              >
                {x.label}
              </Pill>
            ))}
          </div>
        </Section>

        <Section label="Account type">
          <div className="flex flex-wrap gap-2">
            {ACCOUNT_TYPES.map((a) => (
              <Pill
                key={a.v}
                on={prefs.account_types.includes(a.v)}
                onClick={() => update("account_types", toggleArr(prefs.account_types, a.v))}
              >
                {a.label}
              </Pill>
            ))}
          </div>
        </Section>

        <Section label="Recency of work">
          <div className="flex flex-wrap gap-2">
            {RECENCY.map((r) => (
              <Pill
                key={r.label}
                on={prefs.recency_days === r.v}
                onClick={() => update("recency_days", r.v)}
              >
                {r.label}
              </Pill>
            ))}
          </div>
        </Section>
      </div>
    </MobileShell>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 first:mt-2">
      <div className="mb-3 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
        {label}
      </div>
      {children}
    </div>
  );
}
