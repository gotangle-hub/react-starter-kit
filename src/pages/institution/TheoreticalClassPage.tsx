import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, Download, FileText, Link as LinkIcon, Lock, MessageCircle, Plus } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import {
  getClass,
  listClassDocuments,
  listClassMembers,
  signClassDocUrl,
  type ClassDocument,
  type ClassMember,
  type ClassSummary,
} from "@/services/classes";
import { routes, path } from "@/lib/routes";

function HeaderRight() {
  return (
    <span className="ml-auto flex flex-none items-center gap-2">
      <span className="rounded-chip bg-tg-yellow px-1.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.1em] text-tg-ink dark:text-white">Theory</span>
      <span className="inline-flex items-center gap-1.5 rounded-md bg-tg-stone2 px-2 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
        <Lock size={11} strokeWidth={2.25} />
        Private
      </span>
    </span>
  );
}

function DocRow({ d, icon }: { d: ClassDocument; icon: "book" | "file" }) {
  const Icon = d.link_url ? LinkIcon : icon === "book" ? BookOpen : FileText;
  const open = async () => {
    if (d.link_url) { window.open(d.link_url, "_blank"); return; }
    if (d.file_path) {
      const url = await signClassDocUrl(d.file_path);
      if (url) window.open(url, "_blank");
    }
  };
  return (
    <div className="flex items-center gap-3 bg-tg-card px-3.5 py-3">
      <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[9px] bg-tg-stone2">
        <Icon size={18} className="text-tg-blue-accent" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[13.8px] font-semibold text-tg-ink">{d.title}</div>
        <Meta className="mt-0.5 block">{new Date(d.created_at).toLocaleDateString()}</Meta>
      </div>
      {(d.file_path || d.link_url) && (
        <button type="button" aria-label="Open" onClick={open}>
          <Download size={17} className="text-tg-blue-accent" />
        </button>
      )}
    </div>
  );
}

/** 30 · Theoretical class — readings, lecture documents, group chat. */
export default function TheoreticalClassPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cls, setCls] = useState<ClassSummary | null>(null);
  const [docs, setDocs] = useState<ClassDocument[]>([]);
  const [, setMembers] = useState<ClassMember[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([getClass(id), listClassDocuments(id), listClassMembers(id)]).then(([c, d, m]) => {
      setCls(c); setDocs(d); setMembers(m);
    });
  }, [id]);

  const readings = useMemo(() => docs.filter((x) => x.kind === "reference" || x.kind === "brief"), [docs]);
  const lectures = useMemo(() => docs.filter((x) => x.kind === "document" || x.kind === "project"), [docs]);
  const canPost = !!cls && (cls.my_role === "professor" || cls.my_role === "ta");

  return (
    <MobileShell>
      <BackHeader title={cls?.name ?? "Class"} right={<HeaderRight />} />

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4 pt-3">
        <RefreshHint className="-mt-1 mb-1" />
        <Meta className="block">{cls?.year || "Theory"}</Meta>

        <div className="mb-2.5 mt-4 flex items-center justify-between">
          <span className="font-display text-[13px] font-semibold text-tg-ink">Readings</span>
          {canPost && (
            <button type="button" onClick={() => id && navigate(path(routes.professorUploadDoc, { id }) + "?kind=reference")}
              className="inline-flex items-center gap-1 font-display text-[12px] font-semibold text-tg-blue-accent">
              <Plus size={13} /> Add
            </button>
          )}
        </div>
        {readings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-tg-line bg-tg-card p-4 text-center"><Meta>No readings yet.</Meta></div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-tg-line">
            {readings.map((d, i) => (<div key={d.id} className={i ? "border-t border-tg-line" : ""}><DocRow d={d} icon="book" /></div>))}
          </div>
        )}

        <div className="mb-2.5 mt-5 flex items-center justify-between">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">Lecture documents</span>
          {canPost && (
            <button type="button" onClick={() => id && navigate(path(routes.professorUploadDoc, { id }))}
              className="inline-flex items-center gap-1 font-display text-[12px] font-semibold text-tg-blue-accent">
              <Plus size={13} /> Add
            </button>
          )}
        </div>
        {lectures.length === 0 ? (
          <div className="rounded-lg border border-dashed border-tg-line bg-tg-card p-4 text-center"><Meta>No lectures yet.</Meta></div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-tg-line">
            {lectures.map((d, i) => (<div key={d.id} className={i ? "border-t border-tg-line" : ""}><DocRow d={d} icon="file" /></div>))}
          </div>
        )}

        <button type="button" onClick={() => id && navigate(path(routes.classChat, { id }))}
          className="mt-4 flex w-full items-center gap-3 rounded-lg bg-tg-emph p-3.5 text-left text-white">
          <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[11px] bg-white/[0.14]">
            <MessageCircle size={20} className="text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[14.5px] font-semibold">Class group chat</div>
            <div className="mt-0.5 font-body text-[12.5px] leading-[1.4] text-white/70">Open the live class conversation</div>
          </div>
        </button>
      </div>
    </MobileShell>
  );
}
