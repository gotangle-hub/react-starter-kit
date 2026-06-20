import { useEffect, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search as SearchIcon, X } from "lucide-react";

import { Avatar } from "@/components/brand/avatar";
import { Meta } from "@/components/brand/atoms";
import { semanticSearch, type SearchMatch } from "@/services/search";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Tiny module-level store — avoids threading a provider through every page  */
/* -------------------------------------------------------------------------- */

type Flyout = "search" | "notifications" | null;
let current: Flyout = null;
const listeners = new Set<() => void>();

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function getSnapshot() {
  return current;
}
function setFlyout(next: Flyout) {
  current = next;
  listeners.forEach((l) => l());
}

export function useWebFlyout() {
  const open = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    open,
    openFlyout: (f: Exclude<Flyout, null>) => setFlyout(current === f ? null : f),
    closeFlyout: () => setFlyout(null),
  };
}

/* -------------------------------------------------------------------------- */
/*  Mount point — rendered once inside WebPage                                */
/* -------------------------------------------------------------------------- */

export function WebFlyouts() {
  const { open, closeFlyout } = useWebFlyout();

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeFlyout();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeFlyout]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop — sits over content but not the sidebar */}
      <div
        className="fixed inset-0 z-30 bg-black/25"
        onClick={closeFlyout}
        aria-hidden
      />
      {/* Panel docks next to sidebar (which is 76px tablet / 244px desktop) */}
      <aside
        className={cn(
          "fixed inset-y-0 z-40 flex w-[400px] flex-col border-r border-tg-line bg-tg-bg shadow-2xl",
          // Tablet (76px sidebar) and desktop (244px) — match sidebar widths
          "left-[76px] min-[1100px]:left-[244px]",
        )}
        role="dialog"
        aria-label={open === "search" ? "Search" : "Notifications"}
      >
        <header className="flex items-center justify-between border-b border-tg-line px-5 py-4">
          <h2 className="font-serif text-[22px] tracking-[-0.01em] text-tg-ink">
            {open === "search" ? "Search" : "Notifications"}
          </h2>
          <button
            type="button"
            onClick={closeFlyout}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-tg-brown hover:bg-tg-stone2"
          >
            <X size={16} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {open === "search" ? <SearchPanel /> : <NotificationsPanel />}
        </div>
      </aside>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Search panel — text + people via semanticSearch                           */
/* -------------------------------------------------------------------------- */

function SearchPanel() {
  const navigate = useNavigate();
  const { closeFlyout } = useWebFlyout();
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"text" | "people">("text");
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      return;
    }
    let alive = true;
    setBusy(true);
    const id = setTimeout(async () => {
      const r = await semanticSearch({ mode, query: term, limit: 20 });
      if (alive) {
        setResults(r);
        setBusy(false);
      }
    }, 220);
    return () => {
      alive = false;
      clearTimeout(id);
      setBusy(false);
    };
  }, [q, mode]);

  function pick(m: SearchMatch) {
    closeFlyout();
    if (mode === "people") navigate(`/u/${m.ref_id}`);
    else navigate(`/project/${m.ref_id}`);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-tg-line px-5 py-4">
        <div className="flex items-center gap-2 rounded-full border border-tg-line bg-tg-card px-3.5 py-2">
          <SearchIcon size={16} className="text-tg-brown" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search work, makers, ideas…"
            className="w-full bg-transparent text-[14.5px] text-tg-ink outline-none placeholder:text-tg-brown-soft"
          />
        </div>
        <div className="mt-3 flex gap-1.5">
          <ModeChip on={mode === "text"} onClick={() => setMode("text")}>
            Projects
          </ModeChip>
          <ModeChip on={mode === "people"} onClick={() => setMode("people")}>
            People
          </ModeChip>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {!q.trim() ? (
          <div className="px-4 py-10 text-center">
            <Meta>Search understands meaning, not just keywords.</Meta>
          </div>
        ) : busy && results.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Meta>Searching…</Meta>
          </div>
        ) : results.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Meta>No results for "{q}".</Meta>
          </div>
        ) : (
          <ul>
            {results.map((m) => {
              const meta = (m.metadata ?? {}) as Record<string, unknown>;
              const title = (meta.title as string) ?? (meta.display_name as string) ?? m.content?.slice(0, 60) ?? "Result";
              const sub = (meta.author_name as string) ?? (meta.location as string) ?? "";
              return (
                <li key={`${mode}-${m.ref_id}`}>
                  <button
                    type="button"
                    onClick={() => pick(m)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-tg-stone2"
                  >
                    <span className="h-10 w-10 flex-none rounded-lg bg-tg-stone2" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[14px] font-semibold text-tg-ink">
                        {title}
                      </span>
                      {sub && <Meta className="mt-0.5 block truncate">{sub}</Meta>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function ModeChip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 font-display text-[12.5px] font-semibold transition-colors",
        on ? "bg-tg-blue text-white" : "border border-tg-line text-tg-ink",
      )}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Notifications panel                                                       */
/* -------------------------------------------------------------------------- */

function NotificationsPanel() {
  const { items, loading } = useNotifications();

  if (loading) {
    return (
      <div className="px-5 py-10 text-center">
        <Meta>Loading…</Meta>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center px-5 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tg-stone2 text-tg-brown">
          <Bell size={20} />
        </span>
        <p className="mt-3 font-display text-[14.5px] font-semibold text-tg-ink">
          You're all caught up
        </p>
        <Meta className="mt-1 block max-w-[260px]">
          Likes, comments, connections and collaboration updates land here.
        </Meta>
      </div>
    );
  }

  return (
    <ul className="px-2 py-2">
      {items.map((n) => (
        <li key={n.id}>
          <div className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-tg-stone2">
            <span className="h-9 w-9 flex-none rounded-full bg-tg-stone2" />
            <div className="min-w-0 flex-1">
              <p className="font-body text-[13.5px] leading-snug text-tg-ink">
                {n.body ?? n.kind}
              </p>
              <Meta className="mt-1 block">
                {new Date(n.created_at).toLocaleString()}
              </Meta>
            </div>
            {!n.read_at && <span className="mt-2 h-2 w-2 flex-none rounded-full bg-tg-blue" />}
          </div>
        </li>
      ))}
    </ul>
  );
}

// Re-export Avatar to keep tree-shaken bundles consistent (avoids unused import)
void Avatar;
