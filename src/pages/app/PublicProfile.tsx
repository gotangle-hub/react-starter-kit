import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, MoreHorizontal, Plus, Users } from "lucide-react";
import { CreateCollabSheet } from "@/components/app/create-collab-sheet";
import { MobileShell } from "@/components/app/mobile-shell";
import { RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Pill, Meta, PhotoTile } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { path, routes } from "@/lib/routes";
import {
  getProfileById,
  makerFromProfile,
  workPublicUrl,
  type ProfileRow,
} from "@/services/profile";
import { lookupProfileIdByUsername, USERNAME_REGEX } from "@/services/usernames";
import { listWorkByUser, postCoverUrl, type PostRow } from "@/services/work";

/**
 * 68 · Someone's public profile (G7). Real profile + posts queried by user id.
 * Same banner/avatar rule as your own profile: avatar overlaps but never drops
 * below the banner edge; with no banner the area takes the page background for
 * the current mode (G15).
 */
export default function PublicProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [works, setWorks] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      // The `:id` slot accepts either a UUID OR an @username (per spec — profile
      // URLs are /u/:username, with the id kept as the internal key).
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const resolvedId = isUuid ? id : USERNAME_REGEX.test(id) ? await lookupProfileIdByUsername(id) : null;
      if (!resolvedId) {
        if (!cancelled) setLoading(false);
        return;
      }
      const [p, w] = await Promise.all([getProfileById(resolvedId), listWorkByUser(resolvedId)]);
      if (cancelled) return;
      setProfile(p);
      setWorks(w);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const maker = makerFromProfile(profile);
  const bannerUrl = workPublicUrl(profile?.banner_path);
  const disciplines = profile?.disciplines ?? [];

  return (
    <MobileShell>
      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        <RefreshHint />

        {/* Banner — none set, takes page background (G15). Back arrow sits over it. */}
        <div
          className="relative h-[148px] border-b border-tg-line bg-tg-bg"
          style={
            bannerUrl
              ? {
                  backgroundImage: `url(${bannerUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <div className="absolute inset-x-[18px] top-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Back"
              onClick={() => navigate(-1)}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-pill bg-tg-stone2 text-tg-ink"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="More"
              onClick={() => navigate(routes.userMenu)}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-pill bg-tg-stone2 text-tg-ink"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        <div className="px-[22px]">
          {/* Avatar overlaps the banner edge but never drops below it */}
          <div className="-mt-[42px]">
            <span className="rounded-pill" style={{ boxShadow: "0 0 0 4px var(--tg-bg)" }}>
              <Avatar maker={maker} size={84} />
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="font-serif text-[26px] font-medium leading-none tracking-[-0.02em] text-tg-ink">
              {maker.name}
            </span>
            {maker.verified && <VerifiedBadge size={18} />}
          </div>
          {profile?.username && (
            <div className="mt-1 font-mono text-[12px] text-tg-brown-soft">@{profile.username}</div>
          )}
          <Meta className="mt-1.5 block">
            {(disciplines[0] ?? maker.role)}
            {profile?.location ? ` · ${profile.location}` : ""}
          </Meta>

          {profile?.bio && (
            <p className="mb-1 mt-3 font-body text-[14.5px] leading-relaxed text-tg-ink">
              {profile.bio}
            </p>
          )}

          {disciplines.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-2">
              {disciplines.map((s) => (
                <Pill key={s} small>
                  {s}
                </Pill>
              ))}
            </div>
          )}

          {/* Connect + Message */}
          <div className="mt-4 flex gap-2.5">
            <Button variant="primary" full onClick={() => navigate(routes.request)}>
              <Plus size={16} />
              Connect
            </Button>
            <Button
              variant="outline"
              full
              onClick={() => navigate(path(routes.dmThread, { id: maker.id }))}
            >
              <MessageCircle size={16} />
              Message
            </Button>
          </div>

          {/* Work grid */}
          <div className="mb-3 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
            Work
          </div>
          {!loading && works.length === 0 ? (
            <div className="rounded-lg border border-dashed border-tg-line bg-tg-card px-4 py-8 text-center">
              <Meta>No work published yet.</Meta>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {works.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => navigate(path(routes.projectDetail, { id: w.id }))}
                  className="overflow-hidden rounded-lg border border-tg-line"
                >
                  <PhotoTile
                    width="100%"
                    height={120}
                    img={postCoverUrl(w) ?? undefined}
                    label={w.title}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  );
}
