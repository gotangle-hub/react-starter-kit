import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { Meta, Pill } from "@/components/brand/atoms";
import { MobileShell } from "@/components/app/mobile-shell";
import { LocationField, TextField } from "@/components/app/fields";
import { Button } from "@/components/ui/button";
import { disciplines } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

/** 07 · Create your designer profile. All design fields + Other (free text). */
export default function Signup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Studio journey skips the personal "add work" step and goes to studio consent.
  const next = params.get("type") === "studio" ? routes.studioConsent : routes.addWork;
  const [selected, setSelected] = useState<Set<string>>(new Set(["Architecture", "Graphic"]));
  const [other, setOther] = useState(false);

  const toggle = (d: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" onClick={() => navigate(next)}>
            Continue
          </Button>
        </div>
      }
    >
      <div className="flex flex-none items-center gap-3 px-[22px] pt-1.5">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={22} className="text-tg-ink" />
        </button>
        <span className="font-display text-[15px] font-semibold">Create your profile</span>
      </div>

      <div className="px-[22px] py-3.5">
        <div className="mb-[18px] flex items-center gap-3.5">
          <span className="flex h-16 w-16 flex-none items-center justify-center rounded-pill border-[1.5px] border-dashed border-tg-line">
            <Camera size={22} className="text-tg-brown-soft" />
          </span>
          <div>
            <div className="font-display text-[15px] font-semibold">Add a profile image</div>
            <Meta>No faces required — your work speaks.</Meta>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <TextField label="Name" defaultValue="" placeholder="Your name" />
          <TextField label="Email" mono defaultValue="" placeholder="you@studio.co" type="email" />
          <TextField label="Password" defaultValue="" placeholder="••••••••" type="password" />

          <div>
            <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
              Field
            </div>
            <div className="flex flex-wrap gap-1.5">
              {disciplines.map((d) => (
                <Pill key={d} small on={selected.has(d)} onClick={() => toggle(d)}>
                  {d}
                </Pill>
              ))}
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <Pill small on={other} onClick={() => setOther((v) => !v)}>
                Other
              </Pill>
              {other && (
                <input
                  placeholder="Type your field…"
                  className="flex-1 rounded-pill border border-tg-line bg-tg-card px-3.5 py-2 text-[13px] text-tg-ink outline-none placeholder:text-tg-brown-soft focus:border-tg-blue-accent"
                />
              )}
            </div>
          </div>

          <LocationField label="Location" defaultValue="Dubai, UAE" />
        </div>
      </div>
    </MobileShell>
  );
}
