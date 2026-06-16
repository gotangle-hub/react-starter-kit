import { useState } from "react";
import { Link2, Mail, Check } from "lucide-react";
import { BottomSheet } from "@/components/app/bottom-sheet";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { makers } from "@/lib/fixtures";

/**
 * 50 · Invite — a bottom sheet to invite someone to connect or to a
 * collaboration / competition. Share a link, invite by email, or invite recents.
 */

export default function InviteSheet() {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [invited, setInvited] = useState<Record<string, boolean>>({});
  const recents = makers.slice(0, 4);

  return (
    <BottomSheet title="Invite">
      <div className="px-5 pb-7 pt-1">
        {/* Share link */}
        <button
          type="button"
          onClick={() => setCopied(true)}
          className="flex w-full items-center gap-3 rounded-lg border border-tg-line bg-tg-card px-4 py-3.5 text-left"
        >
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-pill bg-tg-stone2 text-tg-blue-accent">
            <Link2 size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <span className="block font-display text-[14.5px] font-semibold text-tg-ink">
              Share an invite link
            </span>
            <Meta className="mt-0.5 block truncate">gotangle.app/invite/muna</Meta>
          </div>
          <span className="flex-none font-display text-[12.5px] font-semibold text-tg-blue-accent">
            {copied ? (
              <span className="inline-flex items-center gap-1">
                <Check size={14} /> Copied
              </span>
            ) : (
              "Copy"
            )}
          </span>
        </button>

        {/* Invite by email */}
        <div className="mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
          Invite by email
        </div>
        <div className="mt-2.5 flex items-center gap-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-pill border border-tg-line bg-tg-card px-3.5 py-2.5 focus-within:border-tg-blue-accent">
            <Mail size={16} className="flex-none text-tg-brown" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@studio.com"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-tg-ink outline-none placeholder:text-tg-brown-soft"
            />
          </div>
          <Button size="sm" disabled={!email.trim()}>
            Send
          </Button>
        </div>

        {/* Invite recent people */}
        <div className="mt-6 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
          Recent people
        </div>
        <div className="mt-2 flex flex-col">
          {recents.map((m) => {
            const on = invited[m.id];
            return (
              <div key={m.id} className="flex items-center gap-3 py-2.5">
                <Avatar maker={m} size={40} />
                <div className="min-w-0 flex-1">
                  <NameRow maker={m} size={14} />
                  <Meta className="mt-0.5 block">
                    {m.role} · {m.city}
                  </Meta>
                </div>
                <Button
                  variant={on ? "outline" : "outlineAccent"}
                  size="sm"
                  onClick={() => setInvited((s) => ({ ...s, [m.id]: !s[m.id] }))}
                >
                  {on ? (
                    <span className="inline-flex items-center gap-1">
                      <Check size={14} /> Invited
                    </span>
                  ) : (
                    "Invite"
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
