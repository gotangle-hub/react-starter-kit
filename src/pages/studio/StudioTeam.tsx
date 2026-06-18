import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMyProfile, makerFromProfile, type ProfileRow } from "@/services/profile";
import type { Maker } from "@/lib/profile-shape";

/**
 * 15 · Manage team. Invite + manage members; seats scale with the plan tier.
 * Backend not wired yet — render the real owner (you) and the invite form;
 * pending invites + extra members appear once a studio_members backend exists.
 */
const ROLE_TINT: Record<string, string> = {
  Owner: "var(--tg-blue)",
  Admin: "var(--tg-purple)",
  Editor: "var(--tg-terra)",
  Member: "var(--tg-brown-soft)",
};
const INVITE_ROLES = ["Admin", "Editor", "Member"];

export default function StudioTeam() {
  const [role, setRole] = useState("Member");
  const [me, setMe] = useState<ProfileRow | null>(null);

  useEffect(() => {
    let alive = true;
    getMyProfile().then((p) => { if (alive) setMe(p); });
    return () => { alive = false; };
  }, []);

  const studioName = me?.display_name ?? "Your studio";
  const owner: Maker | null = me ? (makerFromProfile(me) as Maker) : null;

  return (
    <MobileShell>
      <BackHeader title="Manage team" />
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-3 pb-10">
        {/* Invite card */}
        <div className="rounded-lg bg-tg-emph p-4 text-white">
          <div className="font-serif text-[19px] font-medium tracking-[-0.01em]">Invite someone to the studio.</div>
          <p className="my-2 font-body text-[12.5px] leading-snug text-white/70">
            They get a link to join {studioName} with the role you choose.
          </p>
          <div className="flex items-center gap-2.5 rounded-DEFAULT bg-white/12 px-3.5 py-3">
            <Mail size={16} className="text-white" />
            <input placeholder="name@email.com" className="min-w-0 flex-1 border-none bg-transparent p-0 font-mono text-[13.5px] text-white outline-none placeholder:text-white/60" />
          </div>
          <div className="mt-2.5 flex gap-1.5">
            {INVITE_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn("flex-1 rounded-md py-2 text-center font-display text-[12px] font-semibold transition-colors", role === r ? "bg-white text-tg-ink" : "bg-white/12 text-white")}
              >
                {r}
              </button>
            ))}
          </div>
          <Button full className="mt-3">Send invite</Button>
        </div>

        {/* Members */}
        <GroupLabel>Members</GroupLabel>
        {owner ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-3 py-2.5">
              <Avatar maker={owner} size={42} />
              <div className="min-w-0 flex-1">
                <NameRow maker={owner} size={14} />
                <Meta className="mt-0.5 block">{owner.role}</Meta>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-tg-stone2 px-2.5 py-1.5 font-display text-[12px] font-semibold text-tg-ink">
                <span className="h-[7px] w-[7px] rounded-pill" style={{ background: ROLE_TINT.Owner }} />
                Owner
              </span>
            </div>
          </div>
        ) : (
          <Meta className="block">Sign in to manage your team.</Meta>
        )}

        <Meta className="mt-6 block">
          Invitations and additional roles appear here once teammates accept.
        </Meta>
      </div>
    </MobileShell>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2.5 mt-6 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">{children}</div>;
}
