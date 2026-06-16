import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Segmented } from "@/components/app/segmented";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta, Pill } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { makers as allMakers, makerById } from "@/lib/fixtures";
import { path, routes } from "@/lib/routes";
import { semanticSearch, type SearchMatch } from "@/services/search";

const DISCIPLINES = ["Any discipline", "Architecture", "Product", "Type & brand", "Ceramics", "Textiles"];
const CITIES = ["Any city", "Dubai", "Abu Dhabi", "Beirut", "Lisbon", "Amman"];
const AVAILABILITY = ["Anyone", "Available now", "Open to hire", "Open to collaborate"];

/**
 * 32 · People search (G4, G7). Intent-aware results for makers and studios — by
 * meaning, not keyword. Filter by discipline, city and availability. You can
 * search people OR projects.
 */
export default function SearchPeople() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const [discipline, setDiscipline] = useState("Any discipline");
  const [city, setCity] = useState("Any city");
  const [availability, setAvailability] = useState("Anyone");
  const [matches, setMatches] = useState<SearchMatch[] | null>(q ? null : []);

  useEffect(() => {
    let cancel = false;
    if (!q) { setMatches([]); return; }
    semanticSearch({ mode: "people", query: q, limit: 20 }).then((m) => { if (!cancel) setMatches(m); });
    return () => { cancel = true; };
  }, [q]);

  const makers = useMemo(() => {
    if (!q) return allMakers;
    if (matches === null) return [] as typeof allMakers;
    return matches.map((m) => makerById(m.ref_id)).filter(Boolean);
  }, [q, matches]);
  const queryLabel = q || "Designers near me, warm materials";

  return (
    <MobileShell footer={null} header={<BackHeader title="People" />}>
      <div className="flex-none px-[22px] pt-3">
        <div className="flex items-center gap-2.5 rounded-DEFAULT border-[1.5px] border-tg-blue-accent bg-tg-card px-3.5 py-2.5">
          <Search size={18} className="text-tg-blue-accent" />
          <span className="flex-1 font-display text-[15px] font-medium text-tg-ink">
            Designers near me, warm materials
          </span>
        </div>

        <div className="mt-3">
          <Segmented
            items={["People", "Projects"]}
            active="People"
            onChange={(s) => {
              if (s === "Projects") navigate(routes.visualSearch);
            }}
          />
        </div>
      </div>

      <div className="flex-none px-[22px] pt-3">
        <FilterRow value={availability} options={AVAILABILITY} onChange={setAvailability} />
        <div className="mt-2">
          <FilterRow value={discipline} options={DISCIPLINES} onChange={setDiscipline} />
        </div>
        <div className="mt-2">
          <FilterRow value={city} options={CITIES} onChange={setCity} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-6">
        <RefreshHint />
        <div className="flex items-center gap-2">
          <Search size={13} className="text-tg-blue-accent" />
          <Meta>People matched by meaning, not keyword</Meta>
        </div>

        <div className="mt-3 flex flex-col divide-y divide-tg-line-soft">
          {makers.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-3">
              <button
                type="button"
                onClick={() => navigate(path(routes.publicProfile, { id: m.id }))}
                aria-label={`Open ${m.name}`}
              >
                <Avatar maker={m} size={46} />
              </button>
              <button
                type="button"
                onClick={() => navigate(path(routes.publicProfile, { id: m.id }))}
                className="min-w-0 flex-1 text-left"
              >
                <NameRow maker={m} size={14.5} />
                <Meta className="mt-0.5 block">
                  {m.role} · {m.city}
                </Meta>
              </button>
              {typeof m.match === "number" && (
                <div className="text-right">
                  <div className="font-display text-[15px] font-semibold text-tg-blue-accent">{m.match}%</div>
                  <Meta>match</Meta>
                </div>
              )}
              <Button
                variant="outlineAccent"
                size="sm"
                onClick={() => navigate(routes.request)}
              >
                {m.role.startsWith("Studio") ? "View" : "Connect"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}

function FilterRow({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="-mx-[22px] flex gap-2 overflow-x-auto px-[22px] pb-0.5">
      {options.map((o) => (
        <Pill key={o} small on={o === value} onClick={() => onChange(o)}>
          {o}
        </Pill>
      ))}
    </div>
  );
}
