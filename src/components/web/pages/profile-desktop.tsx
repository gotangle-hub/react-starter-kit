import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, Pencil, Plus, Settings, Share2 } from "lucide-react";

import { WebPage } from "@/components/web/web-page";
import { Avatar } from "@/components/brand/avatar";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Pill, Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";

import { routes } from "@/lib/routes";
import { getMyProfile, workPublicUrl, type ProfileRow } from "@/services/profile";
import { listMyWork, postCoverUrl, type PostRow } from "@/services/work";

/**
 * Desktop Profile (reference: `web.jsx` → `WebProfile`).
 * Wide banner with overlapping avatar, info row, then a 3-up work grid.
 */
export function ProfileDesktop() {
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

  const name = profile?.display_name ?? "Your profile";
  const bannerUrl = workPublicUrl(profile?.banner_path);
  const avatarUrl = workPublicUrl(profile?.avatar_path);
  const disciplines = profile?.disciplines?.length ? profile.disciplines : [];
  const verified = false;
  const avatarMaker = {
    id: profile?.id ?? "me",
    name,
    initials: name.split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase(),
    tint: "#161514",
    verified,
    avatarUrl: avatarUrl ?? undefined,
  };

  return (
    <WebPage maxWidth={1100} pad="0">
      {/* Banner — falls back to page bg per G15 */}
      <div
        className="relative h-[260px] w-full border-b border-tg-line bg-tg-bg"
        style={
          bannerUrl
            ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        <div className="absolute right-6 top-5 flex gap-2.5">
          {!bannerUrl && (
            <button
              type="button"
              onClick={() => navigate(routes.editProfile)}
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-tg-line bg-tg-bg/80 px-3 py-1.5 font-display text-[12px] font-medium text-tg-brown-soft backdrop-blur"
            >
              <ImagePlus size={14} />
              Add a banner
            </button>
          )}
          <button
            type="button"
            aria-label="Share profile"
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-tg-card text-tg-ink shadow-card"
          >
            <Share2 size={16} />
          </button>
          <button
            type="button"
            aria-label="Settings"
            onClick={() => navigate("/settings")}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-tg-card text-tg-ink shadow-card"
          >
            <Settings size={17} />
          </button>
        </div>
      </div>

      <div className="px-10">
        {/* Avatar overlaps banner but never below */}
        <div className="-mt-[56px] flex items-end justify-between">
          <span className="rounded-full" style={{ boxShadow: "0 0 0 5px var(--tg-bg)" }}>
            <Avatar maker={avatarMaker} size={112} />
          </span>
          <Button variant="outline" size="sm" onClick={() => navigate(routes.editProfile)}>
            <Pencil size={14} />
            Edit profile
          </Button>
        </div>

        <div className="mt-5 flex items-center gap-2.5">
          <span className="font-serif text-[36px] font-medium leading-none tracking-[-0.02em] text-tg-ink">
            {name}
          </span>
          {verified && <VerifiedBadge size={22} />}
        </div>
        <Meta className="mt-2 block">
          {(disciplines[0] ?? profile?.account_type ?? "Designer")}
          {profile?.location ? ` · ${profile.location}` : ""}
        </Meta>

        {/* Counts */}
        <div className="mt-6 flex gap-10">
          <button type="button" className="text-left" onClick={() => navigate(routes.yourNet)}>
            <div className="font-display text-[22px] font-semibold text-tg-ink">—</div>
            <Meta>Connections</Meta>
          </button>
          <button type="button" className="text-left" onClick={() => navigate(routes.collabs)}>
            <div className="font-display text-[22px] font-semibold text-tg-ink">—</div>
            <Meta>Collaborations</Meta>
          </button>
          <div>
            <div className="font-display text-[22px] font-semibold text-tg-ink">{works.length}</div>
            <Meta>Projects</Meta>
          </div>
        </div>

        {profile?.bio && (
          <p className="mt-5 max-w-[720px] font-body text-[15px] leading-relaxed text-tg-ink">{profile.bio}</p>
        )}

        {disciplines.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {disciplines.map((d) => (
              <Pill key={d} small>
                {d}
              </Pill>
            ))}
          </div>
        )}

        {!verified && (
          <button
            type="button"
            onClick={() => navigate(routes.verification)}
            className="mt-6 flex w-full max-w-[560px] items-center gap-3 rounded-xl border border-tg-line bg-tg-card p-4 text-left"
          >
            <VerifiedBadge size={24} />
            <div className="flex-1">
              <div className="font-display text-[14px] font-semibold text-tg-ink">Get verified</div>
              <Meta className="mt-0.5 block">Earn the yellow tick — verification is automatic.</Meta>
            </div>
            <Plus size={18} className="text-tg-brown-soft" />
          </button>
        )}

        {/* Work grid — 3-up */}
        <div className="mt-10 mb-4 flex items-center justify-between">
          <h2 className="font-serif text-[22px] tracking-[-0.01em] text-tg-ink">Work</h2>
          <Button variant="outlineAccent" size="sm" onClick={() => navigate(routes.workUpload)}>
            <Plus size={15} />
            Add work
          </Button>
        </div>

        {works.length === 0 ? (
          <div className="mb-10 rounded-2xl border border-dashed border-tg-line bg-tg-card px-6 py-16 text-center">
            <Meta>No work added yet. Click "Add work" to upload your first piece.</Meta>
          </div>
        ) : (
          <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 min-[1000px]:grid-cols-3">
            {works.map((w) => {
              const cover = postCoverUrl(w);
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => navigate(`/project/${w.id}`)}
                  className="group overflow-hidden rounded-2xl border border-tg-line bg-tg-card text-left"
                >
                  <div className="relative h-[260px] w-full overflow-hidden bg-tg-stone2">
                    {cover ? (
                      <img
                        src={cover}
                        alt={w.title ?? ""}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-6 text-center font-serif text-[22px] text-tg-brown">
                        {w.title}
                      </div>
                    )}
                  </div>
                  {w.title && (
                    <div className="px-4 py-3">
                      <div className="truncate font-serif text-[16px] tracking-[-0.01em] text-tg-ink">
                        {w.title}
                      </div>
                      {w.category && <Meta className="mt-0.5 block">{w.category}</Meta>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </WebPage>
  );
}
