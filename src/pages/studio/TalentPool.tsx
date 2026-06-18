import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderPlus, Search, Users } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { listProfiles, makerFromProfile, getMyProfile, type ProfileRow } from "@/services/profile";
import type { Maker } from "@/lib/profile-shape";

/**
 * 16 · Talent pool (G4, G7). Searchable pool of real designers.
 * Shortlist folders are user-built; with no folders yet we surface the empty
 * state and a strong search affordance (G14).
 */
export default function TalentPool() {
  const navigate = useNavigate();
  const [me, setMe] = useState<ProfileRow | null>(null);
  const [people, setPeople] = useState<Maker[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [profile, rows] = await Promise.all([
        getMyProfile(),
        listProfiles({ limit: 12, excludeSelf: true }),
      ]);
      if (!alive) return;
      setMe(profile);
      setPeople(rows.map((r) => makerFromProfile(r) as Maker));
    })();
    return () => { alive = false; };
  }, []);

  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="flex flex-none items-baseline justify-between px-[22px] pb-3 pt-2">
        <div>
          <Meta>Studio{me?.display_name ? ` · ${me.display_name}` : ""}</Meta>
          <div className="mt-0.5 font-serif text-[24px] font-medium tracking-[-0.02em]">Talent pool</div>
        </div>
        <button type="button" aria-label="New folder"><FolderPlus size={22} className="text-tg-ink" /></button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4">
        <RefreshHint />
        <button
          type="button"
          onClick={() => navigate(routes.searchPeople)}
          className="mb-4 flex w-full items-center gap-2.5 rounded-DEFAULT border border-tg-line bg-tg-stone2 px-3.5 py-3 text-left"
        >
          <Search size={17} className="text-tg-brown-soft" />
          <span className="text-[14px] text-tg-brown-soft">Search designers by discipline, city, availability…</span>
        </button>

        <div className="mb-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
          Recent designers
        </div>
        {people.length === 0 ? (
          <div className="rounded-lg border border-dashed border-tg-line bg-tg-card px-4 py-10 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
              <Users size={20} />
            </span>
            <Meta className="block">No designers to shortlist yet. Use search to find people.</Meta>
            <Button size="sm" className="mt-3" onClick={() => navigate(routes.searchPeople)}>
              Search talent
            </Button>
          </div>
        ) : (
          <div className="flex flex-col">
            {people.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => navigate(`/u/${m.handle ?? m.id}`)}
                className="flex items-center gap-3 border-b border-tg-line-soft py-3 text-left last:border-b-0"
              >
                <Avatar maker={m} size={44} />
                <div className="min-w-0 flex-1">
                  <NameRow maker={m} size={14} />
                  <Meta className="mt-0.5 block">{m.role}{m.city ? ` · ${m.city}` : ""}</Meta>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
