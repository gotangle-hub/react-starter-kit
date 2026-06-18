import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  checkUsernameAvailable,
  normalizeUsername,
  suggestUsernames,
  validateUsernameFormat,
} from "@/services/usernames";

/**
 * Live @username picker — debounced availability check, error messaging and
 * suggestions when the handle is taken. Used in every account-type's signup.
 * The parent is notified of the latest validated value + availability so it
 * can gate its Continue button.
 */
export function UsernamePicker({
  value,
  onChange,
  onValidityChange,
  label = "Username",
  baseSuggestion,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onValidityChange?: (state: { valid: boolean; available: boolean; checking: boolean; normalized: string }) => void;
  label?: string;
  baseSuggestion?: string;
  className?: string;
}) {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const formatError = useMemo(
    () => (value.length === 0 ? null : validateUsernameFormat(value)),
    [value],
  );
  const debounce = useRef<number | null>(null);

  useEffect(() => {
    if (debounce.current) window.clearTimeout(debounce.current);
    setSuggestions([]);
    if (formatError !== null || value.length === 0) {
      setChecking(false);
      setAvailable(null);
      onValidityChange?.({ valid: false, available: false, checking: false, normalized: normalizeUsername(value) });
      return;
    }
    setChecking(true);
    onValidityChange?.({ valid: false, available: false, checking: true, normalized: normalizeUsername(value) });
    debounce.current = window.setTimeout(async () => {
      const ok = await checkUsernameAvailable(value);
      setChecking(false);
      setAvailable(ok);
      if (!ok) {
        const base = baseSuggestion && baseSuggestion.length > 0 ? baseSuggestion : value;
        const sugg = await suggestUsernames(base, 5);
        setSuggestions(sugg);
      }
      onValidityChange?.({ valid: true, available: ok, checking: false, normalized: normalizeUsername(value) });
    }, 350);
    return () => { if (debounce.current) window.clearTimeout(debounce.current); };
  }, [value, formatError, baseSuggestion, onValidityChange]);

  const showStatus = value.length > 0;
  const status: "checking" | "ok" | "taken" | "format" | null = !showStatus
    ? null
    : formatError
      ? "format"
      : checking
        ? "checking"
        : available
          ? "ok"
          : available === false
            ? "taken"
            : null;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
        {label}
      </span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[14px] text-tg-brown">@</span>
        <input
          value={value}
          onChange={(e) => onChange(normalizeUsername(e.target.value))}
          placeholder="yourhandle"
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          maxLength={20}
          inputMode="text"
          className="w-full rounded-pill border border-tg-line bg-tg-card py-2.5 pl-7 pr-10 font-mono text-[14px] text-tg-ink outline-none placeholder:text-tg-brown-soft focus:border-tg-blue-accent"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {status === "checking" && <Loader2 size={16} className="animate-spin text-tg-brown-soft" />}
          {status === "ok" && <Check size={16} className="text-tg-blue-accent" />}
          {(status === "taken" || status === "format") && <X size={16} className="text-tg-terra" />}
        </span>
      </div>
      <div className="min-h-[16px] text-[11.5px]">
        {status === "format" && <span className="text-tg-terra">{formatError}</span>}
        {status === "taken" && <span className="text-tg-terra">That handle is taken.</span>}
        {status === "ok" && <span className="text-tg-brown-soft">Looks good.</span>}
      </div>
      {status === "taken" && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className="rounded-pill border border-tg-line bg-tg-card px-2.5 py-1 font-mono text-[12px] text-tg-ink hover:border-tg-blue-accent"
            >
              @{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
