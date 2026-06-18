import { useEffect, useState } from "react";
import { SettingsScaffold, ToggleRow } from "@/components/app/settings-kit";
import { supabase } from "@/integrations/supabase/client";

export default function NotificationSettings() {
  const [marketing, setMarketing] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }
      const { data, error } = await supabase.rpc("get_my_marketing_opt_in");
      if (!cancelled) {
        if (!error) setMarketing(Boolean(data));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateMarketing = async (next: boolean) => {
    setMarketing(next);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ marketing_opt_in: next })
      .eq("id", user.id);
    if (error) {
      console.warn("marketing toggle save failed", error);
      setMarketing(!next);
    }
  };

  return (
    <SettingsScaffold title="Notifications">
      <div className="flex flex-col gap-6">
        <div>
          <div className="mb-2 px-1 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
            Activity
          </div>
          <div className="overflow-hidden rounded-lg border border-tg-line bg-tg-card">
            <ToggleRow label="Likes" defaultOn />
            <ToggleRow label="Comments" defaultOn />
            <ToggleRow label="New connections" defaultOn />
            <ToggleRow label="Connection requests" defaultOn />
          </div>
        </div>

        <div>
          <div className="mb-2 px-1 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
            Collaborations & opportunities
          </div>
          <div className="overflow-hidden rounded-lg border border-tg-line bg-tg-card">
            <ToggleRow label="Collaboration updates" defaultOn />
            <ToggleRow label="Competition deadlines" defaultOn />
            <ToggleRow label="Messages" defaultOn />
          </div>
        </div>

        <div>
          <div className="mb-2 px-1 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
            Email from Tangle
          </div>
          <div className="overflow-hidden rounded-lg border border-tg-line bg-tg-card">
            <ToggleRow
              label="Product updates, tips & offers"
              sub="Occasional emails about new features and offers. Unsubscribe any time."
              checked={marketing}
              onChange={updateMarketing}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </SettingsScaffold>
  );
}
