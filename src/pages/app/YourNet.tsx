import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { makers } from "@/lib/fixtures";
import { path, routes } from "@/lib/routes";

/**
 * 53 · Your network (G7). The people you're connected with, with a quick message
 * action into the direct-message thread.
 */
export default function YourNet() {
  const navigate = useNavigate();

  return (
    <MobileShell header={<BackHeader title="Your network" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-6">
        <RefreshHint />
        <Meta className="mb-1 mt-1 block">{makers.length} connections</Meta>

        <div className="flex flex-col">
          {makers.map((m) => (
            <div key={m.id} className="flex items-center gap-3 border-b border-tg-line-soft py-3.5">
              <button type="button" onClick={() => navigate(path(routes.publicProfile, { id: m.id }))}>
                <Avatar maker={m} size={46} />
              </button>
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => navigate(path(routes.publicProfile, { id: m.id }))}
              >
                <NameRow maker={m} size={14.5} />
                <Meta className="mt-0.5 block truncate">
                  {m.role} · {m.city}
                </Meta>
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(path(routes.dmThread, { id: m.id }))}
              >
                <MessageCircle size={15} />
                Message
              </Button>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
