import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Avatar } from "@/components/brand/avatar";
import { searchHandles } from "@/services/usernames";
import { makerFromProfile } from "@/services/profile";

export interface MentionInputHandle {
  focus: () => void;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * Input with an `@`-trigger autocomplete dropdown. Tapping a suggestion
 * replaces the partial token with `@handle ` and returns focus to the input
 * so the keyboard never dismisses (G8).
 */
export const MentionInput = forwardRef<MentionInputHandle, Props>(function MentionInput(
  { value, onChange, onSubmit, placeholder, className, ariaLabel },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [items, setItems] = useState<Array<{ id: string; username: string; display_name: string | null; avatar_path: string | null }>>([]);

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }), []);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const caret = el.selectionStart ?? value.length;
    const upto = value.slice(0, caret);
    const m = /(^|\s)@([a-z0-9_.]{0,20})$/i.exec(upto);
    if (m) setQuery(m[2].toLowerCase());
    else setQuery(null);
  }, [value]);

  useEffect(() => {
    if (query === null || query.length === 0) {
      setItems([]);
      return;
    }
    let alive = true;
    searchHandles(query, 6).then((rows) => { if (alive) setItems(rows); });
    return () => { alive = false; };
  }, [query]);

  const pick = (handle: string) => {
    const el = inputRef.current;
    if (!el) return;
    const caret = el.selectionStart ?? value.length;
    const upto = value.slice(0, caret);
    const after = value.slice(caret);
    const replaced = upto.replace(/(^|\s)@([a-z0-9_.]{0,20})$/i, (_full, pre) => `${pre}@${handle} `);
    const next = replaced + after;
    onChange(next);
    setQuery(null);
    requestAnimationFrame(() => {
      el.focus();
      const pos = replaced.length;
      try { el.setSelectionRange(pos, pos); } catch { /* ignore */ }
    });
  };

  return (
    <div className="relative flex-1 min-w-0">
      {query !== null && items.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 z-30 mb-2 max-h-56 overflow-y-auto rounded-lg border border-tg-line bg-tg-card shadow-card">
          {items.map((row) => {
            const m = makerFromProfile(row);
            return (
              <button
                key={row.id}
                type="button"
                // Prevent blurring the input on mousedown so the keyboard stays open (G8).
                onMouseDown={(e) => { e.preventDefault(); pick(row.username); }}
                onTouchStart={(e) => { e.preventDefault(); pick(row.username); }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-tg-stone2"
              >
                <Avatar maker={m} size={28} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-display text-[13px] font-semibold text-tg-ink">{row.display_name ?? row.username}</span>
                  <span className="truncate font-mono text-[11px] text-tg-brown-soft">@{row.username}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSubmit(); } }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoCapitalize="none"
        autoComplete="off"
        className={className}
      />
    </div>
  );
});
