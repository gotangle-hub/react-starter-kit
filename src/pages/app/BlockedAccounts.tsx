import { Ban } from "lucide-react";
import { SettingsScaffold } from "@/components/app/settings-kit";

/**
 * 65 · Blocked accounts. Empty by default — populated from a real `blocks`
 * table once it's added. No fixture names (G14).
 */
export default function BlockedAccounts() {
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
