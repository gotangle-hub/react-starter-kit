import { useState } from "react";
import { Link2, Mail, Check } from "lucide-react";
import { BottomSheet } from "@/components/app/bottom-sheet";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";

/**
 * 50 · Invite — bottom sheet to invite someone to connect or to a
 * collaboration / competition. Share a link, or invite by email.
 */
export default function InviteSheet() {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/invite` : "/invite";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
    }
  };

  return (
    <BottomSheet title="Invite">
      <div className="px-5 pb-7 pt-1">
        {/* Share link */}
        <button
          type="button"
          onClick={copy}
          className="flex w-full items-center gap-3 rounded-lg border border-tg-line bg-tg-card px-4 py-3.5 text-left"
        >
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-pill bg-tg-stone2 text-tg-blue-accent">
            <Link2 size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <span className="block font-display text-[14.5px] font-semibold text-tg-ink">
              Share an invite link
            </span>
            <Meta className="mt-0.5 block truncate">{inviteUrl}</Meta>
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
          <Button size="sm" disabled={!email.trim()}>Send</Button>
        </div>

        <Meta className="mt-6 block">
          When friends join from your invite, they appear in your network.
        </Meta>
      </div>
    </BottomSheet>
  );
}
