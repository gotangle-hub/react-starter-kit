import { useNavigate } from "react-router-dom";
import { MessageCircle, Link2 } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Avatar } from "@/components/brand/avatar";
import { me, makerById } from "@/lib/fixtures";
import { routes, path } from "@/lib/routes";

/**
 * 18 · It's a match — you CONNECTED. The accent here is the SAME blue in BOTH
 * light and dark (it never swaps), so the panel is built on a fixed #0107FF.
 */
export default function MutualMatch() {
  const navigate = useNavigate();
  const them = makerById("mona");

  return (
    <MobileShell contentClassName="p-0">
      <div className="flex min-h-full flex-col" style={{ background: "#0107FF" }}>
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/75">
            You both said yes
          </span>
          <h1 className="mt-3.5 font-serif text-[48px] font-medium leading-[0.98] tracking-[-0.03em] text-white">
            You&rsquo;re connected
            <span style={{ color: "#F4D738" }}>.</span>
          </h1>

          {/* Paired avatars, linked */}
          <div className="my-9 flex items-center">
            <span className="z-[2] -mr-3.5">
              <Avatar maker={me} size={92} ring />
            </span>
            <span
              className="relative z-[3] flex h-10 w-10 items-center justify-center rounded-pill"
              style={{ background: "#F4D738" }}
            >
              <Link2 size={19} color="#161514" strokeWidth={2.5} />
            </span>
            <span className="z-[2] -ml-3.5">
              <Avatar maker={them} size={92} ring />
            </span>
          </div>

          <p className="max-w-[280px] font-body text-[15px] leading-[1.5] text-white/80">
            You and <span className="font-semibold text-white">{them.name}</span> can now message
            and build something together.
          </p>
        </div>

        <div className="flex flex-col gap-3 px-[22px] pb-9 pt-4">
          <button
            type="button"
            onClick={() => navigate(path(routes.dmThread, { id: them.id }))}
            className="flex h-[52px] items-center justify-center gap-2 rounded-lg bg-white font-display text-[15px] font-semibold text-tg-ink"
          >
            <MessageCircle size={18} color="#161514" />
            Open chat
          </button>
          <button
            type="button"
            onClick={() => navigate(path(routes.publicProfile, { id: them.id }))}
            className="flex h-[52px] items-center justify-center rounded-lg border border-white/35 font-display text-[15px] font-semibold text-white"
          >
            View profile
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
