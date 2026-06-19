import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Plus, Users } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { listProfiles, makerFromProfile, getMyProfile, type ProfileRow } from "@/services/profile";
import { rankItems } from "@/services/feed";
import { routes } from "@/lib/routes";
import type { Maker } from "@/lib/profile-shape";
import { PracticeCard } from "@/components/app/practice-card";

/** 11 · Client home (G2, G6, G7). Post-a-brief CTA, pipeline, matched talent. */

export default function ClientHome() {
  const navigate = useNavigate();
  const [me, setMe] = useState<ProfileRow | null>(null);
  const [talent, setTalent] = useState<Maker[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [profile, others] = await Promise.all([
        getMyProfile(),
        listProfiles({ limit: 8, excludeSelf: true }),
      ]);
      if (!alive) return;
      setMe(profile);
      const ranked = await rankItems(
        "makers",
        others.map((p) => ({ id: p.id, category: p.account_type, base_score: 0 })),
      );
      const byId = new Map(others.map((p) => [p.id, p]));
      const ordered = ranked.map((r) => byId.get(r.id)).filter(Boolean) as ProfileRow[];
      setTalent(ordered.slice(0, 4).map((p) => makerFromProfile(p) as Maker));
    })();
    return () => { alive = false; };
  }, []);

  const studioLabel = me?.display_name ? `Client · ${me.display_name}` : "Client";

  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="flex flex-none items-center justify-between px-[22px] pb-3 pt-2">
        <div>
          <Meta>{studioLabel}</Meta>
          <div className="mt-0.5 font-serif text-[24px] font-medium tracking-[-0.02em]">Find your next maker.</div>
        </div>
        <button type="button" className="relative" aria-label="Notifications" onClick={() => navigate(routes.notifications)}>
          <Bell size={23} className="text-tg-ink" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4">
        <RefreshHint />
        <PracticeCard />
        {/* Post a brief CTA */}
        <div className="relative overflow-hidden rounded-lg bg-tg-emph p-[18px] text-white">
          <div className="font-serif text-[20px] font-medium leading-tight tracking-[-0.01em]">
            Post a brief, meet matched creatives in hours.
          </div>
          <p className="my-2 max-w-[250px] font-body text-[13px] leading-snug text-white/70">
            Describe the work — Tangle shortlists designers and studios that fit.
          </p>
          <button
            type="button"
            onClick={() => navigate(routes.postCallout)}
            className="inline-flex items-center gap-2 rounded-DEFAULT bg-white px-4 py-2.5 font-display text-[14px] font-semibold text-tg-ink"
          >
            <Plus size={16} />
            New brief
          </button>
        </div>

        {/* Matched talent */}
        <div className="mb-3 mt-6 flex items-baseline justify-between">
          <span className="font-serif text-[19px] font-medium tracking-[-0.02em]">Suggested makers</span>
          <button type="button" onClick={() => navigate(routes.talentPool)}>
            <Meta>See all</Meta>
          </button>
        </div>
        {talent.length === 0 ? (
          <div className="rounded-lg border border-dashed border-tg-line bg-tg-card px-4 py-8 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
              <Users size={20} />
            </span>
            <Meta className="block">No designers in your network yet. Post a brief to start matching.</Meta>
            <Button size="sm" className="mt-3" onClick={() => navigate(routes.postCallout)}>Post a brief</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {talent.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => navigate(`/u/${m.handle ?? m.id}`)}
                className="flex items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-3 text-left"
              >
                <Avatar maker={m} size={46} />
                <div className="min-w-0 flex-1">
                  <NameRow maker={m} size={14.5} />
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
