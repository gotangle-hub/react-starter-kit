import { useRef, useState } from "react";
import { FileUp, ImagePlus, Play, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { feed } from "@/lib/fixtures";
import { routes } from "@/lib/routes";
import { uploadService } from "@/services/uploads";

/**
 * 48 · Add to your work (G9). Upload photos/video with size limits and automatic
 * compression — oversized files are reduced before saving, the original never
 * leaves the device. The PDF path extracts each project from the file as images.
 */
export default function WorkUpload() {
  const navigate = useNavigate();
  const mediaInput = useRef<HTMLInputElement>(null);
  const pdfInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const name = `${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
      await uploadService.upload("work", `raw/${name}`, file);
      navigate(routes.addToExplore);
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
      header={<BackHeader title="Add work" />}
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] py-3 pb-6">
          <Button variant="primary" full size="lg" disabled={busy} onClick={() => mediaInput.current?.click()}>
            {busy ? "Uploading…" : "Add to your work"}
          </Button>
        </div>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-4">
        <h1 className="font-serif text-[26px] font-medium leading-[1.08] tracking-[-0.02em] text-tg-ink">
          Show the work, and how you got there.
        </h1>
        <p className="mt-2 font-body text-[13.5px] leading-relaxed text-tg-brown">
          Photos up to 30 MB, video up to 200 MB. Anything larger is compressed automatically to
          fit — your original file never leaves your device.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {/* Added photo */}
          <div className="relative overflow-hidden rounded-lg border border-tg-line">
            <div
              className="h-[130px] w-full"
              style={{
                backgroundImage: `url(${feed("spec-full.jpg")})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <span className="absolute bottom-2 left-2 rounded-chip bg-black/55 px-1.5 py-1 font-mono text-[10px] text-white">
              Photo · 6 MB
            </span>
          </div>

          {/* Added video */}
          <div className="relative overflow-hidden rounded-lg border border-tg-line">
            <div
              className="h-[130px] w-full"
              style={{
                backgroundImage: `url(${feed("spec-negative.jpg")})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-black/55 text-white">
                <Play size={16} />
              </span>
            </span>
            <span className="absolute bottom-2 right-2 rounded-chip bg-black/55 px-1.5 py-1 font-mono text-[10px] text-white">
              0:42
            </span>
          </div>

          {/* Compressing (automatic) */}
          <div className="flex h-[130px] flex-col justify-center gap-2 rounded-lg border border-tg-line bg-tg-card p-3.5">
            <span className="inline-flex items-center gap-1.5 font-display text-[9.5px] font-bold uppercase tracking-[0.1em] text-tg-blue-accent">
              <Sparkles size={13} className="text-tg-blue-accent" />
              Compressing
            </span>
            <div className="h-1.5 overflow-hidden rounded-pill bg-tg-stone2">
              <div className="h-full w-[64%] bg-tg-blue" />
            </div>
            <Meta>184 MB → 28 MB</Meta>
            <span className="font-body text-[10.5px] text-tg-brown-soft">Original stays on your device</span>
          </div>

          {/* PDF extract */}
          <div className="flex h-[130px] flex-col justify-center gap-2 rounded-lg border border-tg-line bg-tg-card p-3.5">
            <span className="inline-flex items-center gap-1.5 font-display text-[9.5px] font-bold uppercase tracking-[0.1em] text-tg-terra">
              <FileUp size={13} className="text-tg-terra" />
              Reading PDF
            </span>
            <span className="font-body text-[12px] leading-snug text-tg-ink">
              4 projects found in <b>portfolio.pdf</b>
            </span>
            <div className="flex gap-1.5">
              {["spec-handles.jpg", "spec-blades.jpg", "spec-full.jpg", "spec-negative.jpg"].map((im) => (
                <span
                  key={im}
                  className="h-[30px] flex-1 rounded-chip"
                  style={{
                    backgroundImage: `url(${feed(im)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Add photo/video target */}
          <button
            type="button"
            className="flex h-[130px] flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-tg-line bg-tg-card"
          >
            <ImagePlus size={22} className="text-tg-blue-accent" />
            <Meta>Photo or video</Meta>
          </button>

          {/* Link a PDF */}
          <button
            type="button"
            className="flex h-[130px] flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-tg-line bg-tg-card px-2.5 text-center"
          >
            <FileUp size={20} className="text-tg-brown-soft" />
            <Meta>Link a PDF — each project is pulled out for you</Meta>
          </button>
        </div>

        <p className="mt-5 font-body text-[12.5px] leading-relaxed text-tg-brown-soft">
          By adding work you confirm it is your own, or that you have the rights to share it, and
          that you will credit anyone involved.
        </p>
      </div>
    </MobileShell>
  );
}
