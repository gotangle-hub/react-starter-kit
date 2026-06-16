import { Ban } from "lucide-react";
import { SettingsScaffold } from "@/components/app/settings-kit";
import { Avatar } from "@/components/brand/avatar";
import { Button } from "@/components/ui/button";
import { makers } from "@/lib/fixtures";

export default function BlockedAccounts() {
  const blocked = makers.slice(0, 2);

  return (
    <SettingsScaffold title="Blocked accounts">
      {blocked.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
            <Ban size={24} />
          </span>
          <h2 className="font-serif text-[20px] font-medium text-tg-ink">No blocked accounts</h2>
          <p className="mt-2 max-w-[260px] font-body text-[14px] leading-relaxed text-tg-brown">
            People you block won't be able to find your profile, message you or see your work. Anyone you block will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-tg-line bg-tg-card">
          {blocked.map((m, i) => (
            <div
              key={m.id}
              className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-tg-line-soft" : ""}`}
            >
              <Avatar maker={m} size={40} />
              <span className="flex-1">
                <span className="block font-display text-[14.5px] font-medium text-tg-ink">{m.name}</span>
                <span className="block font-body text-[12.5px] text-tg-brown">{m.role}</span>
              </span>
              <Button variant="outline" size="sm">
                Unblock
              </Button>
            </div>
          ))}
        </div>
      )}
    </SettingsScaffold>
  );
}
