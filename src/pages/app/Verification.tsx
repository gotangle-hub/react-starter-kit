import { useEffect, useRef, useState } from "react";
import { Check, Loader2, ShieldCheck, UploadCloud } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMyVerificationStatus, submitIdentityVerification } from "@/services/verification";

type State = "idle" | "checking" | "verified" | "rejected";

const STEPS: { key: State; label: string; detail: string }[] = [
  { key: "idle", label: "Submit proof", detail: "Add a government ID and a quick selfie." },
  { key: "checking", label: "Checking", detail: "We verify your identity automatically — no manual review." },
  { key: "verified", label: "Verified", detail: "The yellow tick is awarded to your profile." },
];

const ORDER: State[] = ["idle", "checking", "verified"];

/**
 * 52 · Get verified (G11). Automatic identity verification — the user submits the
 * required proof and the system verifies them without manual review.
 */
export default function Verification() {
  const [state, setState] = useState<State>("idle");
  const [idDoc, setIdDoc] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const idInput = useRef<HTMLInputElement>(null);
  const selfieInput = useRef<HTMLInputElement>(null);
  const current = ORDER.indexOf(state === "rejected" ? "idle" : state);

  useEffect(() => {
    (async () => {
      const s = await getMyVerificationStatus();
      if (s === "verified") setState("verified");
      else if (s === "submitted") setState("checking");
      else if (s === "rejected") setState("rejected");
    })();
  }, []);

  async function onSubmit() {
    setErr(null);
    if (!idDoc || !selfie) {
      setErr("Please add both an ID document and a selfie.");
      return;
    }
    setState("checking");
    try {
      const res = await submitIdentityVerification(idDoc, selfie);
      if (res.verified) setState("verified");
      else {
        setState("rejected");
        setErr(res.reason || "We couldn't verify those documents. Try clearer photos.");
      }
    } catch (e) {
      setState("rejected");
      setErr(e instanceof Error ? e.message : "Submission failed");
    }
  }

  return (
    <MobileShell header={<BackHeader title="Get verified" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-5">
        <div className="flex items-center gap-2">
          <VerifiedBadge size={26} />
          <h1 className="font-serif text-[27px] font-medium leading-none tracking-[-0.02em] text-tg-ink">
            The yellow tick
          </h1>
        </div>
        <p className="mt-3 font-body text-[14.5px] leading-relaxed text-tg-brown">
          Verification confirms you are who you say you are. It is fully automatic — submit the
          required proof and the system awards the tick once it is satisfied.
        </p>

        {/* Stepper */}
        <div className="mt-7 flex flex-col gap-0">
          {STEPS.map((step, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <div key={step.key} className="flex gap-3.5">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex h-9 w-9 flex-none items-center justify-center rounded-pill border",
                      done && "border-tg-blue-accent bg-tg-blue text-white",
                      active && !done && "border-tg-blue-accent text-tg-blue-accent",
                      !done && !active && "border-tg-line text-tg-brown-soft",
                    )}
                  >
                    {done ? <Check size={17} strokeWidth={2.5} /> :
                     active && state === "checking" ? <Loader2 size={17} className="animate-spin" /> :
                     step.key === "verified" ? <ShieldCheck size={17} /> :
                     <UploadCloud size={17} />}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className={cn("my-1 w-px flex-1", done ? "bg-tg-blue-accent" : "bg-tg-line")} style={{ minHeight: 28 }} />
                  )}
                </div>
                <div className="pb-6">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-display text-[15px] font-semibold", active || done ? "text-tg-ink" : "text-tg-brown-soft")}>
                      {step.label}
                    </span>
                    {step.key === "verified" && state === "verified" && <VerifiedBadge size={16} />}
                  </div>
                  <Meta className="mt-1 block max-w-[260px]">{step.detail}</Meta>
                  {step.key === "checking" && state === "checking" && (
                    <span className="mt-2 inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-blue-accent">
                      <Loader2 size={12} className="animate-spin" />
                      Checking your identity
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upload + actions */}
        {(state === "idle" || state === "rejected") && (
          <div className="flex flex-col gap-3">
            <input ref={idInput} type="file" accept="image/*,application/pdf" hidden
              onChange={(e) => setIdDoc(e.target.files?.[0] ?? null)} />
            <input ref={selfieInput} type="file" accept="image/*" capture="user" hidden
              onChange={(e) => setSelfie(e.target.files?.[0] ?? null)} />

            <button type="button" onClick={() => idInput.current?.click()}
              className="flex items-center justify-between rounded-lg border border-dashed border-tg-line bg-tg-card px-4 py-3 text-left">
              <span className="font-display text-[13.5px] font-medium text-tg-ink">
                {idDoc ? idDoc.name : "Upload government ID"}
              </span>
              <UploadCloud size={16} className="text-tg-brown" />
            </button>
            <button type="button" onClick={() => selfieInput.current?.click()}
              className="flex items-center justify-between rounded-lg border border-dashed border-tg-line bg-tg-card px-4 py-3 text-left">
              <span className="font-display text-[13.5px] font-medium text-tg-ink">
                {selfie ? selfie.name : "Take a selfie"}
              </span>
              <UploadCloud size={16} className="text-tg-brown" />
            </button>

            {err && <Meta className="block text-[#c0392b]">{err}</Meta>}

            <Button variant="primary" full size="lg" onClick={onSubmit} disabled={!idDoc || !selfie}>
              {state === "rejected" ? "Try again" : "Submit for verification"}
            </Button>
          </div>
        )}

        {state === "checking" && (
          <Meta className="mt-3 block text-center">
            Submitted. You can leave this screen — your tick appears the moment checks pass.
          </Meta>
        )}

        {state === "verified" && (
          <div className="rounded-lg border border-tg-line bg-tg-card p-5 text-center">
            <span className="inline-flex">
              <VerifiedBadge size={34} />
            </span>
            <div className="mt-2 font-serif text-[20px] font-medium tracking-[-0.01em] text-tg-ink">
              You're verified.
            </div>
            <Meta className="mt-1.5 block">The yellow tick now sits beside your name across Tangle.</Meta>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
