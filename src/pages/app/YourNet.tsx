import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, MessageCircle, X as XIcon } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { makerFromProfile, type ProfileRow } from "@/services/profile";
import {
  acceptRequest,
  ignoreRequest,
  listAcceptedConnections,
  listIncomingRequests,
  type ConnectionRequestRow,
} from "@/services/connections";
import { path, routes } from "@/lib/routes";

/**
 * 53 · Your network (G7). Real accepted connections from connection_requests,
 * with an incoming-requests section at the top (Accept / Ignore).
 */
import { useWebViewport } from "@/hooks/use-is-desktop";
import { YourNetDesktop } from "@/components/web/pages/your-net-desktop";

export default function YourNet() {
  const viewport = useWebViewport();
  if (viewport !== "mobile") return <YourNetDesktop />;
  return <YourNetMobile />;
}

function YourNetMobile() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState<{ otherId: string; profile: ProfileRow | null }[]>([]);
  const [incoming, setIncoming] = useState<{ row: ConnectionRequestRow; profile: ProfileRow | null }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [a, i] = await Promise.all([listAcceptedConnections(), listIncomingRequests()]);
    setAccepted(a);
    setIncoming(i);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function onAccept(id: string) {
    setIncoming((rows) => rows.filter((r) => r.row.id !== id));
    await acceptRequest(id);
    load();
  }

  async function onIgnore(id: string) {
    setIncoming((rows) => rows.filter((r) => r.row.id !== id));
    await ignoreRequest(id);
  }

  return (
    <MobileShell header={<BackHeader title="Your network" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-6">
        <RefreshHint />

        {incoming.length > 0 && (
          <section className="mt-1">
            <Meta className="mb-2 block">
              {incoming.length} incoming {incoming.length === 1 ? "request" : "requests"}
            </Meta>
            <div className="flex flex-col gap-2">
              {incoming.map(({ row, profile }) => {
                const maker = makerFromProfile(profile);
                return (
                  <div
                    key={row.id}
                    className="flex items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-3"
                  >
                    <button
                      type="button"
                      onClick={() => navigate(path(routes.publicProfile, { id: row.requester_id }))}
                    >
                      <Avatar maker={maker} size={44} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-[14px] font-semibold text-tg-ink">
                        {maker.name}
                      </div>
                      <Meta className="block truncate">wants to connect</Meta>
                    </div>
                    <button
                      type="button"
                      aria-label="Ignore"
                      onClick={() => onIgnore(row.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-pill border border-tg-line text-tg-brown"
                    >
                      <XIcon size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label="Accept"
                      onClick={() => onAccept(row.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-pill bg-tg-blue text-white"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <Meta className="mb-1 mt-4 block">
          {accepted.length} {accepted.length === 1 ? "connection" : "connections"}
        </Meta>

        <div className="flex flex-col">
          {accepted.map(({ otherId, profile }) => {
            const maker = makerFromProfile(profile);
            return (
              <div
                key={otherId}
                className="flex items-center gap-3 border-b border-tg-line-soft py-3.5"
              >
                <button
                  type="button"
                  onClick={() => navigate(path(routes.publicProfile, { id: otherId }))}
                >
                  <Avatar maker={maker} size={46} />
                </button>
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => navigate(path(routes.publicProfile, { id: otherId }))}
                >
                  <div className="truncate font-display text-[14.5px] font-semibold text-tg-ink">
                    {maker.name}
                  </div>
                  <Meta className="mt-0.5 block truncate capitalize">
                    {maker.role}
                    {profile?.location ? ` · ${profile.location}` : ""}
                  </Meta>
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(path(routes.dmThread, { id: otherId }))}
                >
                  <MessageCircle size={15} />
                  Message
                </Button>
              </div>
            );
          })}
          {!accepted.length && !loading && (
            <Meta className="mt-6 block text-center">
              No connections yet. Swipe right on someone in Match to get started.
            </Meta>
          )}
        </div>
      </div>
    </MobileShell>
  );
}
