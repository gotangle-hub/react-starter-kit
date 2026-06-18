import { useEffect, useRef, useState } from "react";
import { Check, Loader2, ShieldCheck, ExternalLink, RefreshCw } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getMyVerificationStatus,
  getMyLatestInquiryId,
  startPersonaVerification,
  checkPersonaInquiry,
} from "@/services/verification";

type State = "idle" | "checking" | "verified" | "rejected";

const STEPS: { key: State; label: string; detail: string }[] = [
  { key: "idle", label: "Submit proof", detail: "Open the secure verification flow to add your ID and a selfie." },
  { key: "checking", label: "Checking", detail: "We verify your identity automatically — no manual review." },
  { key: "verified", label: "Verified", detail: "The yellow tick is awarded to your profile." },
];

const ORDER: State[] = ["idle", "checking", "verified"];

/**
 * 52 · Get verified (G11). Automatic identity verification powered by a
 * regulated KYC provider — the user submits proof and the system flips them
 * to verified the moment checks pass.
 */
export default function Verification() {
  const [state, setState] = useState<State>("idle");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inquiryRef = useRef<string | null>(null);
  const pollRef = useRef<number | null>(null);
  const current = ORDER.indexOf(state === "rejected" ? "idle" : state);

  // On mount: read current status + any inquiry to resume polling
  useEffect(() => {
    (async () => {
      const s = await getMyVerificationStatus();
      if (s === "verified") setState("verified");
      else if (s === "submitted") setState("checking");
      else if (s === "rejected") setState("rejected");

      // Pick up inquiry id (from session, query param, or DB)
      const url = new URL(window.location.href);
      const paramInq = url.searchParams.get("inquiry-id") || url.searchParams.get("inquiryId");
      const stored = (() => {
        try { return sessionStorage.getItem("tg.persona.inquiryId"); } catch { return null; }
      })();
      let inq = paramInq || stored;
      if (!inq) inq = await getMyLatestInquiryId();
      inquiryRef.current = inq;

      if (paramInq) {
        // Returned from Persona — kick a fresh check
        await refresh();
      }
    })();
    return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
  }, []);

  // Poll while we're in "checking"
  useEffect(() => {
    if (state !== "checking" || !inquiryRef.current) return;
    pollRef.current = window.setInterval(() => { refresh(); }, 4000);
    return () => { if (pollRef.current) { window.clearInterval(pollRef.current); pollRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  async function refresh() {
    if (!inquiryRef.current) return;
    try {
      const r = await checkPersonaInquiry(inquiryRef.current);
      if (r.status === "verified") setState("verified");
      else if (r.status === "rejected") { setState("rejected"); setErr("We couldn't verify your identity. Please try again."); }
      else setState("checking");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't refresh status");
    }
  }

  async function onStart() {
    setErr(null);
    setBusy(true);
    try {
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      const { inquiryId, url } = await startPersonaVerification(redirectUri);
      inquiryRef.current = inquiryId;
      setState("checking");
      window.location.href = url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not start verification");
      setState("rejected");
    } finally {
      setBusy(false);
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
          Verification confirms you are who you say you are. It runs through a regulated identity
          partner and is fully automatic — submit the required proof and the system awards the
          tick once it is satisfied.
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
                     <ExternalLink size={17} />}
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

        {(state === "idle" || state === "rejected") && (
          <div className="flex flex-col gap-3">
            {err && <Meta className="block text-[#c0392b]">{err}</Meta>}
            <Button variant="primary" full size="lg" onClick={onStart} disabled={busy}>
              {busy ? "Opening…" : state === "rejected" ? "Try again" : "Start verification"}
            </Button>
            <Meta className="block text-center">
              You'll be taken to our secure verification partner and returned here when you're done.
            </Meta>
          </div>
        )}

        {state === "checking" && (
          <div className="flex flex-col gap-3">
            <Meta className="block text-center">
              Submitted. You can leave this screen — your tick appears the moment checks pass.
            </Meta>
            <Button variant="outline" full size="lg" onClick={refresh}>
              <RefreshCw size={16} className="mr-1.5" /> Refresh status
            </Button>
          </div>
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
