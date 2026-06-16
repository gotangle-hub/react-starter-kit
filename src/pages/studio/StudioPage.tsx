import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, Plus, Settings, UserPlus, Users } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { Avatar } from "@/components/brand/avatar";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { NameRow, Meta, PhotoTile } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { feed, makers, studio } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

const COVER_WORK = ["spec-full.jpg", "spec-negative.jpg", "spec-handles.jpg", "spec-blades.jpg", "spec-full.jpg", "spec-negative.jpg"];
const ROLES = [
  { title: "Junior architect", type: "Full time · Dubai", tint: "var(--tg-blue)" },
  { title: "Exhibition designer", type: "Contract · Remote", tint: "var(--tg-purple)" },
];

/** 13 · Studio page (G7). The studio's public home — cover, about, work, team, roles. */
export default function StudioPage() {
  const navigate = useNavigate();
  const team = makers.slice(0, 5);

  return (
    <MobileShell footer={<AppTabBar />}>
      {/* Cover */}
      <div
        className="relative h-[150px] flex-none bg-tg-ink"
        style={{ backgroundImage: `url(${feed("spec-full.jpg")})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute inset-x-[18px] top-3.5 flex justify-between">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back"><ArrowLeft size={22} className="text-white" /></button>
          <button type="button" onClick={() => navigate(routes.settingsStudio)} aria-label="Studio settings"><Settings size={20} className="text-white" /></button>
        </div>
      </div>

      <div className="-mt-[34px] px-[22px] pb-4">
        <div className="flex items-end gap-3.5">
          <span className="flex h-[72px] w-[72px] flex-none items-center justify-center rounded-xl border-[3px] border-tg-bg bg-tg-emph font-display text-[26px] font-semibold text-white">
            {studio.initials}
          </span>
          <div className="flex-1 pb-1">
            <span className="flex items-center gap-1.5">
              <span className="font-display text-[19px] font-semibold">{studio.name}</span>
              <VerifiedBadge size={18} />
            </span>
            <Meta className="mt-0.5 block">{studio.discipline}</Meta>
          </div>
        </div>

        <p className="my-3.5 font-body text-[14.5px] leading-[1.55] text-tg-ink">{studio.about}</p>

        {/* Owner toolbar */}
        <div className="mb-2 flex gap-2">
          <Button full variant="primary" onClick={() => navigate(routes.studioProjectUpload)}>
            <ImagePlus size={15} />
            Add project
          </Button>
          <Button full variant="outline" onClick={() => navigate(routes.studioTeam)}>
            <Users size={15} />
            Manage team
          </Button>
        </div>

        {/* Work */}
        <SectionHead title="Work" actionLabel="Add project" actionIcon={Plus} onAction={() => navigate(routes.studioProjectUpload)} />
        <div className="grid grid-cols-3 gap-1.5">
          {COVER_WORK.map((im, i) => (
            <PhotoTile key={i} width="100%" height={78} radius={9} img={feed(im)} swatch="#E7DDCB" />
          ))}
        </div>

        {/* Team */}
        <SectionHead title="The team" actionLabel="Manage" actionIcon={UserPlus} onAction={() => navigate(routes.studioTeam)} />
        <div className="flex flex-col gap-2.5">
          {team.map((m) => (
            <button key={m.id} type="button" onClick={() => navigate(`/u/${m.id}`)} className="flex items-center gap-3 text-left">
              <Avatar maker={m} size={42} />
              <div className="min-w-0 flex-1">
                <NameRow maker={m} size={14} />
                <Meta className="mt-0.5 block">{m.role}</Meta>
              </div>
            </button>
          ))}
        </div>

        {/* Open roles */}
        <div className="mb-3 mt-6 flex items-baseline justify-between">
          <span className="font-serif text-[18px] font-medium tracking-[-0.01em]">Open roles</span>
          <span className="rounded-chip bg-tg-yellow px-1.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.1em] text-tg-ink dark:text-white">Hiring</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {ROLES.map((r) => (
            <div key={r.title} className="flex items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-3.5">
              <span className="h-2.5 w-2.5 flex-none rounded-[3px]" style={{ background: r.tint }} />
              <div className="flex-1">
                <div className="font-display text-[14.5px] font-semibold">{r.title}</div>
                <Meta className="mt-0.5 block">{r.type}</Meta>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate(routes.applyFlow)}>Apply</Button>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}

function SectionHead({
  title,
  actionLabel,
  actionIcon: Icon,
  onAction,
}: {
  title: string;
  actionLabel: string;
  actionIcon: typeof Plus;
  onAction: () => void;
}) {
  return (
    <div className="mb-3 mt-6 flex items-baseline justify-between">
      <span className="font-serif text-[18px] font-medium tracking-[-0.01em]">{title}</span>
      <button type="button" onClick={onAction} className="inline-flex items-center gap-1.5 font-display text-[12px] font-semibold text-tg-blue-accent">
        <Icon size={13} />
        {actionLabel}
      </button>
    </div>
  );
}
