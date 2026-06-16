import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pin } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { AppHeader } from "@/components/app/app-header";
import { Segmented } from "@/components/app/segmented";
import { RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { Chip } from "@/components/brand/chip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { chats, competitions, makers as fixtureMakers, me, type Maker } from "@/lib/fixtures";
import { rankItems } from "@/services/feed";
import { routes } from "@/lib/routes";

const SEGMENTS = ["Dashboard", "Match", "Projects", "Community"];

function collabColor(kind: string) {
  return kind === "competition" ? "var(--tg-purple)" : kind === "client" ? "var(--tg-blue)" : "var(--tg-brown-soft)";
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-3 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
      {children}
    </div>
  );
}

/** 16 · Home / Dashboard (G2, G7, G6). Personalised home with a segmented switch. */
export default function Home() {
  const navigate = useNavigate();
  const [seg, setSeg] = useState("Dashboard");
  const comp = competitions[0];

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
          Good morning, {me.name.split(" ")[0]}.
        </h1>
        <Meta>Tuesday, 16 June · {me.collaborations} active collaborations</Meta>

        <SectionLabel>Active collaborations</SectionLabel>
        <div className="flex flex-col gap-2.5">
          {chats
            .filter((c) => c.kind !== "regular")
            .map((c) => (
              <Card key={c.id} className="flex items-center gap-3 p-3.5">
                <span className="self-stretch rounded-pill" style={{ width: 4, background: collabColor(c.kind) }} />
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-display text-[14.5px] font-semibold">{c.title}</span>
                  <Meta className="mt-0.5 block">
                    {c.kind === "competition" ? "Designer collaboration" : "Client project"} · {c.who}
                  </Meta>
                </div>
                <span
                  className="rounded-pill px-2.5 py-1 font-display text-[11px] font-semibold text-white"
                  style={{ background: collabColor(c.kind) }}
                >
                  Active
                </span>
              </Card>
            ))}
        </div>

        <SectionLabel>Pinned competition</SectionLabel>
        <Card className="p-3.5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Pin size={14} className="text-tg-blue-accent" />
                <span className="font-display text-[15px] font-semibold">{comp.name}</span>
              </div>
              <Meta className="mt-1 block">
                Closes {comp.deadline} · {comp.prize}
              </Meta>
            </div>
            <Chip>6 days</Chip>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="outlineAccent" size="sm">Looking for a partner?</Button>
            <Button variant="ghost" size="sm">{comp.interestedPeople} interested</Button>
          </div>
        </Card>

        <SectionLabel>Suggested collaborator</SectionLabel>
        <Card className="flex items-center gap-3 p-3.5">
          <Avatar maker={makers[0]} size={46} />
          <div className="min-w-0 flex-1">
            <NameRow maker={makers[0]} size={14.5} />
            <Meta className="mt-0.5 block">
              {makers[0].role} · {makers[0].city}
            </Meta>
          </div>
          <div className="text-right">
            <div className="font-display text-[17px] font-semibold text-tg-blue-accent">{makers[0].match}%</div>
            <Meta>match</Meta>
          </div>
        </Card>

        <SectionLabel>New connection request</SectionLabel>
        <Card className="flex items-center gap-3 p-3.5">
          <Avatar maker={makers[4]} size={42} />
          <div className="min-w-0 flex-1">
            <NameRow maker={makers[4]} size={14.5} />
            <Meta className="mt-0.5 block">wants to connect</Meta>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">Ignore</Button>
            <Button size="sm">Accept</Button>
          </div>
        </Card>
      </div>
    </MobileShell>
  );
}
