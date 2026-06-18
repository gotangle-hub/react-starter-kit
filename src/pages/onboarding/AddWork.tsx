import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, ImagePlus, Sparkles } from "lucide-react";
import { Chip } from "@/components/brand/chip";
import { Meta } from "@/components/brand/atoms";
import { MobileShell } from "@/components/app/mobile-shell";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { uploadAndCreatePost, deriveTitleFromFile } from "@/services/work";

/**
 * 08 · Add your work (G9). The new designer adds their first work — photos/video
 * or a linked PDF the app extracts into projects. Oversized files are compressed
 * automatically before saving (see uploadService). Only profile-build step.
 */
export default function AddWork() {
  const navigate = useNavigate();
  const mediaInput = useRef<HTMLInputElement>(null);
  const pdfInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(0);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      await uploadAndCreatePost(file, {
        title: deriveTitleFromFile(file),
        onExplore: true,
      });
      setAdded((n) => n + 1);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      // eslint-disable-next-line no-alert
      alert(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" onClick={() => navigate(routes.consent)}>
            Continue
          </Button>
          <p className="mt-3 text-center">
            <button type="button" onClick={() => navigate(routes.consent)}>
              <Meta>Skip for now — add work later</Meta>
            </button>
          </p>
        </div>
      }
    >
      <div className="flex flex-none items-center gap-3 px-[22px] pt-1.5">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={22} className="text-tg-ink" />
        </button>
        <span className="font-display text-[15px] font-semibold">Add your work</span>
      </div>

      <div className="px-[22px] py-3.5">
        <Chip>Your first piece</Chip>
        <h1 className="mt-3 font-serif text-[30px] font-medium leading-[1.04] tracking-[-0.02em]">
          Let the work introduce you.
        </h1>
        <p className="mt-2.5 font-body text-[15px] leading-relaxed text-tg-brown">
          Add a few photos or a video, or link a PDF portfolio — the app pulls
          each project out and places them as images.
        </p>

        <button
          type="button"
          disabled={busy}
          onClick={() => mediaInput.current?.click()}
          className="mt-5 flex w-full flex-col items-center gap-3 rounded-lg border-[1.5px] border-dashed border-tg-line bg-tg-card px-6 py-10 text-center transition-colors hover:border-tg-blue-accent"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tg-stone2">
            <ImagePlus size={24} className="text-tg-blue-accent" />
          </span>
          <span className="font-display text-[15px] font-semibold text-tg-ink">
            {busy ? "Uploading…" : "Upload photos or video"}
          </span>
          <Meta>Large files are compressed automatically before saving.</Meta>
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => pdfInput.current?.click()}
          className="mt-3 flex w-full items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-4 text-left transition-colors hover:border-tg-blue-accent"
        >
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-tg-stone2">
            <FileText size={20} className="text-tg-ink" />
          </span>
          <span className="flex-1">
            <span className="block font-display text-[15px] font-semibold text-tg-ink">
              Link a PDF portfolio
            </span>
            <Meta>We extract each project into the grid.</Meta>
          </span>
        </button>

        <input
          ref={mediaInput}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={pdfInput}
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {added > 0 && (
          <div className="mt-4 rounded-md bg-tg-stone2 px-3.5 py-2.5 font-body text-[13px] text-tg-ink">
            {added} {added === 1 ? "piece" : "pieces"} added to your work.
          </div>
        )}

        <div className="mt-5 flex items-start gap-2.5 rounded-md bg-tg-stone2 p-3.5">
          <Sparkles size={16} className="mt-0.5 flex-none text-tg-blue-accent" />
          <p className="font-body text-[13px] leading-snug text-tg-brown">
            You can keep adding work any time from your profile. Strong pieces can
            break out beyond your followers on their own.
          </p>
        </div>
      </div>
    </MobileShell>
  );
}
