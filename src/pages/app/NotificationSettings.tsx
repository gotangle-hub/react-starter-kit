import { SettingsScaffold, ToggleRow } from "@/components/app/settings-kit";

export default function NotificationSettings() {
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
      </div>
    </SettingsScaffold>
  );
}
