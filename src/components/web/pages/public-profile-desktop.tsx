import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, MoreHorizontal, Plus, Users } from "lucide-react";

import { CreateCollabSheet } from "@/components/app/create-collab-sheet";
import { WebPage } from "@/components/web/web-page";
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

export function PublicProfileDesktop() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [works, setWorks] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingCollab, setCreatingCollab] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const resolvedId = isUuid ? id : USERNAME_REGEX.test(id) ? await lookupProfileIdByUsername(id) : null;
      if (!resolvedId) { if (!cancelled) setLoading(false); return; }
      const [p, w] = await Promise.all([getProfileById(resolvedId), listWorkByUser(resolvedId)]);
      if (cancelled) return;
      setProfile(p);
      setWorks(w);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const maker = makerFromProfile(profile);
  const bannerUrl = workPublicUrl(profile?.banner_path);
  const disciplines = profile?.disciplines ?? [];

  return (
    <WebPage maxWidth={1100} pad="0">
      <div
        className="relative h-[260px] w-full border-b border-tg-line bg-tg-bg"
        style={
          bannerUrl
            ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        <div className="absolute inset-x-6 top-5 flex items-center justify-between">
          <button
            type="button"
            aria-label="Back"
            onClick={() => navigate(-1)}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-tg-card text-tg-ink shadow-card"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="More"
            onClick={() => navigate(routes.userMenu)}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-tg-card text-tg-ink shadow-card"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="px-10">
        <div className="-mt-[56px]">
          <span className="rounded-full" style={{ boxShadow: "0 0 0 5px var(--tg-bg)" }}>
            <Avatar maker={maker} size={112} />
          </span>
        </div>

        <div className="mt-5 flex items-center gap-2.5">
          <span className="font-serif text-[36px] font-medium leading-none tracking-[-0.02em] text-tg-ink">
            {maker.name}
          </span>
          {maker.verified && <VerifiedBadge size={22} />}
        </div>
        {profile?.username && (
          <div className="mt-1 font-mono text-[13px] text-tg-brown-soft">@{profile.username}</div>
        )}
        <Meta className="mt-2 block">
          {(disciplines[0] ?? maker.role)}
          {profile?.location ? ` · ${profile.location}` : ""}
        </Meta>

        {profile?.bio && (
          <p className="mt-4 max-w-[720px] font-body text-[15.5px] leading-relaxed text-tg-ink">
            {profile.bio}
          </p>
        )}

        {disciplines.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {disciplines.map((s) => (
              <Pill key={s} small>{s}</Pill>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => navigate(routes.request)}>
            <Plus size={16} />
            Connect
          </Button>
          <Button variant="outline" onClick={() => navigate(path(routes.dmThread, { id: maker.id }))}>
            <MessageCircle size={16} />
            Message
          </Button>
          <Button variant="ghost" onClick={() => setCreatingCollab(true)}>
            <Users size={16} />
            Start a collaboration
          </Button>
        </div>

        <h2 className="mt-12 mb-4 font-serif text-[22px] tracking-[-0.01em] text-tg-ink">Work</h2>
        {!loading && works.length === 0 ? (
          <div className="mb-12 rounded-2xl border border-dashed border-tg-line bg-tg-card px-6 py-16 text-center">
            <Meta>No work published yet.</Meta>
          </div>
        ) : (
          <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 min-[1000px]:grid-cols-3">
            {works.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => navigate(path(routes.projectDetail, { id: w.id }))}
                className="group overflow-hidden rounded-2xl border border-tg-line bg-tg-card text-left"
              >
                <PhotoTile width="100%" height={260} img={postCoverUrl(w) ?? undefined} label={w.title} />
              </button>
            ))}
          </div>
        )}
      </div>

      {creatingCollab && profile && (
        <CreateCollabSheet
          onClose={() => setCreatingCollab(false)}
          onCreated={(cid: string) => {
            setCreatingCollab(false);
            navigate(path(routes.projectChat, { id: cid }));
          }}
          initialMembers={[{
            id: profile.id,
            username: profile.username ?? "",
            display_name: profile.display_name ?? null,
            avatar_path: profile.avatar_path ?? null,
          }]}
        />
      )}
    </WebPage>
  );
}
