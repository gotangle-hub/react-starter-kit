import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileUp, ImagePlus, X } from "lucide-react";

import { useWebViewport } from "@/hooks/use-is-desktop";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { uploadAndCreatePost, deriveTitleFromFile } from "@/services/work";
import { recordPracticeEvent } from "@/services/practice";
import { LoadingRing } from "@/components/brand/loading-ring";
import { WebSidebar } from "@/components/web/web-sidebar";
import { useSession } from "@/hooks/use-session";

/**
 * Desktop Share Work (reference: `web.jsx` → `WebShareWork`).
 * Centered card on a dimmed page surface — feels like a modal but is a route
 * so it deep-links cleanly. Close button returns to the previous screen.
 */
export function ShareWorkDesktop() {
  const navigate = useNavigate();
  const viewport = useWebViewport();
  const { isAuthenticated } = useSession();
  const mediaInput = useRef<HTMLInputElement>(null);
  const pdfInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const collapsed = viewport === "tablet";

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const { post } = await uploadAndCreatePost(file, {
        title: deriveTitleFromFile(file),
        onExplore: true,
      });
      const r = await recordPracticeEvent();
      if (
        r.granted_now ||
        (r.status && "granted_at" in r.status && r.status.granted_at && !sessionStorage.getItem("practice-reward-shown"))
      ) {
        sessionStorage.setItem("practice-reward-shown", "1");
        navigate(routes.practiceReward);
        return;
      }
      navigate(`${routes.addToExplore}?postId=${post.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      // eslint-disable-next-line no-alert
      alert(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] w-full bg-tg-page-board font-display text-tg-ink">
      {isAuthenticated && <WebSidebar collapsed={collapsed} />}
      <main className="relative min-h-[100dvh] min-w-0 flex-1 overflow-y-auto">
        {/* Dimmed backdrop */}
        <div className="absolute inset-0 bg-black/35" aria-hidden onClick={() => navigate(-1)} />

        <div className="relative mx-auto box-border flex min-h-[100dvh] max-w-[680px] items-center px-8 py-10">
          <div className="w-full rounded-3xl border border-tg-line bg-tg-bg shadow-card">
            {/* Header */}
            <header className="flex items-start justify-between gap-3 border-b border-tg-line px-7 py-5">
              <div>
                <h1 className="font-serif text-[24px] leading-tight tracking-[-0.01em]">
                  Share work
                </h1>
                <Meta className="mt-1 block">
                  Show the work and how you got there. Originals stay on your device.
                </Meta>
              </div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-tg-brown hover:bg-tg-stone2"
              >
                <X size={18} />
              </button>
            </header>

            {/* Drop zone */}
            <div className="px-7 py-6">
              <button
                type="button"
                disabled={busy}
                onClick={() => mediaInput.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                className={`flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors ${
                  dragging ? "border-tg-blue bg-tg-blue/5" : "border-tg-line bg-tg-card"
                }`}
              >
                <ImagePlus size={32} className="text-tg-blue-accent" />
                <div className="font-display text-[15px] font-semibold text-tg-ink">
                  Drag &amp; drop or click to choose a file
                </div>
                <Meta className="block max-w-[360px]">
                  Photos up to 30 MB, video up to 200 MB. Anything larger is compressed
                  automatically to fit.
                </Meta>
              </button>

              {/* Or — link a PDF */}
              <button
                type="button"
                disabled={busy}
                onClick={() => pdfInput.current?.click()}
                className="mt-4 flex w-full items-center gap-3 rounded-xl border border-tg-line bg-tg-card px-4 py-3.5 text-left"
              >
                <FileUp size={20} className="text-tg-brown" />
                <div className="flex-1">
                  <div className="font-display text-[14px] font-semibold text-tg-ink">
                    Link a PDF
                  </div>
                  <Meta className="mt-0.5 block">Each project inside is pulled out as images.</Meta>
                </div>
                <Button variant="outline" size="sm">
                  Choose PDF
                </Button>
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

              <p className="mt-5 font-body text-[12.5px] leading-relaxed text-tg-brown-soft">
                By adding work you confirm it is your own, or that you have the rights to share it,
                and that you will credit anyone involved.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-tg-line px-7 py-4">
              <Button variant="outline" size="md" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={busy}
                onClick={() => mediaInput.current?.click()}
              >
                {busy ? (
                  <>
                    <LoadingRing size={15} className="mr-2" />
                    Uploading…
                  </>
                ) : (
                  "Add to your work"
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
