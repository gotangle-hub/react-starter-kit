import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, MessageCircle, X as XIcon } from "lucide-react";

import { WebPage } from "@/components/web/web-page";
import { RightRail } from "@/components/web/right-rail";
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

export function YourNetDesktop() {
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
    <WebPage maxWidth={1100} rail={<RightRail />}>
      <h1 className="font-serif text-[34px] font-medium leading-none tracking-[-0.02em] text-tg-ink">
        Your network
      </h1>

      {incoming.length > 0 && (
        <section className="mt-7">
          <Meta className="mb-3 block">
            {incoming.length} incoming {incoming.length === 1 ? "request" : "requests"}
          </Meta>
          <div className="grid grid-cols-1 gap-2.5 min-[900px]:grid-cols-2">
            {incoming.map(({ row, profile }) => {
              const maker = makerFromProfile(profile);
              return (
                <div
                  key={row.id}
                  className="flex items-center gap-3 rounded-xl border border-tg-line bg-tg-card p-3.5"
                >
                  <button
                    type="button"
                    onClick={() => navigate(path(routes.publicProfile, { id: row.requester_id }))}
                  >
                    <Avatar maker={maker} size={46} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-[14.5px] font-semibold text-tg-ink">
                      {maker.name}
                    </div>
                    <Meta className="block truncate">wants to connect</Meta>
                  </div>
                  <button
                    type="button" aria-label="Ignore" onClick={() => onIgnore(row.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-tg-line text-tg-brown"
                  >
                    <XIcon size={16} />
                  </button>
                  <button
                    type="button" aria-label="Accept" onClick={() => onAccept(row.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-tg-blue text-white"
                  >
                    <Check size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <Meta className="mb-3 mt-8 block">
        {accepted.length} {accepted.length === 1 ? "connection" : "connections"}
      </Meta>

      {accepted.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-tg-line bg-tg-card px-6 py-16 text-center">
          <Meta>No connections yet. Swipe right on someone in Match to get started.</Meta>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2.5 min-[900px]:grid-cols-2">
          {accepted.map(({ otherId, profile }) => {
            const maker = makerFromProfile(profile);
            return (
              <li key={otherId}>
                <div className="flex items-center gap-3 rounded-xl border border-tg-line bg-tg-card p-3.5">
                  <button
                    type="button"
                    onClick={() => navigate(path(routes.publicProfile, { id: otherId }))}
                  >
                    <Avatar maker={maker} size={48} />
                  </button>
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => navigate(path(routes.publicProfile, { id: otherId }))}
                  >
                    <div className="truncate font-display text-[15px] font-semibold text-tg-ink">
                      {maker.name}
                    </div>
                    <Meta className="mt-0.5 block truncate capitalize">
                      {maker.role}
                      {profile?.location ? ` · ${profile.location}` : ""}
                    </Meta>
                  </button>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => navigate(path(routes.dmThread, { id: otherId }))}
                  >
                    <MessageCircle size={15} />
                    Message
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </WebPage>
  );
}
