import { useEffect, useRef, useState } from "react";
import { Apple, MapPin, Search } from "lucide-react";
import { cities } from "@/lib/fixtures";
import { cn } from "@/lib/utils";

/** Labelled text input matching the editorial field style. */
export function TextField({
  label,
  icon,
  mono = false,
  ...props
}: {
  label: string;
  icon?: React.ReactNode;
  mono?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
        {label}
      </span>
      <span className="flex items-center gap-2.5 rounded-DEFAULT border border-tg-line bg-tg-card px-3.5 py-3 focus-within:border-tg-blue-accent">
        {icon && <span className="text-tg-brown-soft">{icon}</span>}
        <input
          {...props}
          className={cn(
            "min-w-0 flex-1 border-none bg-transparent p-0 text-[14.5px] text-tg-ink outline-none placeholder:text-tg-brown-soft",
            mono && "font-mono",
          )}
        />
      </span>
    </label>
  );
}

/** Predictive city picker (G13-style type-ahead, also used at signup). */
export function LocationField({
  label = "Location",
  defaultValue = "",
  placeholder = "Search a city…",
}: {
  label?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [val, setVal] = useState(defaultValue);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const matches = (
    q ? cities.filter((c) => c.toLowerCase().includes(q.toLowerCase())) : cities
  ).slice(0, 6);

  return (
    <div ref={ref} className="relative">
      <span className="mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
        {label}
      </span>
      <span
        className={cn(
          "flex items-center gap-2.5 rounded-DEFAULT border bg-tg-card px-3.5 py-3",
          open ? "border-tg-blue-accent" : "border-tg-line",
        )}
      >
        <MapPin size={17} className={open ? "text-tg-blue-accent" : "text-tg-brown-soft"} />
        <input
          value={open ? q : val}
          placeholder={val || placeholder}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQ("");
          }}
          className="min-w-0 flex-1 border-none bg-transparent p-0 text-[14.5px] text-tg-ink outline-none placeholder:text-tg-brown-soft"
        />
        <Search size={15} className="text-tg-brown-soft" />
      </span>
      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 overflow-hidden rounded-lg border border-tg-line bg-tg-card shadow-float">
          {matches.length ? (
            matches.map((c, i) => (
              <button
                key={c}
                type="button"
                onMouseDown={() => {
                  setVal(c);
                  setQ("");
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3.5 py-3 text-left hover:bg-tg-stone2",
                  i > 0 && "border-t border-tg-line-soft",
                )}
              >
                <MapPin size={15} className="text-tg-blue-accent" />
                <span className="text-[13.5px] font-medium text-tg-ink">{c}</span>
              </button>
            ))
          ) : (
            <div className="px-3.5 py-3 text-[13px] text-tg-brown-soft">
              No matches — keep typing
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Apple / Google continue button. */
export function SocialButton({ brand }: { brand: "apple" | "google" }) {
  const isApple = brand === "apple";
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-center gap-2.5 rounded-DEFAULT py-3 text-[14.5px] font-semibold transition-all duration-fast active:scale-[0.99]",
        isApple
          ? "bg-tg-inv text-tg-inv-text"
          : "border-[1.5px] border-tg-line bg-tg-card text-tg-ink",
      )}
    >
      {isApple ? (
        <Apple size={17} fill="currentColor" strokeWidth={0} />
      ) : (
        <span aria-hidden className="font-display text-[15px] font-bold">
          G
        </span>
      )}
      Continue with {isApple ? "Apple" : "Google"}
    </button>
  );
}
