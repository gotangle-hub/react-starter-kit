import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme, type ThemePreference } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: SunMoon },
];

/**
 * Tri-state theme control (G15): Light · Dark · System.
 * System is the default and live-follows the device appearance.
 */
export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className="inline-flex items-center gap-1 rounded-xl border border-tg-line bg-tg-stone2 p-1"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPreference(value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-fast",
              active
                ? "bg-tg-card text-tg-ink shadow-card"
                : "text-tg-brown hover:text-tg-ink",
            )}
          >
            <Icon size={15} strokeWidth={1.9} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
