import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, Plus, Settings, UserPlus, Users } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { AppTabBar } from "@/components/app/app-tab-bar";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Meta, PhotoTile } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { getMyProfile, workPublicUrl, type ProfileRow } from "@/services/profile";
import { listMyWork, postCoverUrl, type PostRow } from "@/services/work";

/** 13 · Studio page (G7). The studio's public home — cover, about, work. */
export default function StudioPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [works, setWorks] = useState<PostRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [p, w] = await Promise.all([getMyProfile(), listMyWork()]);
      if (cancelled) return;
      setProfile(p);
      setWorks(w);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const name = profile?.display_name ?? "Your studio";
  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const bannerUrl = workPublicUrl(profile?.banner_path);
  const disciplines = profile?.disciplines ?? [];

  return (
    <MobileShell footer={<AppTabBar />}>
      {/* Cover */}
      <div
        className="relative h-[150px] flex-none bg-tg-ink"
        style={
          bannerUrl
            ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute inset-x-[18px] top-3.5 flex justify-between">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft size={22} className="text-white" />
          </button>
          <button type="button" onClick={() => navigate(routes.settingsStudio)} aria-label="Studio settings">
            <Settings size={20} className="text-white" />
          </button>
        </div>
        {!bannerUrl && (
          <button
            type="button"
            onClick={() => navigate(routes.editProfile)}
            className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-pill border border-dashed border-white/50 px-3 py-1.5 font-display text-[12px] font-medium text-white/85"
          >
            <ImagePlus size={14} />
            Add a cover
          </button>
        )}
      </div>

      <div className="-mt-[34px] px-[22px] pb-4">
        <div className="flex items-end gap-3.5">
          <span className="flex h-[72px] w-[72px] flex-none items-center justify-center rounded-xl border-[3px] border-tg-bg bg-tg-emph font-display text-[26px] font-semibold text-white">
            {initials}
          </span>
          <div className="flex-1 pb-1">
            <span className="flex items-center gap-1.5">
              <span className="font-display text-[19px] font-semibold">{name}</span>
              <VerifiedBadge size={18} />
            </span>
            <Meta className="mt-0.5 block">{disciplines[0] ?? "Studio"}</Meta>
          </div>
        </div>

        {profile?.bio && (
          <p className="my-3.5 font-body text-[14.5px] leading-[1.55] text-tg-ink">{profile.bio}</p>
        )}

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
        <SectionHead
          title="Work"
          actionLabel="Add project"
          actionIcon={Plus}
          onAction={() => navigate(routes.studioProjectUpload)}
        />
        {works.length === 0 ? (
          <div className="rounded-lg border border-dashed border-tg-line bg-tg-card px-4 py-8 text-center">
            <Meta>No projects yet. Add your first studio project.</Meta>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {works.map((w) => (
              <PhotoTile
                key={w.id}
                width="100%"
                height={78}
                radius={9}
                img={postCoverUrl(w) ?? undefined}
                swatch="#E7DDCB"
              />
            ))}
          </div>
        )}

        {/* Team & Open roles will light up once those tables exist. */}
        <SectionHead
          title="The team"
          actionLabel="Manage"
          actionIcon={UserPlus}
          onAction={() => navigate(routes.studioTeam)}
        />
        <div className="rounded-lg border border-dashed border-tg-line bg-tg-card px-4 py-6 text-center">
          <Meta>Invite teammates to show them here.</Meta>
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
      <button
        type="button"
        onClick={onAction}
        className="inline-flex items-center gap-1.5 font-display text-[12px] font-semibold text-tg-blue-accent"
      >
        <Icon size={13} />
        {actionLabel}
      </button>
    </div>
  );
}
