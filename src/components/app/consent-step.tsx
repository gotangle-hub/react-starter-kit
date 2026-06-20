import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Info, ShieldCheck } from "lucide-react";
import { Chip } from "@/components/brand/chip";
import { Meta } from "@/components/brand/atoms";
import { MobileShell } from "@/components/app/mobile-shell";
import { Button } from "@/components/ui/button";
import { CONSENT, TANGLE_DISCLAIMER, type ConsentItem } from "@/lib/consent";
import type { AccountType } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * 09 · Legal consent — the final step before the account is created. Exactly 3
 * combined checkboxes; ALL must be ticked to enable "Agree & create account".
 * Reused across every account-type journey.
 */
export function ConsentStep({
  type,
  onAgree,
}: {
  type: AccountType;
  onAgree: (opts: { marketingOptIn: boolean }) => void;
}) {
  const navigate = useNavigate();
  const c = CONSENT[type];
  const [ticked, setTicked] = useState<boolean[]>(c.items.map(() => false));
  const [marketing, setMarketing] = useState(false);
  const allTicked = ticked.every(Boolean);

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button
            full
            size="lg"
            disabled={!allTicked}
            onClick={() => onAgree({ marketingOptIn: marketing })}
          >
            Agree &amp; create account
          </Button>
        </div>
      }
    >
      <div className="flex flex-none items-center gap-3.5 px-[22px] pt-1.5">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={22} className="text-tg-ink" />
        </button>
        <div className="h-[5px] flex-1 overflow-hidden rounded-pill bg-tg-stone2">
          <div className="h-full w-full bg-tg-blue" />
        </div>
        <Meta>Last step</Meta>
      </div>

      <div className="px-[22px] pb-4 pt-3.5">
        <Chip>{c.kicker}</Chip>
        <h1 className="my-3 font-serif text-[28px] font-medium leading-[1.06] tracking-[-0.02em]">
          {c.title}
        </h1>

        <div className="mb-[18px] flex gap-3 rounded-lg bg-tg-emph p-4 text-white">
          <Info size={18} className="mt-0.5 flex-none text-tg-yellow" />
          <span className="font-body text-[12.5px] leading-[1.55] text-white/80">
            {TANGLE_DISCLAIMER}
          </span>
        </div>

        <div className="mb-1 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
          Your commitments
        </div>

        {c.items.map((item, i) => (
          <ConsentRow
            key={i}
            item={item}
            checked={ticked[i]}
            onToggle={() =>
              setTicked((prev) => prev.map((v, k) => (k === i ? !v : v)))
            }
          />
        ))}

        <div className="mt-5 mb-1 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
          Stay in the loop · optional
        </div>
        <ConsentRow
          item={{
            text:
              "I'd like to receive product updates, tips and occasional offers from Tangle by email. You can change this any time in Settings.",
          }}
          checked={marketing}
          onToggle={() => setMarketing((v) => !v)}
        />

        <div className="mt-3.5 flex items-center gap-2">
          <ShieldCheck size={14} className="text-tg-brown-soft" />
          <Meta>Tick all three commitments to continue. The marketing option is up to you.</Meta>
        </div>
      </div>
    </MobileShell>
  );
}

function ConsentRow({
  item,
  checked,
  onToggle,
}: {
  item: ConsentItem;
  checked: boolean;
  onToggle: () => void;
}) {
  const lastFire = useRef(0);
  const fire = () => {
    const now = Date.now();
    if (now - lastFire.current < 350) return; // dedupe touch+click double-fire on WebView
    lastFire.current = now;
    onToggle();
  };
  return (
    <button
      type="button"
      onClick={fire}
      style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
      className="flex w-full select-none items-start gap-3 border-b border-tg-line-soft py-2.5 text-left"
    >
      <span
        className={cn(
          "mt-0.5 flex h-[23px] w-[23px] flex-none items-center justify-center rounded-md border-[1.5px] transition-colors",
          checked ? "border-tg-blue bg-tg-blue" : "border-tg-line bg-transparent",
        )}
      >
        {checked && <Check size={14} strokeWidth={3} className="text-white" />}
      </span>
      <span className={cn("flex-1 font-body text-[13.2px] leading-[1.5] text-tg-ink", item.strong && "font-semibold")}>
        {item.text}
        {item.policies && (
          <>
            {" "}
            {item.policies.map((p, i) => (
              <span key={p}>
                {i > 0 && (i === item.policies!.length - 1 ? " and " : ", ")}
                <span className="font-semibold text-tg-blue-accent underline">{p}</span>
              </span>
            ))}
            .
          </>
        )}
      </span>
    </button>
  );
}
