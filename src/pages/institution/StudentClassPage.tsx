import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, FileText, Image as ImageIcon, Link as LinkIcon, Lock, MessageCircle, Pin } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Segmented } from "@/components/app/segmented";
import { Avatar } from "@/components/brand/avatar";
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
import { makerFromProfile } from "@/services/profile";
import { routes, path } from "@/lib/routes";

function PrivateBadge() {
  return (
    <span className="ml-auto inline-flex flex-none items-center gap-1.5 rounded-md bg-tg-stone2 px-2 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
      <Lock size={11} strokeWidth={2.25} />
      Private
    </span>
  );
}

function DocRow({ d }: { d: ClassDocument }) {
  const Icon = d.link_url ? LinkIcon : d.kind === "reference" ? ImageIcon : FileText;
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

/** 23 · Student's view of a class — documents, shared pins, group chat. Read-only for students. */
export default function StudentClassPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cls, setCls] = useState<ClassSummary | null>(null);
  const [docs, setDocs] = useState<ClassDocument[]>([]);
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [tab, setTab] = useState("Documents");

  useEffect(() => {
    if (!id) return;
    Promise.all([getClass(id), listClassDocuments(id), listClassMembers(id)]).then(([c, d, m]) => {
      setCls(c); setDocs(d); setMembers(m);
    });
  }, [id]);

  const activeStudents = members.filter((m) => m.status === "active");
  const canAddPins = !!cls?.allow_student_pins;

  return (
    <MobileShell>
      <BackHeader title={cls?.name ?? "Class"} right={<PrivateBadge />} />

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4 pt-3">
        <RefreshHint className="-mt-1 mb-1" />

        <div className="mb-3.5 flex items-center gap-3">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[12px] bg-tg-blue">
            <MessageCircle size={20} className="text-white" />
          </span>
          <div className="flex-1">
            <Meta>{cls?.year || (cls?.class_type === "studio" ? "Studio" : "Theory")}</Meta>
            <div className="mt-1.5 flex items-center">
              <div className="flex">
                {activeStudents.slice(0, 5).map((m, i) => (
                  <span key={m.user_id} style={{ marginLeft: i ? -8 : 0 }}>
                    <Avatar maker={makerFromProfile(m.profile)} size={24} ring />
                  </span>
                ))}
              </div>
              <Meta className="ml-2.5">{activeStudents.length} members</Meta>
            </div>
          </div>
        </div>

        <Segmented items={["Documents", "Pins", "Students"]} active={tab} onChange={setTab} />

        {tab === "Documents" && (
          <>
            <div className="mb-2.5 mt-[18px] font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">Course documents</div>
            {docs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-tg-line bg-tg-card p-5 text-center"><Meta>No documents posted yet.</Meta></div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-tg-line">
                {docs.map((d, i) => (<div key={d.id} className={i ? "border-t border-tg-line" : ""}><DocRow d={d} /></div>))}
              </div>
            )}
          </>
        )}

        {tab === "Pins" && (
          <>
            <div className="mb-2.5 mt-[18px] flex items-baseline justify-between">
              <span className="font-display text-[13px] font-semibold text-tg-ink">Shared from Explore</span>
            </div>
            <div className="rounded-lg border border-dashed border-tg-line bg-tg-card p-5 text-center"><Meta>No pins shared in this class yet.</Meta></div>
            <div className="mt-3 flex items-start gap-2.5 rounded-DEFAULT bg-tg-stone2 p-3">
              <Pin size={15} className="mt-0.5 flex-none text-tg-brown" />
              <Meta>{canAddPins ? "You can add pins from Explore to share with this class." : "Your professor hasn't enabled student pins for this class."}</Meta>
            </div>
          </>
        )}

        {tab === "Students" && (
          <div className="mt-[18px] flex flex-col gap-1.5">
            {activeStudents.length === 0 && <Meta>No members yet.</Meta>}
            {activeStudents.map((m) => {
              const maker = makerFromProfile(m.profile);
              return (
                <button key={m.user_id} type="button"
                  onClick={() => m.profile?.username && navigate(`/u/${m.profile.username}`)}
                  className="flex items-center gap-3 py-2 text-left">
                  <Avatar maker={maker} size={38} />
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[13.8px] font-semibold text-tg-ink">{maker.name}</div>
                    <Meta className="mt-0.5 block">{m.role}</Meta>
                  </div>
                </button>
              );
            })}
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

        <div className="mt-3 flex items-center gap-2">
          <Lock size={13} className="text-tg-brown-soft" />
          <Meta>Students can&apos;t upload projects — only professors and TAs can post to a class.</Meta>
        </div>
      </div>
    </MobileShell>
  );
}
