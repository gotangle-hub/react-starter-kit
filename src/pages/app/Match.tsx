import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, X, Heart, Handshake, BadgeCheck, MapPin, Loader2 } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { routes } from "@/lib/routes";
import {
  loadPreferences,
  savePreferences,
  fetchDeck,
  getSwipeState,
  registerSwipe,
  workUrl,
  avatarUrl,
  type DeckCard,
  type MatchPreferences,
  type Intent,
  type SwipeState,
} from "@/services/match";
import { disciplines as ALL_DISCIPLINES } from "@/lib/disciplines";
import { cn } from "@/lib/utils";
import { useWebViewport } from "@/hooks/use-is-desktop";
import { DiscoverDesktop } from "@/components/web/pages/discover-desktop";

/** 17 · Swipe to discover WORK. Card = one piece of work; maker shown small. */
export default function Match() {
  const viewport = useWebViewport();
  if (viewport !== "mobile") return <DiscoverDesktop />;
  return <MatchMobile />;
}

function MatchMobile() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<MatchPreferences | null>(null);
  const [deck, setDeck] = useState<DeckCard[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipe, setSwipe] = useState<SwipeState>({ unlimited: false, cap: 15, remaining: 15 });

  const reload = useCallback(async (p: MatchPreferences) => {
    setLoading(true);
    const [cards, st] = await Promise.all([fetchDeck(p), getSwipeState()]);
    setDeck(cards);
    setIndex(0);
    setSwipe(st);
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const p = await loadPreferences();
      setPrefs(p);
      reload(p);
    })();
  }, [reload]);

  const card = deck[index];

  async function setIntent(intent: Intent) {
    if (!prefs) return;
    const next = { ...prefs, intent };
    setPrefs(next);
    await savePreferences(next);
    reload(next);
  }

  async function toggleDiscipline(d: string) {
    if (!prefs) return;
    const has = prefs.disciplines.includes(d);
    const next = {
      ...prefs,
      disciplines: has ? prefs.disciplines.filter((x) => x !== d) : [...prefs.disciplines, d],
    };
    setPrefs(next);
    await savePreferences(next);
    reload(next);
  }

  function pass() {
    setIndex((i) => i + 1);
  }

  async function like() {
    if (!card || !prefs) return;
    if (!swipe.unlimited && (swipe.remaining ?? 0) <= 0) {
      navigate(routes.swipeCap);
      return;
    }
    const res = await registerSwipe(card.author_id, prefs.intent, card.post_id);
    if (!res.ok) {
      if (res.reason === "cap_reached") navigate(routes.swipeCap);
      else if (res.reason === "collab_cap_reached") {
        alert("You've reached the 2 active collaboration cap on Free. Upgrade for unlimited.");
      }
      return;
    }
    if (res.remaining != null) setSwipe((s) => ({ ...s, remaining: res.remaining ?? 0, cap: res.cap ?? s.cap }));
    if (prefs.intent === "connection" && res.mutual) {
      navigate(`${routes.mutualMatch}?id=${card.author_id}`);
      return;
    }
    setIndex((i) => i + 1);
  }

  const intent: Intent = prefs?.intent ?? "connection";

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
        {/* "Looking for…" bar */}
        <LookingForBar
          intent={intent}
          setIntent={setIntent}
          picked={prefs?.disciplines ?? []}
          togglePicked={toggleDiscipline}
          openFilters={() => navigate(routes.matchFilters)}
        />

        {/* Swipe meter (free only) */}
        {!swipe.unlimited && (
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <Meta>Today</Meta>
              <span className="font-mono text-[11px] text-tg-brown">
                {swipe.remaining ?? 0} left
              </span>
            </div>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-pill bg-tg-stone2">
              <div
                className="h-full rounded-pill bg-tg-yellow transition-all"
                style={{ width: `${((swipe.remaining ?? 0) / (swipe.cap ?? 15)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Work card */}
        <div className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-xl border border-tg-line shadow-card bg-tg-card">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="animate-spin text-tg-brown" />
            </div>
          ) : card ? (
            <WorkCard card={card} onOpenMaker={() => navigate(`/u/${card.author_id}`)} />
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center">
              <Meta>
                No more work matching your filters. Try widening "Looking for…" or pull back later.
              </Meta>
            </div>
          )}
        </div>

        {/* Pass / Like (icon switches with intent) */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Pass"
            onClick={pass}
            disabled={!card}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-pill border border-tg-line bg-tg-card text-tg-ink disabled:opacity-40"
          >
            <X size={20} />
            <span className="font-display text-[14px] font-semibold">Pass</span>
          </button>
          <button
            type="button"
            aria-label={intent === "collaboration" ? "Invite to collaborate" : "Like to connect"}
            onClick={like}
            disabled={!card}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-pill bg-tg-blue text-white disabled:opacity-40"
          >
            {intent === "collaboration" ? <Handshake size={20} /> : <Heart size={20} />}
            <span className="font-display text-[14px] font-semibold">
              {intent === "collaboration" ? "Collaborate" : "Connect"}
            </span>
          </button>
        </div>
      </div>
    </MobileShell>
  );
}

function LookingForBar({
  intent,
  setIntent,
  picked,
  togglePicked,
  openFilters,
}: {
  intent: Intent;
  setIntent: (i: Intent) => void;
  picked: string[];
  togglePicked: (d: string) => void;
  openFilters: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 font-serif text-[15px] italic text-tg-ink">Looking for…</span>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scrollbar-none">
        <Chip
          on={intent === "connection"}
          onClick={() => setIntent("connection")}
        >
          Connection
        </Chip>
        <Chip
          on={intent === "collaboration"}
          onClick={() => setIntent("collaboration")}
        >
          Collaboration
        </Chip>
        <span className="mx-1 h-5 w-px shrink-0 bg-tg-line" />
        {ALL_DISCIPLINES.map((d) => (
          <Chip key={d} on={picked.includes(d)} onClick={() => togglePicked(d)}>
            {d}
          </Chip>
        ))}
        <button
          type="button"
          onClick={openFilters}
          className="ml-1 shrink-0 rounded-pill border border-tg-line bg-tg-card px-3 py-1.5 font-display text-[12px] font-semibold text-tg-ink"
        >
          Filters
        </button>
      </div>
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-pill px-3 py-1.5 font-display text-[12px] font-semibold transition-colors",
        on
          ? "bg-tg-blue text-white"
          : "border border-tg-line bg-tg-card text-tg-ink",
      )}
    >
      {children}
    </button>
  );
}

function WorkCard({ card, onOpenMaker }: { card: DeckCard; onOpenMaker: () => void }) {
  const url = workUrl(card);
  const avatar = avatarUrl(card.author_avatar_path);
  return (
    <>
      {url ? (
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      ) : (
        <div className="absolute inset-0 bg-tg-stone2" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      {/* Title top-left */}
      {card.title && (
        <div className="absolute left-4 top-4 max-w-[80%] rounded-chip bg-black/35 px-2.5 py-1 font-display text-[12px] font-medium text-white backdrop-blur">
          {card.title}
        </div>
      )}

      {/* Maker bottom row */}
      <button
        type="button"
        onClick={onOpenMaker}
        className="absolute inset-x-4 bottom-4 flex items-center gap-2.5 rounded-pill bg-black/45 px-2.5 py-2 text-left backdrop-blur"
      >
        {avatar ? (
          <img src={avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="h-8 w-8 shrink-0 rounded-full bg-tg-stone2" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate font-display text-[13.5px] font-semibold text-white">
              {card.author_name ?? card.author_username ?? "Maker"}
            </span>
            {card.author_verified && <BadgeCheck size={14} className="shrink-0 text-tg-yellow" />}
          </div>
          {card.author_location && (
            <div className="flex items-center gap-1 text-white/75">
              <MapPin size={11} />
              <span className="truncate font-display text-[11px]">{card.author_location}</span>
            </div>
          )}
        </div>
      </button>
    </>
  );
}
