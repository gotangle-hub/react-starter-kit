import { useState } from "react";
import { ChevronDown, Clock, Mail } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { makers, studio } from "@/lib/fixtures";
import { cn } from "@/lib/utils";

/** 15 · Manage team. Invite + manage members; seats scale with the plan tier. */
const MEMBERS = [
  { id: "studio", role: "Owner" },
  { id: "lina", role: "Admin" },
  { id: "mona", role: "Editor" },
  { id: "noor", role: "Member" },
  { id: "yuki", role: "Member" },
];
const PENDING = [
  { email: "rana@oblique.studio", role: "Editor" },
  { email: "theo@oblique.studio", role: "Member" },
];
const ROLE_TINT: Record<string, string> = {
  Owner: "var(--tg-blue)",
  Admin: "var(--tg-purple)",
  Editor: "var(--tg-terra)",
  Member: "var(--tg-brown-soft)",
};
const INVITE_ROLES = ["Admin", "Editor", "Member"];

export default function StudioTeam() {
  const [role, setRole] = useState("Member");
  return (
    <MobileShell>
      <BackHeader
        title="Manage team"
        right={<span className="font-mono text-[11px] font-semibold text-tg-brown">{studio.seatsUsed} / {studio.seatsTotal} seats</span>}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-3 pb-10">
        {/* Invite card */}
        <div className="rounded-lg bg-tg-emph p-4 text-white">
          <div className="font-serif text-[19px] font-medium tracking-[-0.01em]">Invite someone to the studio.</div>
          <p className="my-2 font-body text-[12.5px] leading-snug text-white/70">
            They get a link to join {studio.name} with the role you choose.
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
          <button type="button" className="mt-3 w-full rounded-DEFAULT bg-tg-yellow py-3 text-center font-display text-[14px] font-semibold text-tg-ink dark:text-white">
            Send invite
          </button>
        </div>

        {/* Pending */}
        <GroupLabel>Pending invites</GroupLabel>
        <div className="flex flex-col gap-2.5">
          {PENDING.map((p) => (
            <div key={p.email} className="flex items-center gap-3 rounded-DEFAULT border border-dashed border-tg-line bg-tg-card px-3.5 py-3">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-pill bg-tg-stone2">
                <Clock size={17} className="text-tg-brown-soft" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-mono text-[13.5px] font-medium text-tg-ink">{p.email}</div>
                <Meta className="mt-0.5 block">Invited · {p.role}</Meta>
              </div>
              <button type="button" className="font-display text-[12px] font-semibold text-tg-terra">Cancel</button>
            </div>
          ))}
        </div>

        {/* Members */}
        <GroupLabel>Members · {studio.seatsUsed}</GroupLabel>
        <div className="flex flex-col">
          {MEMBERS.map(({ id, role: r }) => {
            const m = makers.find((x) => x.id === id) ?? makers[0];
            return (
              <div key={id} className="flex items-center gap-3 py-2.5">
                <Avatar maker={m} size={42} />
                <div className="min-w-0 flex-1">
                  <NameRow maker={m} size={14} />
                  <Meta className="mt-0.5 block">{m.role}</Meta>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-tg-stone2 px-2.5 py-1.5 font-display text-[12px] font-semibold text-tg-ink">
                  <span className="h-[7px] w-[7px] rounded-pill" style={{ background: ROLE_TINT[r] }} />
                  {r}
                  {r !== "Owner" && <ChevronDown size={13} className="text-tg-brown-soft" />}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2.5 mt-6 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">{children}</div>;
}
