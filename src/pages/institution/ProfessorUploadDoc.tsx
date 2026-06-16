import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, FileText, FileUp, Image as ImageIcon, Layers, Link as LinkIcon, Loader, Lock, Upload } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";

const CHOICES = [
  { id: "project", icon: Layers, title: "Add a project", desc: "Brief, images and references for a studio task — placed as a project in the class." },
  { id: "document", icon: FileText, title: "Add a document", desc: "Readings, lecture slides or notes. PDFs, images and links." },
] as const;

const TARGETS = [
  { id: "file", icon: FileUp, label: "File" },
  { id: "link", icon: LinkIcon, label: "Link" },
  { id: "pin", icon: ImageIcon, label: "Pin from Explore" },
] as const;

const RECENT = [
  { name: "Studio brief — Term 2.pdf", meta: "PDF · 2.4 MB · just now", state: "done" as const },
  { name: "Lecture 04 — Section.pdf", meta: "PDF · 8.1 MB · compressing to 6.2 MB · 64%", state: "uploading" as const },
  { name: "Reading list", meta: "Link · rca.ac.uk/reading", state: "done" as const },
];

/** 31 · Professor's + menu — add a project or a document (G9). Only professors can post. */
export default function ProfessorUploadDoc() {
  const navigate = useNavigate();
  const [choice, setChoice] = useState<string>("project");
  const [target, setTarget] = useState<string>("file");

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" onClick={() => navigate(-1)}>Add to class</Button>
        </div>
      }
    >
      <BackHeader title="Add to class" />

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4 pt-3.5">
        <h1 className="font-serif text-[25px] font-medium tracking-[-0.02em] text-tg-ink">Share with the class.</h1>
        <p className="mb-4 mt-2 font-body text-[13px] leading-[1.5] text-tg-brown">
          Students get a notification when you post. Only enrolled students can open it.
        </p>

        {/* Project vs document */}
        <div className="flex flex-col gap-2.5">
          {CHOICES.map((c) => {
            const on = choice === c.id;
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setChoice(c.id)}
                className={`flex gap-3 rounded-DEFAULT border-[1.5px] p-3.5 text-left ${on ? "border-tg-blue-accent bg-tg-blue-accent/5" : "border-tg-line bg-tg-card"}`}
              >
                <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] bg-tg-stone2">
                  <Icon size={19} className="text-tg-blue-accent" />
                </span>
                <div className="flex-1">
                  <div className="font-display text-[14.5px] font-semibold text-tg-ink">{c.title}</div>
                  <div className="mt-0.5 font-body text-[12px] leading-[1.4] text-tg-brown">{c.desc}</div>
                </div>
                <span className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-pill border-[1.5px] ${on ? "border-tg-blue-accent" : "border-tg-line"}`}>
                  {on && <span className="h-2.5 w-2.5 rounded-pill bg-tg-blue-accent" />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dropzone */}
        <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border-[1.5px] border-dashed border-tg-blue-accent bg-tg-blue-accent/[0.04] px-4 py-6">
          <span className="flex h-[46px] w-[46px] items-center justify-center rounded-[12px] bg-tg-blue">
            <Upload size={22} className="text-white" />
          </span>
          <div className="font-display text-[14.5px] font-semibold text-tg-ink">Drag files here, or browse</div>
          <Meta>PDF, images, slides · up to 100 MB each</Meta>
        </div>

        {/* G9 compression note */}
        <div className="mt-2.5 flex items-start gap-2.5 rounded-DEFAULT bg-tg-stone2 p-3">
          <Loader size={15} className="mt-0.5 flex-none text-tg-blue-accent" />
          <Meta>Large files are compressed automatically to fit the limit before saving — only the compressed version is kept.</Meta>
        </div>

        {/* Upload targets */}
        <div className="mt-3 flex gap-2">
          {TARGETS.map((t) => {
            const on = target === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTarget(t.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-DEFAULT border py-2.5 ${on ? "border-tg-emph bg-tg-emph text-tg-emph-text" : "border-tg-line bg-tg-card text-tg-ink"}`}
              >
                <Icon size={15} />
                <span className="font-display text-[12px] font-semibold">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* In this class */}
        <div className="mb-2.5 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
          In this class
        </div>
        <div className="overflow-hidden rounded-lg border border-tg-line">
          {RECENT.map((d, i) => (
            <div key={d.name} className={`flex items-center gap-3 bg-tg-card px-3.5 py-3 ${i ? "border-t border-tg-line" : ""}`}>
              <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[9px] bg-tg-stone2">
                <FileText size={18} className="text-tg-blue-accent" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-[13.8px] font-semibold text-tg-ink">{d.name}</div>
                <Meta className="mt-0.5 block">{d.meta}</Meta>
                {d.state === "uploading" && (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-pill bg-tg-stone2">
                    <div className="h-full w-[64%] bg-tg-blue" />
                  </div>
                )}
              </div>
              {d.state === "uploading" ? (
                <Loader size={18} className="flex-none text-tg-brown-soft" />
              ) : (
                <CheckCircle2 size={18} className="flex-none text-tg-blue-accent" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Lock size={13} className="text-tg-brown-soft" />
          <Meta>Only professors and TAs can post to a class.</Meta>
        </div>
      </div>
    </MobileShell>
  );
}
