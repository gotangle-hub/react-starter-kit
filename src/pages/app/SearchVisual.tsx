import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ImagePlus, Search } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { readFileAsDataUrl } from "@/services/search";
import { compressOnly } from "@/services/uploads";
import { LoadingRing } from "@/components/brand/loading-ring";

/**
 * 29 · Search by image (G4). Entry screen for visual search — upload or take a
 * photo to search by meaning instead of words. Never names the technology.
 * Oversized images are auto-compressed locally before being read (G9).
 */
export default function SearchVisual() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const compact = await compressOnly(file);
      const dataUrl = await readFileAsDataUrl(compact);
      navigate(routes.visualSearch, { state: { imageDataUrl: dataUrl } });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't read that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileShell header={<BackHeader title="Search by image" />}>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={onPick} />

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-6">
        <h1 className="font-serif text-[27px] font-medium leading-[1.05] tracking-[-0.02em]">
          Search using a picture.
        </h1>
        <p className="mt-2 font-body text-[15px] leading-relaxed text-tg-brown">
          Add a photo of a chair, a stair, a wordmark — anything. We read the image
          itself and surface work that means the same thing, even when no caption
          says it.
        </p>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="mt-6 flex w-full flex-col items-center justify-center gap-3 rounded-xl border-[1.5px] border-dashed border-tg-blue-accent bg-tg-card px-6 py-12 text-center disabled:opacity-60"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tg-stone2">
            {busy ? <LoadingRing size={26} /> : <ImagePlus size={26} className="text-tg-blue-accent" />}
          </span>
          <span className="font-display text-[15.5px] font-semibold text-tg-ink">
            {busy ? "Reading your image…" : "Upload an image"}
          </span>
          <Meta>JPG, PNG or HEIC · drag in or tap to choose</Meta>
        </button>

        <div className="mt-4 flex gap-2.5">
          <Button variant="outline" size="md" full onClick={() => cameraRef.current?.click()}>
            <Camera size={17} className="mr-1.5" />
            Take a photo
          </Button>
          <Button variant="outlineAccent" size="md" full onClick={() => fileRef.current?.click()}>
            <ImagePlus size={17} className="mr-1.5" />
            From library
          </Button>
        </div>

        <button
          type="button"
          onClick={() => navigate(routes.search)}
          className="mt-6 flex w-full items-center justify-center gap-2 text-tg-terra"
        >
          <Search size={15} />
          <span className="font-display text-[13.5px] font-semibold">Search with words instead</span>
        </button>
      </div>
    </MobileShell>
  );
}
