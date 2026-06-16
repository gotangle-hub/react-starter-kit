import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, FileText, Image as ImageIcon, Link as LinkIcon, Lock, MessageCircle, Pin } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Segmented } from "@/components/app/segmented";
import { Avatar } from "@/components/brand/avatar";
import { Meta, PhotoTile } from "@/components/brand/atoms";
import { classDocs, makers, feed, studentCourses } from "@/lib/fixtures";

const DOC_ICON = { file: FileText, link: LinkIcon, image: ImageIcon } as const;
const PINS = ["spec-full.jpg", "spec-negative.jpg", "spec-handles.jpg"];

function PrivateBadge() {
  return (
    <span className="ml-auto inline-flex flex-none items-center gap-1.5 rounded-md bg-tg-stone2 px-2 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
      <Lock size={11} strokeWidth={2.25} />
      Private
    </span>
  );
}

/** 23 · A student's view of a class — documents, shared pins, group chat (private). */
export default function StudentClassPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const course = studentCourses.find((c) => c.id === id) ?? studentCourses[0];
  const students = makers.slice(0, 5);
  const [tab, setTab] = useState("Documents");

  return (
    <MobileShell>
      <BackHeader title={course.name} right={<PrivateBadge />} />

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4 pt-3">
        <RefreshHint className="-mt-1 mb-1" />

        {/* Class meta */}
        <div className="mb-3.5 flex items-center gap-3">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[12px] bg-tg-blue">
            <MessageCircle size={20} className="text-white" />
          </span>
          <div className="flex-1">
            <Meta>{course.term} · {course.prof}</Meta>
            <div className="mt-1.5 flex items-center">
              <div className="flex">
                {students.map((m, i) => (
                  <span key={m.id} style={{ marginLeft: i ? -8 : 0 }}>
                    <Avatar maker={m} size={24} ring />
                  </span>
                ))}
              </div>
              <Meta className="ml-2.5">24 students</Meta>
            </div>
          </div>
        </div>

        <Segmented items={["Documents", "Pins", "Chat", "Students"]} active={tab} onChange={setTab} />

        {tab === "Documents" && (
          <>
            <div className="mb-2.5 mt-[18px] font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
              Course documents
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
                      <Download size={18} className="text-tg-blue-accent" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "Pins" && (
          <>
            <div className="mb-2.5 mt-[18px] flex items-baseline justify-between">
              <span className="font-display text-[13px] font-semibold text-tg-ink">Shared from Explore</span>
              <Meta>9 pins</Meta>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PINS.map((im) => (
                <PhotoTile key={im} width="100%" height={84} radius={11} img={feed(im)} swatch="#E7DDCB" />
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2.5 rounded-DEFAULT bg-tg-stone2 p-3">
              <Pin size={15} className="mt-0.5 flex-none text-tg-brown" />
              <Meta>You can add pins from Explore. Your professor decides whether students can create their own pin up boards.</Meta>
            </div>
          </>
        )}

        {tab === "Students" && (
          <div className="mt-[18px] flex flex-col gap-1.5">
            {students.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => navigate(`/u/${m.id}`)}
                className="flex items-center gap-3 py-2 text-left"
              >
                <Avatar maker={m} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="font-display text-[13.8px] font-semibold text-tg-ink">{m.name}</div>
                  <Meta className="mt-0.5 block">{course.term}</Meta>
                </div>
              </button>
            ))}
          </div>
        )}

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
          <Meta>Students can't upload projects — only professors can post to a class.</Meta>
        </div>
      </div>
    </MobileShell>
  );
}
