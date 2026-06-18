import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Meta } from "@/components/brand/atoms";
import { Avatar } from "@/components/brand/avatar";
import { createCollaboration } from "@/services/collaborations";
import { searchHandles } from "@/services/usernames";
import { makerFromProfile } from "@/services/profile";

interface Picked {
  id: string;
  username: string;
  display_name: string | null;
  avatar_path: string | null;
}

interface Props {
  onClose: () => void;
  onCreated: (collabId: string) => void;
  initialTitle?: string;
  initialMembers?: Picked[];
}

/** Bottom sheet to create a new collaboration: title, brief, and @handle invites. */
export function CreateCollabSheet({ onClose, onCreated, initialTitle = "", initialMembers = [] }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [brief, setBrief] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Picked[]>([]);
  const [picked, setPicked] = useState<Picked[]>(initialMembers);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (v: string) => {
    setQuery(v);
    const clean = v.replace(/^@/, "").trim();
    if (!clean) { setResults([]); return; }
    const rows = await searchHandles(clean, 6);
    setResults(rows.filter((r) => !picked.some((p) => p.id === r.id)));
  };

  const add = (r: Picked) => {
    setPicked((p) => [...p, r]);
    setResults((rs) => rs.filter((x) => x.id !== r.id));
    setQuery("");
  };

  const remove = (id: string) => setPicked((p) => p.filter((x) => x.id !== id));

  const submit = async () => {
    if (!title.trim()) { setError("Add a title"); return; }
    setSubmitting(true);
    setError(null);
    try {
      const id = await createCollaboration(title.trim(), brief.trim(), picked.map((p) => p.id));
      onCreated(id);
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-[440px] rounded-t-2xl bg-tg-bg p-5 pb-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-[20px] font-medium tracking-[-0.01em] text-tg-ink">
            New collaboration
          </h2>
          <button type="button" onClick={onClose} className="text-tg-brown" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-lg border border-tg-line bg-tg-card px-3 py-2.5 text-[14px] text-tg-ink outline-none focus:border-tg-blue-accent"
        />
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Brief — what is this about?"
          rows={3}
          className="mt-2 w-full resize-none rounded-lg border border-tg-line bg-tg-card px-3 py-2.5 text-[14px] text-tg-ink outline-none focus:border-tg-blue-accent"
        />

        <div className="mt-3">
          <Meta className="mb-1.5 block">Invite by @handle</Meta>
          {picked.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {picked.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => remove(p.id)}
                  className="inline-flex items-center gap-1 rounded-pill bg-tg-stone2 px-2.5 py-1 font-mono text-[11px] text-tg-ink"
                >
                  @{p.username} <X size={11} />
                </button>
              ))}
            </div>
          )}
          <input
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="@handle"
            className="w-full rounded-lg border border-tg-line bg-tg-card px-3 py-2.5 text-[14px] text-tg-ink outline-none focus:border-tg-blue-accent"
          />
          {results.length > 0 && (
            <div className="mt-1.5 overflow-hidden rounded-lg border border-tg-line bg-tg-card">
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => add(r)}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-tg-stone2"
                >
                  <Avatar maker={makerFromProfile(r)} size={28} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[13px] font-semibold text-tg-ink">
                      {r.display_name || `@${r.username}`}
                    </span>
                    <span className="font-mono text-[10.5px] text-tg-brown-soft">@{r.username}</span>
                  </span>
                  <Plus size={14} className="text-tg-blue-accent" />
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="mt-2 font-mono text-[11px] text-tg-terra">{error}</p>}

        <Button full className="mt-4" onClick={submit} disabled={submitting || !title.trim()}>
          {submitting ? "Creating…" : "Create collaboration"}
        </Button>
      </div>
    </div>
  );
}
