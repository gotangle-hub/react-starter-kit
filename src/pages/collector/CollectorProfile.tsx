import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Settings, UserPlus } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/brand/avatar";
import { Meta } from "@/components/brand/atoms";
import { routes } from "@/lib/routes";
import { getMyProfile, makerFromProfile, type ProfileRow } from "@/services/profile";
import type { Maker } from "@/lib/profile-shape";

/** 17 · Collector profile — own profile and collection (no published work). */

export default function CollectorProfile() {
  const navigate = useNavigate();
  const [me, setMe] = useState<Maker | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  useEffect(() => {
    let alive = true;
    getMyProfile().then((p) => {
      if (!alive) return;
      setProfile(p);
      setMe(p ? (makerFromProfile(p) as Maker) : null);
    });
    return () => { alive = false; };
  }, []);

  return (
    <MobileShell footer={<AppTabBar />}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-[22px] pt-3.5">
          <Logo size={20} />
          <button type="button" onClick={() => navigate(routes.settingsCollector)} aria-label="Settings">
            <Settings size={20} className="text-tg-ink" />
          </button>
        </div>

        <div className="flex items-center gap-4 px-[22px] pt-[18px]">
          {me ? (
            <Avatar maker={me} size={68} ring />
          ) : (
            <span className="inline-block h-[68px] w-[68px] rounded-pill bg-tg-stone2" aria-hidden />
          )}
          <div className="flex-1">
            <div className="font-display text-[19px] font-semibold">{profile?.display_name ?? "Collector"}</div>
            <Meta className="mt-0.5 block">Collector{profile?.location ? ` · ${profile.location}` : ""}</Meta>
          </div>
        </div>

        <div className="flex gap-6 px-[22px] pb-1 pt-4">
          <Stat n="0" l="Saved" />
          <Stat n="0" l="Collections" />
          <Stat n="0" l="Following" />
        </div>

        <div className="mt-8 flex flex-col items-center px-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
            <Bookmark size={22} />
          </span>
          <h2 className="mt-4 font-serif text-[20px] font-medium tracking-[-0.01em]">Your collection is empty</h2>
          <Meta className="mt-1.5 block max-w-[260px]">Save work from Explore and follow makers — your collection appears here.</Meta>
          <button
            type="button"
            onClick={() => navigate(routes.collectorExplore)}
            className="mt-4 inline-flex items-center gap-2 rounded-pill bg-tg-blue px-4 py-2.5 font-display text-[13px] font-semibold text-white"
          >
            <UserPlus size={15} />
            Discover work
          </button>
        </div>
      </div>
    </MobileShell>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <span className="font-display text-[18px] font-semibold text-tg-ink">{n}</span> <Meta>{l}</Meta>
    </div>
  );
}
