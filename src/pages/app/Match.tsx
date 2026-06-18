import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, SlidersHorizontal, X, Heart } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Pill, Meta } from "@/components/brand/atoms";
import { supabase } from "@/integrations/supabase/client";
import {
  makerFromProfile,
  workPublicUrl,
  type ProfileRow,
} from "@/services/profile";
import {
  likeToConnect,
  passOnMaker,
  listSeenIds,
} from "@/services/connections";
import { logInteraction } from "@/services/feed";
import { routes } from "@/lib/routes";

const DAILY_CAP = 15;

interface DeckCandidate {
  profile: Pick<ProfileRow, "id" | "account_type" | "display_name" | "disciplines" | "bio" | "location" | "avatar_path">;
  workImage: string | null;
  workTitle: string | null;
}

/**
 * 17 · Swipe to connect. A deck of designers/studios shown over their work,
 * ordered for you. Like → real connection_request; mutual match auto-accepts
 * and routes to MutualMatch with the real other-user id.
 */
export default function Match() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(DAILY_CAP);
  const [deck, setDeck] = useState<DeckCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const seen = await listSeenIds();
      // Pull a batch of other users (signed-in users can see public profile fields).
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, account_type, display_name, disciplines, bio, location, links, avatar_path, banner_path, created_at, updated_at")
        .neq("id", user.id)
        .limit(60);
      const filtered = (profiles ?? []).filter((p) => !seen.has(p.id));
      // Pair each candidate with one of their posts as the card background.
      const ids = filtered.map((p) => p.id);
      const { data: posts } = ids.length
        ? await supabase
            .from("posts")
            .select("author_id, title, media_paths, image_path")
            .in("author_id", ids)
            .order("created_at", { ascending: false })
        : { data: [] as Array<{ author_id: string; title: string | null; media_paths: string[] | null; image_path: string | null }> };
      const firstByAuthor = new Map<string, { title: string | null; media_paths: string[] | null; image_path: string | null }>();
      for (const p of posts ?? []) {
        if (!firstByAuthor.has(p.author_id)) firstByAuthor.set(p.author_id, p);
      }
      const deckRows: DeckCandidate[] = filtered.map((profile) => {
        const post = firstByAuthor.get(profile.id);
        const firstPath = post?.media_paths?.[0] ?? post?.image_path ?? null;
        return {
          profile,
          workImage: workPublicUrl(firstPath),
          workTitle: post?.title ?? null,
        };
      });
      setDeck(deckRows);
      setLoading(false);
    })();
  }, []);

  const candidate = deck[index];
  const maker = useMemo(
    () => (candidate ? makerFromProfile(candidate.profile) : null),
    [candidate],
  );

  useEffect(() => {
    if (!candidate) return;
    logInteraction({
      target_kind: "maker",
      target_id: candidate.profile.id,
      kind: "view",
      category: candidate.profile.account_type as string,
    });
  }, [candidate]);

  function next() {
    setIndex((i) => i + 1);
  }

  async function pass() {
    if (!candidate) return;
    await passOnMaker(candidate.profile.id);
    next();
  }

  async function like() {
    if (!candidate) return;
    if (left <= 0) {
      navigate(routes.swipeCap);
      return;
    }
    setLeft((n) => n - 1);
    logInteraction({
      target_kind: "maker",
      target_id: candidate.profile.id,
      kind: "connect",
      category: candidate.profile.account_type as string,
      weight: 4,
    });
    try {
      const res = await likeToConnect(candidate.profile.id);
      if (res.mutual) {
        navigate(`${routes.mutualMatch}?id=${candidate.profile.id}`);
        return;
      }
    } catch (e) {
      console.error("[match] like failed", e);
    }
    next();
  }

  return (
    <MobileShell
      header={
        <BackHeader
          title="Match"
          right={
            <button
              type="button"
              aria-label="Filter matches"
              onClick={() => navigate(routes.matchFilters)}
              className="flex h-9 w-9 items-center justify-center rounded-pill text-tg-ink"
            >
              <SlidersHorizontal size={20} />
            </button>
          }
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col px-[22px] pb-5 pt-2">
        {/* Daily cap meter (free account) */}
        <div className="flex items-center justify-between">
          <Meta>Suggested for you</Meta>
          <span className="font-mono text-[11px] text-tg-brown">{left} left today</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-pill bg-tg-stone2">
          <div
            className="h-full rounded-pill bg-tg-yellow transition-all"
            style={{ width: `${(left / DAILY_CAP) * 100}%` }}
          />
        </div>

        {/* The card */}
        <div className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-xl border border-tg-line shadow-card">
          {candidate && maker ? (
            <>
              {candidate.workImage ? (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${candidate.workImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ) : (
                <div className="absolute inset-0" style={{ background: maker.tint }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />

              {/* Maker detail, bottom */}
              <div className="absolute inset-x-0 bottom-0 p-5">
                {candidate.workTitle && (
                  <Meta className="text-white/70">{candidate.workTitle}</Meta>
                )}
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="font-serif text-[27px] font-medium leading-none tracking-[-0.02em] text-white">
                    {maker.name}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-white/80">
                  <span className="font-display text-[13.5px] capitalize">{maker.role}</span>
                  {candidate.profile.location && (
                    <>
                      <span className="text-white/40">·</span>
                      <MapPin size={13} className="text-white/70" />
                      <span className="font-display text-[13.5px]">{candidate.profile.location}</span>
                    </>
                  )}
                </div>
                {candidate.profile.disciplines && candidate.profile.disciplines.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {candidate.profile.disciplines.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="rounded-chip bg-white/15 px-2.5 py-1 font-display text-[12px] font-medium text-white backdrop-blur"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center">
              <Meta>
                {loading
                  ? "Finding people for you…"
                  : "No more people to swipe right now. Pull back later."}
              </Meta>
            </div>
          )}
        </div>

        {/* Pass / Connect */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Pass"
            onClick={pass}
            disabled={!candidate}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-pill border border-tg-line bg-tg-card text-tg-ink disabled:opacity-40"
          >
            <X size={20} />
            <span className="font-display text-[14px] font-semibold">Pass</span>
          </button>
          <button
            type="button"
            aria-label="Like to connect"
            onClick={like}
            disabled={!candidate}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-pill bg-tg-blue text-white disabled:opacity-40"
          >
            <Heart size={20} />
            <span className="font-display text-[14px] font-semibold">Connect</span>
          </button>
        </div>
        <div className="mt-3 flex justify-center">
          <Pill onClick={() => navigate(routes.matchFilters)} small>
            Refine who appears
          </Pill>
        </div>
      </div>
    </MobileShell>
  );
}
