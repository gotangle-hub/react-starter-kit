import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Segmented } from "@/components/app/segmented";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { getProfileById, makerFromProfile } from "@/services/profile";
import { lookupProfileIdByUsername } from "@/services/usernames";
import type { Maker } from "@/lib/profile-shape";

/**
 * 42 · Request to connect / collaborate. Takes the target via ?to=<id|@handle>.
 */

const MODES = ["Connect", "Invite to collaborate"] as const;

export default function RequestFlow() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<string>(MODES[0]);
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<Maker | null>(null);
  const collab = mode === MODES[1];

  useEffect(() => {
    let alive = true;
    (async () => {
      const raw = params.get("to") ?? "";
      if (!raw) return;
      let id = raw;
      if (raw.startsWith("@")) {
        id = (await lookupProfileIdByUsername(raw.slice(1))) ?? "";
      }
      if (!id) return;
      const profile = await getProfileById(id);
      if (alive && profile) setTarget(makerFromProfile(profile) as Maker);
    })();
    return () => { alive = false; };
  }, [params]);

  return (
    <MobileShell header={<BackHeader title="Send a request" />}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-6">
          {/* Target person */}
          {target ? (
            <Card className="mt-4 flex items-center gap-3 p-4">
              <Avatar maker={target} size={50} />
              <div className="min-w-0 flex-1">
                <NameRow maker={target} size={15} />
                <Meta className="mt-0.5 block">
                  {target.role}{target.city ? ` · ${target.city}` : ""}
                </Meta>
              </div>
            </Card>
          ) : (
            <Card className="mt-4 p-4">
              <Meta>Choose someone from search or a profile to send a request.</Meta>
            </Card>
          )}

          <div className="mt-6 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
            What are you sending?
          </div>
          <div className="mt-3">
            <Segmented items={[...MODES]} active={mode} onChange={setMode} />
          </div>
          <Meta className="mt-2.5 block leading-[1.5]">
            {collab
              ? "Invite them onto a project — if they accept, a shared group chat opens with the planning tools."
              : "A connection request. Once accepted you can message each other directly."}
          </Meta>

          <div className="mt-6 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
            Add a message <span className="font-body normal-case text-tg-brown-soft">(optional)</span>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder={
              collab
                ? "Tell them about the project and why you'd like them on the team…"
                : "Say hello and why you'd like to connect…"
            }
            className="mt-3 w-full resize-none rounded-lg border border-tg-line bg-tg-card px-4 py-3 font-body text-[14.5px] leading-[1.5] text-tg-ink outline-none placeholder:text-tg-brown-soft focus:border-tg-blue-accent"
          />
        </div>

        <div className="flex-none border-t border-tg-line px-[22px] py-4">
          <Button full size="lg" disabled={!target} onClick={() => navigate(routes.home)}>
            {collab ? "Send invite" : "Send request"}
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}
