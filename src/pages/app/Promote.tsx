import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Megaphone, Rocket } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { promoProducts, type PromoProduct } from "@/lib/promo";
import { startCheckout } from "@/lib/checkout-intent";
import type { BoostPayload } from "@/lib/checkout-intent";
import { listMyWork, postCoverUrl, type PostRow } from "@/services/work";
import { listMyBoosts, type BoostRow } from "@/services/boosts";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

const AUDIENCES = ["Designers near me", "My disciplines", "Everyone"];
const DURATIONS = [
  { label: "3 days", days: 3, mult: 0.5 },
  { label: "7 days", days: 7, mult: 1 },
  { label: "14 days", days: 14, mult: 1.8 },
];

/** Map product → boost kind in DB. */
function productKind(p: PromoProduct): BoostPayload["boost_kind"] {
  switch (p.id) {
    case "pr1":
      return "profile";
    case "pr2":
      return "creator";
    case "pr3":
      return "post";
    case "pr4":
      return "callout";
    case "pr6":
      return "community";
    default:
      return "profile";
  }
}

/**
 * 57 · Promote / boost (G6). Pick what to boost, audience, duration & budget,
 * see a price, confirm → Checkout → live boost. The profile-boost card is black
 * in BOTH modes (it does not swap), matching the light treatment.
 */
export default function Promote() {
  const navigate = useNavigate();
  const [product, setProduct] = useState(promoProducts[0].id);
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [duration, setDuration] = useState(1);
  const [budget, setBudget] = useState(120);
  const [myPosts, setMyPosts] = useState<PostRow[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [myBoosts, setMyBoosts] = useState<BoostRow[]>([]);

  useEffect(() => {
    listMyWork().then((rows) => setMyPosts(rows));
    listMyBoosts().then(setMyBoosts);
  }, []);

  const selectedProduct = promoProducts.find((p) => p.id === product) ?? promoProducts[0];
  const kind = productKind(selectedProduct);
  const needsTarget = kind === "post" || kind === "callout" || kind === "community";

  // Auto-pick the most recent post when switching to a target-needing product.
  useEffect(() => {
    if (needsTarget && !targetId && myPosts.length) setTargetId(myPosts[0].id);
    if (!needsTarget && targetId) setTargetId(null);
  }, [needsTarget, myPosts, targetId]);

  const base = 40;
  const total = Math.round(base * DURATIONS[duration].mult + budget * 0.2);
  const canPay = !needsTarget || !!targetId;

  const live = myBoosts.find((b) => b.status === "active");

  const startPay = () => {
    const boost: BoostPayload = {
      boost_kind: kind,
      target_id: needsTarget ? targetId : null,
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      audience,
      duration_days: DURATIONS[duration].days,
      daily_budget_minor: budget * 100,
    };
    startCheckout(navigate, {
      kind: "boost",
      reference: `boost-${selectedProduct.id}-${DURATIONS[duration].days}d`,
      label: selectedProduct.name,
      sublabel: `${audience} · ${DURATIONS[duration].label}`,
      currency: "AED",
      total: total * 100,
      boost,
    });
  };

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" onClick={startPay} disabled={!canPay}>
            Review &amp; pay — {total} AED
          </Button>
          <p className="mt-2 text-center">
            <Meta>
              {needsTarget && !targetId
                ? "Add at least one piece of work to boost it."
                : "Reach updates live once the boost is running."}
            </Meta>
          </p>
        </div>
      }
    >
      <BackHeader title="Promote your work" />
      <div className="px-[22px] py-4 pb-6">
        {/* The profile-boost hero card — black in both light & dark (no swap) */}
        <div className="rounded-lg bg-[#161514] p-5 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-white/12">
            <Rocket size={20} className="text-[#F4D738]" />
          </span>
          <h1 className="mt-3 font-serif text-[26px] font-medium leading-tight tracking-[-0.02em]">
            Put strong work in front of the right designers.
          </h1>
          <p className="mt-2 font-body text-[14px] leading-relaxed text-white/70">
            Boosted work is shown first — woven in cleverly, never dumped — and stays
            relevant to who's seeing it.
          </p>
        </div>

        {live && (
          <button
            type="button"
            onClick={() => navigate(routes.boostConfirm ?? "/boost-confirm")}
            className="mt-4 flex w-full items-center justify-between rounded-lg border border-tg-line bg-tg-card p-3.5 text-left"
          >
            <span>
              <span className="block font-display text-[13px] font-semibold text-tg-ink">
                {live.product_name} · running
              </span>
              <span className="mt-0.5 block font-mono text-[12px] text-tg-brown">
                {live.impressions.toLocaleString()} impressions · ends{" "}
                {live.ends_at ? new Date(live.ends_at).toLocaleDateString() : "soon"}
              </span>
            </span>
            <span className="font-mono text-[11px] text-tg-blue-accent">View stats</span>
          </button>
        )}

        <SectionLabel>What to boost</SectionLabel>
        <div className="flex flex-col gap-2.5">
          {promoProducts.map((p) => {
            const on = product === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setProduct(p.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border-[1.5px] p-3.5 text-left transition-colors",
                  on ? "border-tg-emph bg-tg-emph text-tg-emph-text" : "border-tg-line bg-tg-card",
                )}
              >
                <span className="flex-1">
                  <span
                    className={cn(
                      "block font-display text-[15px] font-semibold",
                      on ? "text-tg-emph-text" : "text-tg-ink",
                    )}
                  >
                    {p.name}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block font-body text-[12.5px]",
                      on ? "text-tg-emph-text/65" : "text-tg-brown",
                    )}
                  >
                    {p.desc}
                  </span>
                </span>
                <span className="text-right">
                  <span
                    className={cn(
                      "block font-display text-[14px] font-semibold",
                      on ? "text-tg-emph-text" : "text-tg-blue-accent",
                    )}
                  >
                    {p.price}
                  </span>
                  <span className={cn("font-mono text-[10px]", on ? "text-tg-emph-text/60" : "text-tg-brown")}>
                    {p.unit}
                  </span>
                </span>
                {on && <Check size={18} className="text-tg-emph-text" />}
              </button>
            );
          })}
        </div>

        {needsTarget && (
          <>
            <SectionLabel>Pick the work to boost</SectionLabel>
            {myPosts.length === 0 ? (
              <div className="rounded-lg border border-tg-line bg-tg-card p-4">
                <Meta className="block">
                  Add a piece of work first, then come back to boost it.
                </Meta>
                <Button
                  size="sm"
                  variant="outlineAccent"
                  className="mt-3"
                  onClick={() => navigate(routes.workUpload ?? "/work/new")}
                >
                  Add work
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {myPosts.slice(0, 9).map((p) => {
                  const cover = postCoverUrl(p);
                  const on = targetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTargetId(p.id)}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-md border-[1.5px]",
                        on ? "border-tg-blue-accent" : "border-tg-line",
                      )}
                    >
                      {cover ? (
                        <img src={cover} alt={p.title ?? ""} className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-tg-stone2 font-mono text-[10px] text-tg-brown">
                          No image
                        </span>
                      )}
                      {on && (
                        <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-tg-blue-accent">
                          <Check size={12} className="text-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        <SectionLabel>Audience</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {AUDIENCES.map((a) => (
            <Toggle key={a} on={audience === a} onClick={() => setAudience(a)}>
              {a}
            </Toggle>
          ))}
        </div>

        <SectionLabel>Duration</SectionLabel>
        <div className="flex gap-2">
          {DURATIONS.map((d, i) => (
            <Toggle key={d.label} on={duration === i} onClick={() => setDuration(i)}>
              {d.label}
            </Toggle>
          ))}
        </div>

        <SectionLabel>Daily budget</SectionLabel>
        <div className="rounded-lg border border-tg-line bg-tg-card p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-[26px] text-tg-blue-accent">{budget} AED</span>
            <Meta>per day</Meta>
          </div>
          <input
            type="range"
            min={40}
            max={400}
            step={20}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="mt-3 w-full accent-tg-blue"
          />
          <div className="mt-3 flex items-center gap-2 border-t border-tg-line-soft pt-3">
            <Megaphone size={15} className="text-tg-blue-accent" />
            <Meta>Estimated reach scales with budget and audience.</Meta>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-2.5 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
      {children}
    </div>
  );
}

function Toggle({
  children,
  on,
  onClick,
}: {
  children: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-pill border px-3.5 py-2 text-[13px] font-medium transition-colors",
        on ? "border-tg-inv bg-tg-inv text-tg-inv-text" : "border-tg-line bg-tg-card text-tg-brown",
      )}
    >
      {children}
    </button>
  );
}
