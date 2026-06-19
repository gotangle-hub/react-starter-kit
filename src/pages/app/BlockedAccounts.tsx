import { useEffect, useState, useCallback } from "react";
import { Ban } from "lucide-react";
import { toast } from "sonner";
import { SettingsScaffold } from "@/components/app/settings-kit";
import { listMyBlocks, unblockUser } from "@/services/blocks";
import { getProfilesByIds } from "@/services/profile";
import type { ProfileRow } from "@/services/profile";

interface Row {
  id: string;
  blocked_id: string;
  profile: ProfileRow | null;
}

/** 65 · Blocked accounts. Lists rows from `blocks` and lets users unblock. */
export default function BlockedAccounts() {
  const [rows, setRows] = useState<Row[] | null>(null);

  const load = useCallback(async () => {
    const blocks = await listMyBlocks();
    const profiles = await getProfilesByIds(blocks.map((b) => b.blocked_id));
    setRows(
      blocks.map((b) => ({ id: b.id, blocked_id: b.blocked_id, profile: profiles.get(b.blocked_id) ?? null })),
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onUnblock = async (otherId: string) => {
    try {
      await unblockUser(otherId);
      toast.success("Unblocked");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not unblock");
    }
  };

  if (rows && rows.length > 0) {
    return (
      <SettingsScaffold title="Blocked accounts">
        <div className="divide-y divide-tg-line">
          {rows.map((r) => {
            const name = r.profile?.display_name || r.profile?.username || "Member";
            const handle = r.profile?.username ? `@${r.profile.username}` : null;
            return (
              <div key={r.id} className="flex items-center justify-between px-5 py-4">
                <div className="min-w-0">
                  <div className="truncate font-body text-[15px] text-tg-ink">{name}</div>
                  {handle && (
                    <div className="truncate font-body text-[13px] text-tg-brown">{handle}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onUnblock(r.blocked_id)}
                  className="rounded-pill border border-tg-line px-3 py-1.5 font-body text-[13px] text-tg-ink"
                >
                  Unblock
                </button>
              </div>
            );
          })}
        </div>
      </SettingsScaffold>
    );
  }

  return (
    <SettingsScaffold title="Blocked accounts">
      <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
          <Ban size={24} />
        </span>
        <h2 className="font-serif text-[20px] font-medium text-tg-ink">No blocked accounts</h2>
        <p className="mt-2 max-w-[260px] font-body text-[14px] leading-relaxed text-tg-brown">
          People you block won&rsquo;t be able to find your profile, message you or see your work. Anyone you block will appear here.
        </p>
      </div>
    </SettingsScaffold>
  );
}
