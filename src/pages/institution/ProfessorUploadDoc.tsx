import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, FileText, Layers, Link as LinkIcon, Loader, Lock, Upload } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { TextField } from "@/components/app/fields";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import {
  addClassDocument,
  getClass,
  listClassDocuments,
  type ClassDocument,
  type ClassSummary,
} from "@/services/classes";
import { uploadService } from "@/services/uploads";
import { cn } from "@/lib/utils";

const CHOICES = [
  { id: "project", icon: Layers, title: "Add a project", desc: "Brief, images and references for a studio task." },
  { id: "document", icon: FileText, title: "Add a document", desc: "Readings, lecture slides or notes. PDFs, images and links." },
  { id: "brief", icon: FileText, title: "Add the brief", desc: "Set the project brief shown at the top of the studio page." },
  { id: "reference", icon: LinkIcon, title: "Add references", desc: "Shared references for the class." },
] as const;

type DocKind = ClassDocument["kind"];

/** 31 · Professor's + menu — add a project, document, brief or reference. Only professors/TAs. */
export default function ProfessorUploadDoc() {
  const navigate = useNavigate();
  const { id: classId } = useParams();
  const [search] = useSearchParams();
  const initialKind = (search.get("kind") as DocKind | null) ?? "document";

  const [cls, setCls] = useState<ClassSummary | null>(null);
  const [recent, setRecent] = useState<ClassDocument[]>([]);
  const [kind, setKind] = useState<DocKind>(initialKind);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<{ phase: string; ratio: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!classId) return;
    Promise.all([getClass(classId), listClassDocuments(classId)]).then(([c, d]) => {
      setCls(c); setRecent(d.slice(0, 6));
    });
  }, [classId]);

  const canPost = !!cls && (cls.my_role === "professor" || cls.my_role === "ta");

  const submit = async () => {
    if (!classId) return;
    if (!canPost) { setErr("Only professors and TAs can post to a class."); return; }
    if (!title.trim()) { setErr("Add a title."); return; }
    setBusy(true); setErr(null);
    try {
      let filePath: string | undefined;
      if (file) {
        const res = await uploadService.upload("class-docs", `class-${classId}/${Date.now()}-${file.name}`, file, (p) => {
          setProgress({ phase: p.phase, ratio: p.ratio });
        });
        filePath = res.path;
      }
      await addClassDocument({
        classId,
        kind,
        title: title.trim(),
        body: body.trim() || undefined,
        filePath,
        linkUrl: link.trim() || undefined,
      });
      navigate(-1);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" onClick={submit} disabled={busy || !canPost}>
            {busy ? (progress?.phase ?? "Saving…") : "Add to class"}
          </Button>
        </div>
      }
    >
      <BackHeader title="Add to class" />

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4 pt-3.5">
        <h1 className="font-serif text-[25px] font-medium tracking-[-0.02em] text-tg-ink">Share with the class.</h1>
        <p className="mb-4 mt-2 font-body text-[13px] leading-[1.5] text-tg-brown">
          Members get a notification when you post. Only they can open it.
        </p>

        {!canPost && (
          <div className="mb-3 flex items-start gap-2 rounded-DEFAULT bg-tg-stone2 p-3">
            <Lock size={15} className="mt-0.5 flex-none text-tg-brown" />
            <Meta>Only professors and TAs can post to a class.</Meta>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {CHOICES.map((c) => {
            const on = kind === c.id;
            const Icon = c.icon;
            return (
              <button key={c.id} type="button" onClick={() => setKind(c.id as DocKind)}
                className={cn("flex gap-3 rounded-DEFAULT border-[1.5px] p-3.5 text-left",
                  on ? "border-tg-blue-accent bg-tg-blue-accent/5" : "border-tg-line bg-tg-card")}>
                <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] bg-tg-stone2">
                  <Icon size={19} className="text-tg-blue-accent" />
                </span>
                <div className="flex-1">
                  <div className="font-display text-[14.5px] font-semibold text-tg-ink">{c.title}</div>
                  <div className="mt-0.5 font-body text-[12px] leading-[1.4] text-tg-brown">{c.desc}</div>
                </div>
                <span className={cn("mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-pill border-[1.5px]", on ? "border-tg-blue-accent" : "border-tg-line")}>
                  {on && <span className="h-2.5 w-2.5 rounded-pill bg-tg-blue-accent" />}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          <TextField label="Title" placeholder="e.g. Studio brief — Term 2" value={title} onChange={(e) => setTitle(e.target.value)} />
          {(kind === "brief" || kind === "document") && (
            <label className="block">
              <span className="mb-1 block font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">Body (optional)</span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full rounded-DEFAULT border border-tg-line bg-tg-card p-3 font-body text-[13.5px] text-tg-ink outline-none focus:border-tg-blue-accent"
              />
            </label>
          )}
          <TextField label="Link (optional)" mono placeholder="https://…" value={link} onChange={(e) => setLink(e.target.value)} />

          <input ref={fileRef} type="file" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} accept="image/*,video/*,application/pdf" />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="mt-1 flex flex-col items-center gap-2 rounded-lg border-[1.5px] border-dashed border-tg-blue-accent bg-tg-blue-accent/[0.04] px-4 py-6">
            <span className="flex h-[46px] w-[46px] items-center justify-center rounded-[12px] bg-tg-blue">
              <Upload size={22} className="text-white" />
            </span>
            <div className="font-display text-[14.5px] font-semibold text-tg-ink">{file ? file.name : "Drag files here, or tap to browse"}</div>
            <Meta>PDF, images, video · auto-compressed</Meta>
          </button>

          {progress && (
            <div className="mt-1 flex items-start gap-2.5 rounded-DEFAULT bg-tg-stone2 p-3">
              <Loader size={15} className="mt-0.5 flex-none animate-spin text-tg-blue-accent" />
              <Meta>{progress.phase} · {Math.round(progress.ratio * 100)}%</Meta>
            </div>
          )}
          {err && <div className="rounded-DEFAULT border border-tg-line bg-tg-card p-3 font-body text-[12.5px] text-tg-ink">{err}</div>}
        </div>

        {recent.length > 0 && (
          <>
            <div className="mb-2.5 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">In this class</div>
            <div className="overflow-hidden rounded-lg border border-tg-line">
              {recent.map((d, i) => (
                <div key={d.id} className={`flex items-center gap-3 bg-tg-card px-3.5 py-3 ${i ? "border-t border-tg-line" : ""}`}>
                  <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[9px] bg-tg-stone2">
                    <FileText size={18} className="text-tg-blue-accent" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[13.8px] font-semibold text-tg-ink">{d.title}</div>
                    <Meta className="mt-0.5 block">{d.kind} · {new Date(d.created_at).toLocaleDateString()}</Meta>
                  </div>
                  <CheckCircle2 size={18} className="flex-none text-tg-blue-accent" />
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-3 flex items-center gap-2">
          <Lock size={13} className="text-tg-brown-soft" />
          <Meta>Only professors and TAs can post to a class.</Meta>
        </div>
      </div>
    </MobileShell>
  );
}
