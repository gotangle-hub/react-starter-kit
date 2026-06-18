import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Users } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Segmented } from "@/components/app/segmented";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta, Pill } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { path, routes } from "@/lib/routes";
import { semanticSearch, type SearchMatch } from "@/services/search";
import { getProfilesByIds, listProfiles, makerFromProfile } from "@/services/profile";
import type { Maker } from "@/lib/profile-shape";

const DISCIPLINES = ["Any discipline", "Architecture", "Product", "Type & brand", "Ceramics", "Textiles"];
const CITIES = ["Any city", "Dubai", "Abu Dhabi", "Beirut", "Lisbon", "Amman"];
const AVAILABILITY = ["Anyone", "Available now", "Open to hire", "Open to collaborate"];

/**
 * 32 · People search (G4, G7). Intent-aware real-people results. With no query
 * we fall back to a recent-designers list (real profiles, no fixtures).
 */
export default function SearchPeople() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const [discipline, setDiscipline] = useState("Any discipline");
  const [city, setCity] = useState("Any city");
  const [availability, setAvailability] = useState("Anyone");
  const [matches, setMatches] = useState<SearchMatch[] | null>(q ? null : []);
  const [fallback, setFallback] = useState<Maker[]>([]);
  const [matchMakers, setMatchMakers] = useState<Map<string, Maker>>(new Map());

  useEffect(() => {
    let cancel = false;
    if (!q) {
      listProfiles({ limit: 20, excludeSelf: true }).then((rows) => {
        if (!cancel) setFallback(rows.map((r) => makerFromProfile(r) as Maker));
      });
      setMatches([]);
      return () => { cancel = true; };
    }
    semanticSearch({ mode: "people", query: q, limit: 20 }).then(async (m) => {
      if (cancel) return;
      setMatches(m);
      const ids = m.map((x) => x.ref_id);
      const profiles = await getProfilesByIds(ids);
      if (cancel) return;
      const map = new Map<string, Maker>();
      profiles.forEach((row, id) => map.set(id, makerFromProfile(row) as Maker));
      setMatchMakers(map);
    });
    return () => { cancel = true; };
  }, [q]);

  const people: Maker[] = useMemo(() => {
    if (!q) return fallback;
    if (matches === null) return [];
    return matches.map((m) => matchMakers.get(m.ref_id)).filter(Boolean) as Maker[];
  }, [q, matches, matchMakers, fallback]);

  const queryLabel = q || "Recent designers";

  return (
    <MobileShell footer={null} header={<BackHeader title="People" />}>
      <div className="flex-none px-[22px] pt-3">
        <div className="flex items-center gap-2.5 rounded-DEFAULT border-[1.5px] border-tg-blue-accent bg-tg-card px-3.5 py-2.5">
          <Search size={18} className="text-tg-blue-accent" />
          <span className="flex-1 font-display text-[15px] font-medium text-tg-ink">
            {queryLabel}
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

        {people.length === 0 ? (
          <div className="mt-10 flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
              <Users size={22} />
            </span>
            <h2 className="mt-4 font-serif text-[20px] font-medium tracking-[-0.01em]">{q ? "No people match yet" : "No designers found"}</h2>
            <Meta className="mt-1.5 block max-w-[260px]">{q ? "Try a different query — search understands meaning." : "Once designers join, you can search and shortlist them here."}</Meta>
          </div>
        ) : (
          <div className="mt-3 flex flex-col divide-y divide-tg-line-soft">
            {people.map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-3">
                <button
                  type="button"
                  onClick={() => navigate(path(routes.publicProfile, { id: m.handle ?? m.id }))}
                  aria-label={`Open ${m.name}`}
                >
                  <Avatar maker={m} size={46} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(path(routes.publicProfile, { id: m.handle ?? m.id }))}
                  className="min-w-0 flex-1 text-left"
                >
                  <NameRow maker={m} size={14.5} />
                  <Meta className="mt-0.5 block">
                    {m.role}{m.city ? ` · ${m.city}` : ""}
                  </Meta>
                </button>
                <Button
                  variant="outlineAccent"
                  size="sm"
                  onClick={() => navigate(routes.request)}
                >
                  Connect
                </Button>
              </div>
            ))}
          </div>
        )}
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
