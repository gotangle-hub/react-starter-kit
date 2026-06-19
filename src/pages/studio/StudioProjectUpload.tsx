import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Compass, FileUp, ImagePlus, X } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Avatar } from "@/components/brand/avatar";
import { Meta } from "@/components/brand/atoms";
import { TextField } from "@/components/app/fields";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { getMyProfile, makerFromProfile, type ProfileRow } from "@/services/profile";
import type { Maker } from "@/lib/profile-shape";
import { uploadAndCreatePost, deriveTitleFromFile } from "@/services/work";
import type { UploadProgress } from "@/services/uploads";

/** 14 · Add a studio project (G9). Upload + auto-compression, credit the team. */
export default function StudioProjectUpload() {
  const navigate = useNavigate();
  const [me, setMe] = useState<ProfileRow | null>(null);
  const [credited, setCredited] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    getMyProfile().then((p) => {
      if (!alive || !p) return;
      setMe(p);
      setCredited(new Set([p.id]));
    });
    return () => { alive = false; };
  }, []);

  const toggle = (id: string) =>
    setCredited((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const team: Maker[] = me ? [makerFromProfile(me) as Maker] : [];

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" onClick={() => navigate(routes.workPublished)}>
            Publish to studio page
          </Button>
        </div>
      }
    >
      <div className="flex flex-none items-center gap-3 px-[22px] pt-1.5">
        <button type="button" onClick={() => navigate(-1)} aria-label="Close"><X size={22} className="text-tg-ink" /></button>
        <span className="font-display text-[15px] font-semibold">New studio project</span>
      </div>

      <div className="px-[22px] py-3 pb-4">
        <h1 className="font-serif text-[25px] font-medium leading-[1.08] tracking-[-0.02em]">
          Publish a project to the studio page.
        </h1>
        <p className="my-2.5 font-body text-[13px] leading-relaxed text-tg-brown">
          Photos up to 30 MB, video up to 200 MB. Anything larger is compressed automatically to fit.
        </p>

        {/* Media drop targets — empty until the user adds work */}
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" className="flex h-[120px] flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-tg-line bg-tg-card">
            <ImagePlus size={22} className="text-tg-blue-accent" />
            <Meta>Photo or video</Meta>
          </button>
          <button type="button" className="flex h-[120px] flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-tg-line bg-tg-card px-2.5 text-center">
            <FileUp size={20} className="text-tg-brown-soft" />
            <Meta>Link a PDF — pulls out each project</Meta>
          </button>
        </div>

        <div className="mt-4">
          <TextField label="Project title" placeholder="A title for this project" />
        </div>

        {/* Credit the team */}
        <div className="mb-2.5 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
          Credit the team
        </div>
        {team.length === 0 ? (
          <Meta className="block">Sign in to credit your teammates.</Meta>
        ) : (
          <div className="flex flex-col">
            {team.map((m) => {
              const on = credited.has(m.id);
              return (
                <button key={m.id} type="button" onClick={() => toggle(m.id)} className="flex items-center gap-3 py-2 text-left">
                  <Avatar maker={m} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[13.5px] font-semibold">{m.name}</div>
                    <Meta className="mt-0.5 block">{m.role}</Meta>
                  </div>
                  <span className={cn("flex h-6 w-6 flex-none items-center justify-center rounded-md border-[1.5px]", on ? "border-transparent bg-tg-blue" : "border-tg-brown-soft")}>
                    {on && <Check size={14} strokeWidth={3} className="text-white" />}
                  </span>
                </button>
              );
            })}
            <Meta className="mt-2 block">Teammates appear here once they join your studio.</Meta>
          </div>
        )}

        {/* Visibility */}
        <div className="mt-4 flex items-center gap-3 rounded-DEFAULT bg-tg-stone2 p-3.5">
          <Compass size={17} className="text-tg-blue-accent" />
          <span className="flex-1 font-body text-[12.5px] leading-snug text-tg-brown">
            Also publish to Explore so anyone can discover it.
          </span>
          <span className="relative h-6 w-10 flex-none rounded-pill bg-tg-blue">
            <span className="absolute right-1 top-1 h-4 w-4 rounded-pill bg-white" />
          </span>
        </div>
      </div>
    </MobileShell>
  );
}
