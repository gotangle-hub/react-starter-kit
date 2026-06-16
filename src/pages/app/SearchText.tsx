import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Search } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { AppHeader } from "@/components/app/app-header";
import { Segmented } from "@/components/app/segmented";
import { RefreshHint } from "@/components/app/bits";
import { Pill, Meta } from "@/components/brand/atoms";
import { routes } from "@/lib/routes";

const RECENT = ["Soft brutalist interiors", "Bent ply chair", "Warm concrete stair", "Type that breathes"];
const SUGGESTED_PROJECTS = ["Curved concrete", "Travertine", "Brass light", "Editorial type", "Warm renders", "Adaptive reuse"];
const SUGGESTED_PEOPLE = ["Architects in Dubai", "Ceramicists", "Type designers", "Available to hire", "Studios · interiors"];

/**
 * 28 · Smart search (G4, G7). Intent-aware search across projects, people, studios
 * and competitions — never names the technology. Toggle People vs Projects, recent
 * and suggested chips, and an entry to visual search.
 */
export default function SearchText() {
  const navigate = useNavigate();
  const [scope, setScope] = useState("Projects");
  const [query, setQuery] = useState("");
  const suggested = scope === "People" ? SUGGESTED_PEOPLE : SUGGESTED_PROJECTS;

  const run = (q: string) => {
    if (!q.trim()) return;
    navigate(scope === "People" ? routes.searchPeople : routes.visualSearch);
  };

  return (
    <MobileShell footer={<AppTabBar />}>
      <AppHeader />

      <div className="flex-none px-[22px] pb-3 pt-3.5">
        <h1 className="mb-3 font-serif text-[26px] font-medium leading-none tracking-[-0.02em]">Search</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(query);
          }}
          className="flex items-center gap-2.5 rounded-DEFAULT border-[1.5px] border-tg-blue-accent bg-tg-card px-3.5 py-3"
        >
          <Search size={18} className="text-tg-blue-accent" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you're looking for"
            className="flex-1 bg-transparent font-body text-[14.5px] text-tg-ink placeholder:text-tg-brown-soft focus:outline-none"
          />
          <button
            type="button"
            aria-label="Search by image"
            onClick={() => navigate(routes.searchVisual)}
            className="text-tg-brown"
          >
            <Camera size={19} />
          </button>
        </form>

        <div className="mt-3">
          <Segmented items={["Projects", "People"]} active={scope} onChange={setScope} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-6">
        <RefreshHint />

        <div className="mt-1 flex items-center gap-2">
          <Search size={13} className="text-tg-blue-accent" />
          <Meta>Understands meaning, not just keywords</Meta>
        </div>

        <SectionLabel>Recent</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {RECENT.map((r) => (
            <Pill key={r} small onClick={() => run(r)}>
              {r}
            </Pill>
          ))}
        </div>

        <SectionLabel>Suggested for you</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {suggested.map((s) => (
            <Pill key={s} small onClick={() => run(s)}>
              {s}
            </Pill>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate(routes.searchVisual)}
          className="mt-6 flex w-full items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-3.5 text-left"
        >
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-DEFAULT bg-tg-stone2">
            <Camera size={20} className="text-tg-ink" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[14.5px] font-semibold text-tg-ink">Search by image</div>
            <Meta className="mt-0.5 block">Find work that looks like a reference you have</Meta>
          </div>
        </button>
      </div>
    </MobileShell>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-2.5 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
      {children}
    </div>
  );
}
