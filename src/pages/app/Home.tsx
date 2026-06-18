import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, Users } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { AppHeader } from "@/components/app/app-header";
import { Segmented } from "@/components/app/segmented";
import { RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { rankItems } from "@/services/feed";
import { getMyProfile, listProfiles, makerFromProfile, type ProfileRow } from "@/services/profile";
import { routes } from "@/lib/routes";
import type { Maker } from "@/lib/profile-shape";

const SEGMENTS = ["Dashboard", "Match", "Projects", "Community"];

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-3 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
      {children}
    </div>
  );
}

/** 16 · Home / Dashboard (G2, G7). Personalised home built from real data. */
export default function Home() {
  const navigate = useNavigate();
  const [seg, setSeg] = useState("Dashboard");
  const [me, setMe] = useState<ProfileRow | null>(null);
  const [suggested, setSuggested] = useState<Maker[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [profile, others] = await Promise.all([
        getMyProfile(),
        listProfiles({ limit: 12, excludeSelf: true }),
      ]);
      if (!alive) return;
      setMe(profile);
      const ranked = await rankItems(
        "makers",
        others.map((p) => ({ id: p.id, category: p.account_type, base_score: 0 })),
      );
      const byId = new Map(others.map((p) => [p.id, p]));
      const ordered = ranked.map((r) => byId.get(r.id)).filter(Boolean) as ProfileRow[];
      setSuggested(ordered.map((p) => makerFromProfile(p) as Maker));
    })();
    return () => { alive = false; };
  }, []);

  const firstName = (me?.display_name ?? "").split(" ")[0] || "there";
  const top = suggested[0];

  return (
    <MobileShell footer={<AppTabBar />}>
      <AppHeader />
      <div className="flex-none px-[22px] pb-3 pt-3.5">
        <Segmented
          items={SEGMENTS}
          active={seg}
          onChange={(s) => {
            if (s === "Match") navigate(routes.home);
            setSeg(s);
          }}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-6">
        <RefreshHint />
        <h1 className="mt-1.5 font-serif text-[27px] font-medium leading-[1.05] tracking-[-0.02em]">
          Good morning, {firstName}.
        </h1>
        <Meta>Welcome back to Tangle.</Meta>

        <SectionLabel>Active collaborations</SectionLabel>
        <Card className="p-4">
          <Meta className="block">No active collaborations yet.</Meta>
          <Button variant="outlineAccent" size="sm" className="mt-3" onClick={() => navigate(routes.collabs)}>
            <Users size={14} className="mr-1.5" />
            Start one
          </Button>
        </Card>

        <SectionLabel>Suggested collaborator</SectionLabel>
        {top ? (
          <Card
            className="flex cursor-pointer items-center gap-3 p-3.5"
            onClick={() => navigate(`/u/${top.handle ?? top.id}`)}
          >
            <Avatar maker={top} size={46} />
            <div className="min-w-0 flex-1">
              <NameRow maker={top} size={14.5} />
              <Meta className="mt-0.5 block">{top.role}{top.city ? ` · ${top.city}` : ""}</Meta>
            </div>
          </Card>
        ) : (
          <Card className="flex items-center gap-3 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
              <Compass size={18} />
            </span>
            <Meta className="flex-1 block">As designers join, suggestions appear here ranked for you.</Meta>
          </Card>
        )}

        <SectionLabel>Recent designers</SectionLabel>
        {suggested.length <= 1 ? (
          <Card className="p-4">
            <Meta className="block">No one to show yet. Check back as the community grows.</Meta>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {suggested.slice(1, 5).map((m) => (
              <Card key={m.id} className="flex cursor-pointer items-center gap-3 p-3.5" onClick={() => navigate(`/u/${m.handle ?? m.id}`)}>
                <Avatar maker={m} size={42} />
                <div className="min-w-0 flex-1">
                  <NameRow maker={m} size={14.5} />
                  <Meta className="mt-0.5 block">{m.role}{m.city ? ` · ${m.city}` : ""}</Meta>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
