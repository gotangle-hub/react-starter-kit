import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeCheck, Bookmark, Handshake, Heart, Loader2, MapPin, X } from "lucide-react";

import { WebPage } from "@/components/web/web-page";
import { Meta } from "@/components/brand/atoms";
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
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Desktop Discover (reference: `web.jsx` → `WebDiscover`).
 * Centered card + Pass / Save / Like row + ← / → keyboard shortcuts.
 * Reuses the same match service as the mobile Match page.
 */
export function DiscoverDesktop() {
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
  const intent: Intent = prefs?.intent ?? "connection";

  const pass = useCallback(() => setIndex((i) => i + 1), []);

  const like = useCallback(async () => {
    if (!card || !prefs) return;
    if (!swipe.unlimited && (swipe.remaining ?? 0) <= 0) {
      navigate(routes.swipeCap);
      return;
    }
    const res = await registerSwipe(card.author_id, prefs.intent, card.post_id);
    if (!res.ok) {
      if (res.reason === "cap_reached") navigate(routes.swipeCap);
      return;
    }
    if (res.remaining != null) {
      setSwipe((s) => ({ ...s, remaining: res.remaining ?? 0, cap: res.cap ?? s.cap }));
    }
    if (prefs.intent === "connection" && res.mutual) {
      navigate(`${routes.mutualMatch}?id=${card.author_id}`);
      return;
    }
    setIndex((i) => i + 1);
  }, [card, prefs, swipe, navigate]);

  // Keyboard shortcuts (← Pass, → Like)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        pass();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        like();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pass, like]);

  async function setIntent(next: Intent) {
    if (!prefs) return;
    const p = { ...prefs, intent: next };
    setPrefs(p);
    await savePreferences(p);
    reload(p);
  }

  return (
    <WebPage maxWidth={720}>
      <div className="flex flex-col items-center pt-2">
        {/* Intent toggle */}
        <div className="mb-5 inline-flex rounded-full border border-tg-line bg-tg-bg p-1">
          <IntentPill on={intent === "connection"} onClick={() => setIntent("connection")}>
            Connection
          </IntentPill>
          <IntentPill on={intent === "collaboration"} onClick={() => setIntent("collaboration")}>
            Collaboration
          </IntentPill>
        </div>

        {/* Card */}
        <div className="relative aspect-[4/5] w-full max-w-[560px] overflow-hidden rounded-3xl border border-tg-line bg-tg-card shadow-card">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="animate-spin text-tg-brown" />
            </div>
          ) : card ? (
            <WorkCard card={card} onOpenMaker={() => navigate(`/u/${card.author_id}`)} />
          ) : (
            <div className="flex h-full items-center justify-center px-10 text-center">
              <Meta>No more work matching your filters. Try widening or come back later.</Meta>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-4">
          <RoundBtn label="Pass (←)" onClick={pass} disabled={!card}>
            <X size={22} />
          </RoundBtn>
          <RoundBtn label="Save" onClick={pass} disabled={!card} variant="soft">
            <Bookmark size={20} />
          </RoundBtn>
          <RoundBtn
            label={intent === "collaboration" ? "Collaborate (→)" : "Connect (→)"}
            onClick={like}
            disabled={!card}
            variant="primary"
            wide
          >
            {intent === "collaboration" ? <Handshake size={22} /> : <Heart size={22} />}
            <span className="font-display text-[14px] font-semibold">
              {intent === "collaboration" ? "Collaborate" : "Connect"}
            </span>
          </RoundBtn>
        </div>

        {/* Keyboard hint */}
        <div className="mt-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-tg-brown">
          <ArrowLeft size={12} /> Pass
          <span className="mx-2">·</span>
          Like <ArrowRight size={12} />
        </div>
      </div>
    </WebPage>
  );
}

function IntentPill({
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
        "rounded-full px-4 py-1.5 font-display text-[13px] font-semibold transition-colors",
        on ? "bg-tg-blue text-white" : "text-tg-ink",
      )}
    >
      {children}
    </button>
  );
}

function RoundBtn({
  children,
  onClick,
  disabled,
  label,
  variant = "default",
  wide = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  variant?: "default" | "soft" | "primary";
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full transition-colors disabled:opacity-40",
        wide ? "h-14 px-7" : "h-14 w-14",
        variant === "primary" && "bg-tg-blue text-white",
        variant === "soft" && "border border-tg-line bg-tg-bg text-tg-ink",
        variant === "default" && "border border-tg-line bg-tg-card text-tg-ink",
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

      {card.title && (
        <div className="absolute left-5 top-5 max-w-[80%] rounded-chip bg-black/40 px-3 py-1.5 font-display text-[13px] font-medium text-white backdrop-blur">
          {card.title}
        </div>
      )}

      <button
        type="button"
        onClick={onOpenMaker}
        className="absolute inset-x-5 bottom-5 flex items-center gap-3 rounded-full bg-black/45 px-3 py-2.5 text-left backdrop-blur"
      >
        {avatar ? (
          <img src={avatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="h-10 w-10 shrink-0 rounded-full bg-tg-stone2" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate font-display text-[14.5px] font-semibold text-white">
              {card.author_name ?? card.author_username ?? "Maker"}
            </span>
            {card.author_verified && <BadgeCheck size={15} className="shrink-0 text-tg-yellow" />}
          </div>
          {card.author_location && (
            <div className="flex items-center gap-1 text-white/75">
              <MapPin size={12} />
              <span className="truncate font-display text-[12px]">{card.author_location}</span>
            </div>
          )}
        </div>
      </button>
    </>
  );
}
