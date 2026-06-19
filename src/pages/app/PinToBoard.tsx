import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Plus, Bookmark, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import { BottomSheet } from "@/components/app/bottom-sheet";
import { Meta } from "@/components/brand/atoms";
import {
  listMyBoards,
  createBoard,
  addPostToBoard,
  type Board,
} from "@/services/boards";

/**
 * 26 · Pin to a board. The current post id comes from `location.state.postId`
 * or `?postId=`. Picking a board upserts a `board_items` row; tapping
 * "Create a new pin up" creates one and immediately pins to it.
 */
export default function PinToBoard() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { postId?: string } };
  const [params] = useSearchParams();
  const postId = location.state?.postId ?? params.get("postId") ?? null;

  const [boards, setBoards] = useState<Board[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    listMyBoards().then(setBoards);
  }, []);

  async function pinTo(b: Board) {
    if (!postId) {
      toast.error("No work selected to pin");
      return;
    }
    setBusy(b.id);
    const ok = await addPostToBoard(b.id, postId);
    setBusy(null);
    if (ok) {
      toast.success(`Pinned to ${b.title}`);
      navigate(-1);
    } else {
      toast.error("Couldn't pin — try again");
    }
  }

  async function handleCreate() {
    const title = newTitle.trim();
    if (!title) return;
    setBusy("__new");
    const board = await createBoard({ title });
    if (!board) {
      setBusy(null);
      toast.error("Couldn't create board");
      return;
    }
    if (postId) {
      await addPostToBoard(board.id, postId);
      toast.success(`Pinned to ${board.title}`);
      navigate(-1);
    } else {
      toast.success(`Created ${board.title}`);
      setBoards((prev) => [board, ...(prev ?? [])]);
      setCreating(false);
      setNewTitle("");
    }
    setBusy(null);
  }

  return (
    <BottomSheet title="Pin to a board">
      <div className="px-5 pb-6 pt-1">
        {creating ? (
          <div className="rounded-lg border border-tg-line p-3">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Board name"
              className="w-full bg-transparent font-display text-[14.5px] font-semibold text-tg-ink outline-none placeholder:text-tg-brown"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setNewTitle("");
                }}
                className="font-display text-[13px] font-semibold text-tg-brown"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newTitle.trim() || busy === "__new"}
                onClick={handleCreate}
                className="font-display text-[13px] font-semibold text-tg-blue-accent disabled:opacity-50"
              >
                {busy === "__new" ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex w-full items-center gap-3 rounded-lg border border-dashed border-tg-line p-3 text-left"
          >
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-DEFAULT bg-tg-stone2">
              <Plus size={20} className="text-tg-blue-accent" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-[14.5px] font-semibold text-tg-ink">Create a new pin up</div>
              <Meta className="mt-0.5 block">Start a fresh board for this reference</Meta>
            </div>
          </button>
        )}

        <div className="mb-2 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
          Your pin ups
        </div>

        {boards && boards.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {boards.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  disabled={busy === b.id}
                  onClick={() => pinTo(b)}
                  className="flex w-full items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-3 text-left disabled:opacity-60"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-DEFAULT bg-tg-stone2 text-tg-brown">
                    <Bookmark size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-display text-[14.5px] font-semibold text-tg-ink">
                        {b.title}
                      </span>
                      {b.is_private && <Lock size={11} className="text-tg-brown" />}
                    </div>
                    <Meta className="block">{b.item_count ?? 0} pins</Meta>
                  </div>
                  {busy === b.id && <Check size={16} className="text-tg-blue-accent" />}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-tg-line bg-tg-card px-4 py-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
              <Bookmark size={20} />
            </span>
            <Meta className="block max-w-[240px]">
              You don&rsquo;t have any pin ups yet. Create one above to pin this reference.
            </Meta>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
