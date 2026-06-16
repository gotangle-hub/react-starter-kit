import { Smartphone, Laptop } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SettingsScaffold, ToggleRow } from "@/components/app/settings-kit";
import { TextField } from "@/components/app/fields";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

const sessions = [
  { icon: Smartphone, device: "iPhone 15 Pro", where: "Dubai, UAE", current: true },
  { icon: Laptop, device: "MacBook Air · Safari", where: "Dubai, UAE · 2 days ago", current: false },
];

export default function PasswordSecurity() {
  const navigate = useNavigate();
  return (
    <SettingsScaffold title="Password & security">
      <div className="flex flex-col gap-5">
        <TextField label="Current password" type="password" placeholder="••••••••" />
        <TextField label="New password" type="password" placeholder="••••••••" />
        <TextField label="Confirm new password" type="password" placeholder="••••••••" />

        <Button full size="lg" variant="primary" onClick={() => navigate(routes.settings)}>
          Update password
        </Button>

        <div className="mt-2 overflow-hidden rounded-lg border border-tg-line bg-tg-card">
          <ToggleRow
            label="Two-factor authentication"
            sub="Add an extra step when signing in on a new device."
          />
        </div>

        <div>
          <div className="mb-2 px-1 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
            Active sessions
          </div>
          <div className="overflow-hidden rounded-lg border border-tg-line bg-tg-card">
            {sessions.map((s, i) => (
              <div
                key={s.device}
                className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-tg-line-soft" : ""}`}
              >
                <s.icon size={19} className="text-tg-ink" />
                <span className="flex-1">
                  <span className="block font-display text-[14.5px] font-medium text-tg-ink">{s.device}</span>
                  <span className="block font-body text-[12.5px] text-tg-brown">{s.where}</span>
                </span>
                {s.current ? (
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-tg-brown-soft">
                    This device
                  </span>
                ) : (
                  <Button variant="outline" size="sm">
                    Sign out
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SettingsScaffold>
  );
}
