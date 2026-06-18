import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, FileText, Image as ImageIcon, Link as LinkIcon, Lock, MessageCircle, Plus } from "lucide-react";
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
      <span className="rounded-chip bg-tg-yellow px-1.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.1em] text-tg-ink dark:text-white">Studio</span>
      <span className="inline-flex items-center gap-1.5 rounded-md bg-tg-stone2 px-2 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
        <Lock size={11} strokeWidth={2.25} />
        Private
      </span>
    </span>
  );
}

function DocIcon({ kind }: { kind: ClassDocument["kind"] }) {
  if (kind === "reference") return <ImageIcon size={18} className="text-tg-blue-accent" />;
  return <FileText size={18} className="text-tg-blue-accent" />;
}

function DocRow({ d }: { d: ClassDocument }) {
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
        {d.link_url ? <LinkIcon size={18} className="text-tg-blue-accent" /> : <DocIcon kind={d.kind} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[13.8px] font-semibold text-tg-ink">{d.title}</div>
        <Meta className="mt-0.5 block">{d.kind.charAt(0).toUpperCase() + d.kind.slice(1)} · {new Date(d.created_at).toLocaleDateString()}</Meta>
      </div>
      {(d.file_path || d.link_url) && (
        <button type="button" aria-label="Open" onClick={open}>
          <Download size={18} className="text-tg-blue-accent" />
        </button>
      )}
    </div>
  );
}

/** 29 · Studio class page — brief, references, documents, group chat. */
export default function StudioClassPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cls, setCls] = useState<ClassSummary | null>(null);
  const [docs, setDocs] = useState<ClassDocument[]>([]);
  const [members, setMembers] = useState<ClassMember[]>([]);

  const refresh = async () => {
    if (!id) return;
    const [c, d, m] = await Promise.all([getClass(id), listClassDocuments(id), listClassMembers(id)]);
    setCls(c); setDocs(d); setMembers(m);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const brief = useMemo(() => docs.find((x) => x.kind === "brief") || null, [docs]);
  const refs = useMemo(() => docs.filter((x) => x.kind === "reference"), [docs]);
  const projects = useMemo(() => docs.filter((x) => x.kind === "project"), [docs]);
  const documents = useMemo(() => docs.filter((x) => x.kind === "document"), [docs]);
  const canPost = !!cls && (cls.my_role === "professor" || cls.my_role === "ta");
  const activeMembers = members.filter((m) => m.status === "active").length;

  return (
    <MobileShell>
      <BackHeader title={cls?.name ?? "Class"} right={<HeaderRight />} />

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4 pt-3">
        <RefreshHint className="-mt-1 mb-1" />
        <Meta className="block">{cls?.year || "Studio"} · {activeMembers} member{activeMembers === 1 ? "" : "s"}</Meta>

        {/* Project brief */}
        <div className="mb-2.5 mt-4 flex items-center justify-between">
          <span className="font-display text-[13px] font-semibold text-tg-ink">Project brief</span>
          {canPost && (
            <button type="button" onClick={() => id && navigate(path(routes.professorUploadDoc, { id }) + "?kind=brief")}
              className="inline-flex items-center gap-1 font-display text-[12px] font-semibold text-tg-blue-accent">
              <Plus size={13} /> Add
            </button>
          )}
        </div>
        <div className="rounded-lg border border-tg-line bg-tg-card p-4">
          {brief || cls?.brief ? (
            <>
              <div className="font-serif text-[17px] font-medium tracking-[-0.01em] text-tg-ink">{brief?.title || "Brief"}</div>
              <p className="mt-1.5 whitespace-pre-wrap font-body text-[13px] leading-[1.55] text-tg-ink">{brief?.body || cls?.brief}</p>
            </>
          ) : (
            <Meta>No brief yet.{canPost ? " Add one to share with the class." : ""}</Meta>
          )}
        </div>

        {/* Projects */}
        {projects.length > 0 && (
          <>
            <div className="mb-2.5 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">Projects</div>
            <div className="overflow-hidden rounded-lg border border-tg-line">
              {projects.map((d, i) => (<div key={d.id} className={i ? "border-t border-tg-line" : ""}><DocRow d={d} /></div>))}
            </div>
          </>
        )}

        {/* References */}
        {refs.length > 0 && (
          <>
            <div className="mb-2.5 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">References</div>
            <div className="overflow-hidden rounded-lg border border-tg-line">
              {refs.map((d, i) => (<div key={d.id} className={i ? "border-t border-tg-line" : ""}><DocRow d={d} /></div>))}
            </div>
          </>
        )}

        {/* Documents */}
        <div className="mb-2.5 mt-5 flex items-center justify-between">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">Documents</span>
          {canPost && (
            <button type="button" onClick={() => id && navigate(path(routes.professorUploadDoc, { id }))}
              className="inline-flex items-center gap-1 font-display text-[12px] font-semibold text-tg-blue-accent">
              <Plus size={13} /> Add
            </button>
          )}
        </div>
        {documents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-tg-line bg-tg-card p-4 text-center"><Meta>No documents posted yet.</Meta></div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-tg-line">
            {documents.map((d, i) => (<div key={d.id} className={i ? "border-t border-tg-line" : ""}><DocRow d={d} /></div>))}
          </div>
        )}

        {/* Group chat */}
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

        <div className="mt-3 flex items-center gap-2">
          <Lock size={13} className="text-tg-brown-soft" />
          <Meta>Only professors and TAs can add projects and documents.</Meta>
        </div>
      </div>
    </MobileShell>
  );
}
