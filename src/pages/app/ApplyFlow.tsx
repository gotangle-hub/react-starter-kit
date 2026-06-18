import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Send } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Meta, PhotoTile } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { listMyWork, postCoverUrl, type PostRow } from "@/services/work";

/**
 * 38 · Apply to a call out / competition. Real own-work attachment list (G14).
 * The call-out context is passed in via ?title=&kind=&type=&budget=&by= for now;
 * once a call_outs table exists this will load by ?id=.
 */
export default function ApplyFlow() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [pitch, setPitch] = useState("");
  const [works, setWorks] = useState<PostRow[]>([]);
  const [attached, setAttached] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    listMyWork().then((w) => {
      if (!alive) return;
      setWorks(w);
      if (w[0]) setAttached([w[0].id]);
    });
    return () => { alive = false; };
  }, []);

  const context = {
    title: params.get("title") ?? "Open call",
    kind: params.get("kind") ?? "Brief",
    type: params.get("type") ?? "",
    by: params.get("by") ?? "",
    budget: params.get("budget") ?? "",
  };

  const toggle = (id: string) =>
    setAttached((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  return (
    <MobileShell header={<BackHeader title="Apply" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-8">
        {/* Context */}
        <div className="mt-4 rounded-lg bg-tg-stone2 p-4">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-tg-brown">
            {context.kind}{context.type ? ` · ${context.type}` : ""}
          </span>
          <div className="mt-1.5 font-display text-[15.5px] font-semibold text-tg-ink">
            {context.title}
          </div>
          {(context.by || context.budget) && (
            <Meta className="mt-1 block">
              {[context.by, context.budget].filter(Boolean).join(" · ")}
            </Meta>
          )}
        </div>

        <h1 className="mt-6 font-serif text-[20px] font-medium tracking-[-0.01em] text-tg-ink">
          Why you?
        </h1>

        <textarea
          rows={5}
          value={pitch}
          onChange={(e) => setPitch(e.target.value.slice(0, 600))}
          placeholder="A short pitch — how you'd approach the brief and why it suits you."
          className="mt-3 w-full resize-none rounded-DEFAULT border border-tg-line bg-tg-card px-3.5 py-3 font-body text-[14px] leading-[1.5] text-tg-ink outline-none placeholder:text-tg-brown-soft focus:border-tg-blue-accent"
        />
        <Meta className="mt-1.5 block text-right">{pitch.length} / 600</Meta>

        <div className="mt-4 mb-3 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
          Attach work
        </div>
        {works.length === 0 ? (
          <div className="rounded-lg border border-dashed border-tg-line bg-tg-card px-4 py-8 text-center">
            <Meta className="block">Upload work to your profile first, then attach it here.</Meta>
            <Button size="sm" className="mt-3" onClick={() => navigate(routes.workUpload)}>Add work</Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {works.slice(0, 8).map((w) => {
              const on = attached.includes(w.id);
              const cover = postCoverUrl(w);
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => toggle(w.id)}
                  aria-pressed={on}
                  className={cn(
                    "relative h-[84px] w-[84px] overflow-hidden rounded-[12px] border-2 transition-colors",
                    on ? "border-tg-blue-accent" : "border-transparent",
                  )}
                >
                  <PhotoTile
                    width="100%"
                    height="100%"
                    radius={10}
                    img={cover ?? undefined}
                    swatch="#EEE6D6"
                  />
                  {on && (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-pill bg-tg-blue text-white">
                      <Check size={13} strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-none border-t border-tg-line px-[22px] py-3.5">
        <Button
          full
          size="lg"
          disabled={!pitch.trim() || attached.length === 0}
          onClick={() => navigate(routes.home)}
        >
          <Send size={15} className="mr-2" />
          Send application
        </Button>
      </div>
    </MobileShell>
  );
}
