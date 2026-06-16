import { useNavigate, useParams } from "react-router-dom";
import { Download, FileText, Image as ImageIcon, Lock, MessageCircle, Pin, Plus } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Meta, PhotoTile } from "@/components/brand/atoms";
import { classDocs, feed, professorClasses } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

const DOC_ICON = { file: FileText, link: ImageIcon, image: ImageIcon } as const;
const BRIEF_IMAGES = ["spec-full.jpg", "spec-negative.jpg", "spec-blades.jpg"];
const REFERENCES = ["spec-handles.jpg", "spec-full.jpg", "spec-negative.jpg"];

function HeaderRight() {
  return (
    <span className="ml-auto flex flex-none items-center gap-2">
      <span className="rounded-chip bg-tg-yellow px-1.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.1em] text-tg-ink dark:text-white">
        Studio
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-md bg-tg-stone2 px-2 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
        <Lock size={11} strokeWidth={2.25} />
        Private
      </span>
    </span>
  );
}

/** 29 · A studio-type class — brief, references, shared pins, documents, group chat. */
export default function StudioClassPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const cls = professorClasses.find((c) => c.id === id) ?? professorClasses[0];

  return (
    <MobileShell>
      <BackHeader title="Spatial Studio" right={<HeaderRight />} />

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4 pt-3">
        <RefreshHint className="-mt-1 mb-1" />
        <Meta className="block">{cls.tag} · {cls.students} students · Prof. Rakan Lee</Meta>

        {/* Project brief */}
        <div className="mb-2.5 mt-4 flex items-center justify-between">
          <span className="font-display text-[13px] font-semibold text-tg-ink">Project brief</span>
          <button
            type="button"
            onClick={() => navigate(routes.professorUploadDoc)}
            className="inline-flex items-center gap-1 font-display text-[12px] font-semibold text-tg-blue-accent"
          >
            <Plus size={13} />
            Add
          </button>
        </div>
        <div className="rounded-lg border border-tg-line bg-tg-card p-4">
          <div className="font-serif text-[17px] font-medium tracking-[-0.01em] text-tg-ink">Inhabiting the threshold</div>
          <p className="mt-1.5 font-body text-[13px] leading-[1.55] text-tg-ink">
            Design a small public room that mediates between street and interior. Section drives the scheme; bring a working model and two key drawings to the crit.
          </p>
          <Meta className="mt-2.5 block">Term 2 · crit Nov 14</Meta>
        </div>

        {/* Brief images */}
        <div className="mb-2.5 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
          Brief images
        </div>
        <div className="grid grid-cols-3 gap-2">
          {BRIEF_IMAGES.map((im) => (
            <PhotoTile key={im} width="100%" height={84} radius={11} img={feed(im)} swatch="#E7DDCB" />
          ))}
        </div>

        {/* References */}
        <div className="mb-2.5 mt-5 flex items-baseline justify-between">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">References</span>
          <span className="inline-flex items-center gap-1.5 text-tg-brown-soft">
            <Pin size={13} />
            <Meta>Shared pins</Meta>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {REFERENCES.map((im) => (
            <PhotoTile key={im} width="100%" height={84} radius={11} img={feed(im)} swatch="#E7DDCB" />
          ))}
        </div>

        {/* Documents */}
        <div className="mb-2.5 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
          Documents
        </div>
        <div className="overflow-hidden rounded-lg border border-tg-line">
          {classDocs.map((d, i) => {
            const Icon = DOC_ICON[d.icon];
            return (
              <div key={d.name} className={`flex items-center gap-3 bg-tg-card px-3.5 py-3 ${i ? "border-t border-tg-line" : ""}`}>
                <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[9px] bg-tg-stone2">
                  <Icon size={18} className="text-tg-blue-accent" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-[13.8px] font-semibold text-tg-ink">{d.name}</div>
                  <Meta className="mt-0.5 block">{d.meta}</Meta>
                </div>
                <button type="button" aria-label="Download">
                  <Download size={18} className="text-tg-brown-soft" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Group chat entry */}
        <button
          type="button"
          className="mt-4 flex w-full items-center gap-3 rounded-lg bg-tg-emph p-3.5 text-left text-white"
        >
          <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[11px] bg-white/[0.14]">
            <MessageCircle size={20} className="text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[14.5px] font-semibold">Class group chat</div>
            <div className="mt-0.5 font-body text-[12.5px] leading-[1.4] text-white/70">Noor pinned the new site photos</div>
          </div>
          <span className="rounded-pill bg-tg-yellow px-1.5 text-center font-display text-[11px] font-bold leading-[22px] text-tg-ink dark:text-white" style={{ minWidth: 22, height: 22 }}>
            5
          </span>
        </button>

        <div className="mt-3 flex items-center gap-2">
          <Lock size={13} className="text-tg-brown-soft" />
          <Meta>Only the professor can add projects and documents to this studio.</Meta>
        </div>
      </div>
    </MobileShell>
  );
}
