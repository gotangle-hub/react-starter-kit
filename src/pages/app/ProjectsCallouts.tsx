import { useNavigate } from "react-router-dom";
import { Megaphone, Plus } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

/**
 * 33 · Call outs / open collaboration calls (G7, G10).
 * Backend for call-outs isn't wired yet — render a real empty state with the
 * compose CTA (G14). When the table lands the list populates from it.
 */
export default function ProjectsCallouts() {
  const navigate = useNavigate();
  return (
    <MobileShell header={<BackHeader title="Call outs" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-8">
        <RefreshHint />

        <h1 className="mt-1.5 font-serif text-[26px] font-medium leading-[1.06] tracking-[-0.02em] text-tg-ink">
          Open calls & collaborations
        </h1>
        <Meta className="mt-1.5 block">
          Briefs, gigs and partners — including groups of more than two.
        </Meta>

        <div className="mt-12 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
            <Megaphone size={22} />
          </span>
          <h2 className="mt-4 font-serif text-[20px] font-medium tracking-[-0.01em]">No call outs yet</h2>
          <Meta className="mt-1.5 block max-w-[280px]">
            When designers and clients post briefs or look for collaborators, they appear here.
          </Meta>
          <Button className="mt-4" onClick={() => navigate(routes.postCallout)}>
            <Plus size={15} className="mr-1.5" />
            Post a call out
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}
