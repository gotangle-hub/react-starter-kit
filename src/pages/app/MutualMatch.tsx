import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MessageCircle, Link2 } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Avatar } from "@/components/brand/avatar";
import { supabase } from "@/integrations/supabase/client";
import { getProfileById, makerFromProfile, type ProfileRow } from "@/services/profile";
import { routes, path } from "@/lib/routes";

/**
 * 18 · It's a match — you CONNECTED. Accent blue is the SAME #0107FF in BOTH
 * light and dark (it never swaps). Triggered by a real mutual accept; the other
 * user is resolved from ?id=<uuid> on the URL.
 */
export default function MutualMatch() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const otherId = params.get("id");
  const [me, setMe] = useState<ProfileRow | null>(null);
  const [them, setThem] = useState<ProfileRow | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const [mine, theirs] = await Promise.all([
        user ? getProfileById(user.id) : Promise.resolve(null),
        otherId ? getProfileById(otherId) : Promise.resolve(null),
      ]);
      setMe(mine);
      setThem(theirs);
    })();
  }, [otherId]);

  const myMaker = makerFromProfile(me);
  const theirMaker = makerFromProfile(them);
  const theirName = them?.display_name || "Your new connection";

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

          <div className="my-9 flex items-center">
            <span className="z-[2] -mr-3.5">
              <Avatar maker={myMaker} size={92} ring />
            </span>
            <span
              className="relative z-[3] flex h-10 w-10 items-center justify-center rounded-pill"
              style={{ background: "#F4D738" }}
            >
              <Link2 size={19} color="#161514" strokeWidth={2.5} />
            </span>
            <span className="z-[2] -ml-3.5">
              <Avatar maker={theirMaker} size={92} ring />
            </span>
          </div>

          <p className="max-w-[280px] font-body text-[15px] leading-[1.5] text-white/80">
            You and <span className="font-semibold text-white">{theirName}</span> can now message
            and build something together.
          </p>
        </div>

        <div className="flex flex-col gap-3 px-[22px] pb-9 pt-4">
          <button
            type="button"
            disabled={!otherId}
            onClick={() => otherId && navigate(path(routes.dmThread, { id: otherId }))}
            className="flex h-[52px] items-center justify-center gap-2 rounded-lg bg-white font-display text-[15px] font-semibold text-tg-ink disabled:opacity-50"
          >
            <MessageCircle size={18} color="#161514" />
            Open chat
          </button>
          <button
            type="button"
            disabled={!otherId}
            onClick={() => otherId && navigate(path(routes.publicProfile, { id: otherId }))}
            className="flex h-[52px] items-center justify-center rounded-lg border border-white/35 font-display text-[15px] font-semibold text-white disabled:opacity-50"
          >
            View profile
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
