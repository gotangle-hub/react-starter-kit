import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, Download, FileText, Lock, MessageCircle, Plus } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { Meta } from "@/components/brand/atoms";
import { makers, professorClasses } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

const READINGS = [
  { title: "The Stars Down to Earth", meta: "Adorno · ch. 1–3 · for Nov 8" },
  { title: "Notes on the Index", meta: "Krauss · PDF · 1.1 MB" },
  { title: "Grid systems primer", meta: "Link · weekly reference" },
];

const LECTURES = [
  { title: "Lecture 03 — Systems & order", meta: "Slides · 6.4 MB" },
  { title: "Lecture 04 — Section as method", meta: "PDF · 8.1 MB · new" },
];

const DISCUSSION = [
  { id: "mona", text: "Is the grid a constraint or a generator here? I keep reading it both ways." },
  { id: "noor", text: "Generator — Krauss is pretty clear the index resists the grid's neutrality." },
];

function HeaderRight() {
  return (
    <span className="ml-auto flex flex-none items-center gap-2">
      <span className="rounded-chip bg-tg-yellow px-1.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.1em] text-tg-ink dark:text-white">
        Theory
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-md bg-tg-stone2 px-2 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
        <Lock size={11} strokeWidth={2.25} />
        Private
      </span>
    </span>
  );
}

/** 30 · A theory/lecture class — readings, lecture documents, discussion, group chat. */
export default function TheoreticalClassPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const cls = professorClasses.find((c) => c.id === id) ?? professorClasses[1];
  const by = (mid: string) => makers.find((m) => m.id === mid) ?? makers[0];

  return (
    <MobileShell>
      <BackHeader title="Type & Systems" right={<HeaderRight />} />

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4 pt-3">
        <RefreshHint className="-mt-1 mb-1" />
        <Meta className="block">{cls.tag} · {cls.students} students · Prof. Mira Haddad</Meta>

        {/* Readings */}
        <div className="mb-2.5 mt-4 flex items-center justify-between">
          <span className="font-display text-[13px] font-semibold text-tg-ink">Readings</span>
          <button
            type="button"
            onClick={() => navigate(routes.professorUploadDoc)}
            className="inline-flex items-center gap-1 font-display text-[12px] font-semibold text-tg-blue-accent"
          >
            <Plus size={13} />
            Add
          </button>
        </div>
        <div className="overflow-hidden rounded-lg border border-tg-line">
          {READINGS.map((r, i) => (
            <div key={r.title} className={`flex items-center gap-3 bg-tg-card px-3.5 py-3 ${i ? "border-t border-tg-line" : ""}`}>
              <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[9px] bg-tg-stone2">
                <BookOpen size={18} className="text-tg-blue-accent" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-[13.8px] font-semibold text-tg-ink">{r.title}</div>
                <Meta className="mt-0.5 block">{r.meta}</Meta>
              </div>
              <Download size={17} className="text-tg-brown-soft" />
            </div>
          ))}
        </div>

        {/* Lecture documents */}
        <div className="mb-2.5 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
          Lecture documents
        </div>
        <div className="overflow-hidden rounded-lg border border-tg-line">
          {LECTURES.map((l, i) => (
            <div key={l.title} className={`flex items-center gap-3 bg-tg-card px-3.5 py-3 ${i ? "border-t border-tg-line" : ""}`}>
              <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[9px] bg-tg-stone2">
                <FileText size={18} className="text-tg-blue-accent" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-[13.8px] font-semibold text-tg-ink">{l.title}</div>
                <Meta className="mt-0.5 block">{l.meta}</Meta>
              </div>
              <Download size={17} className="text-tg-blue-accent" />
            </div>
          ))}
        </div>

        {/* Discussion */}
        <div className="mb-2.5 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
          Discussion
        </div>
        <div className="flex flex-col gap-2.5">
          {DISCUSSION.map((d, i) => {
            const m = by(d.id);
            return (
              <div key={i} className="flex gap-2.5">
                <Avatar maker={m} size={32} />
                <div className="flex-1 rounded-lg rounded-tl-sm border border-tg-line bg-tg-card p-3">
                  <div className="font-display text-[12.5px] font-semibold text-tg-ink">{m.name}</div>
                  <p className="mt-1 font-body text-[13px] leading-[1.5] text-tg-ink">{d.text}</p>
                </div>
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
            <div className="mt-0.5 font-body text-[12.5px] leading-[1.4] text-white/70">Mira posted next week's reading</div>
          </div>
          <span className="rounded-pill bg-tg-yellow px-1.5 text-center font-display text-[11px] font-bold leading-[22px] text-tg-ink dark:text-white" style={{ minWidth: 22, height: 22 }}>
            3
          </span>
        </button>
      </div>
    </MobileShell>
  );
}
