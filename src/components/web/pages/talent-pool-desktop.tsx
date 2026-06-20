import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderPlus, Search, Users } from "lucide-react";

import { WebPage } from "@/components/web/web-page";
import { RightRail } from "@/components/web/right-rail";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { listProfiles, makerFromProfile, getMyProfile, type ProfileRow } from "@/services/profile";
import { rankItems } from "@/services/feed";
import type { Maker } from "@/lib/profile-shape";

export function TalentPoolDesktop() {
  const navigate = useNavigate();
  const [me, setMe] = useState<ProfileRow | null>(null);
  const [people, setPeople] = useState<Maker[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [profile, rows] = await Promise.all([
        getMyProfile(),
        listProfiles({ limit: 36, excludeSelf: true }),
      ]);
      if (!alive) return;
      setMe(profile);
      const ranked = await rankItems(
        "makers",
        rows.map((r) => ({ id: r.id, category: r.account_type, base_score: 0 })),
      );
      const byId = new Map(rows.map((r) => [r.id, r]));
      const ordered = ranked.map((r) => byId.get(r.id)).filter(Boolean) as ProfileRow[];
      setPeople(ordered.map((r) => makerFromProfile(r) as Maker));
    })();
    return () => { alive = false; };
  }, []);

  return (
    <WebPage maxWidth={1100} rail={<RightRail />}>
      <div className="flex items-end justify-between">
        <div>
          <Meta>Studio{me?.display_name ? ` · ${me.display_name}` : ""}</Meta>
          <h1 className="mt-2 font-serif text-[34px] font-medium leading-none tracking-[-0.02em] text-tg-ink">
            Talent pool
          </h1>
        </div>
        <Button variant="outline" size="sm">
          <FolderPlus size={15} />
          New folder
        </Button>
      </div>

      <button
        type="button"
        onClick={() => navigate(routes.searchPeople)}
        className="mt-7 flex w-full items-center gap-3 rounded-xl border border-tg-line bg-tg-card px-4 py-3.5 text-left"
      >
        <Search size={18} className="text-tg-brown-soft" />
        <span className="text-[14.5px] text-tg-brown-soft">
          Search designers by discipline, city, availability…
        </span>
      </button>

      <div className="mt-8 mb-3 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
        Recent designers
      </div>

      {people.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-tg-line bg-tg-card px-6 py-16 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-tg-stone2 text-tg-brown">
            <Users size={22} />
          </span>
          <Meta className="block">No designers to shortlist yet. Use search to find people.</Meta>
          <Button size="sm" className="mt-4" onClick={() => navigate(routes.searchPeople)}>
            Search talent
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 min-[800px]:grid-cols-2 min-[1100px]:grid-cols-3">
          {people.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => navigate(`/u/${m.handle ?? m.id}`)}
                className="flex w-full items-center gap-3 rounded-xl border border-tg-line bg-tg-card p-3 text-left transition hover:border-tg-ink/20"
              >
                <Avatar maker={m} size={48} />
                <div className="min-w-0 flex-1">
                  <NameRow maker={m} size={14.5} />
                  <Meta className="mt-0.5 block truncate">
                    {m.role}{m.city ? ` · ${m.city}` : ""}
                  </Meta>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </WebPage>
  );
}
