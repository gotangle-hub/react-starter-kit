import { useRef, useState } from "react";
import { Heart, Send } from "lucide-react";
import { BottomSheet } from "@/components/app/bottom-sheet";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { comments as seed, makerById, me, type Comment } from "@/lib/fixtures";

/**
 * 25 · Comments (G8). Composing a comment keeps the keyboard open after sending —
 * we keep the input focused and only clear its value, never blur it.
 */
export default function CommentsSheet() {
  const [list, setList] = useState<Comment[]>(seed);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setList((prev) => [
      ...prev,
      { id: "c" + (prev.length + 1), maker: me.id, text: t, time: "now", likes: 0 },
    ]);
    setText("");
    // G8 — do NOT dismiss the keyboard: keep the input focused after send.
    inputRef.current?.focus();
  };

  return (
    <BottomSheet title={`${list.length} comments`} full>
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
          {list.map((c) => {
            const m = makerById(c.maker);
            return (
              <div key={c.id} className="flex gap-3 py-3">
                <Avatar maker={m} size={34} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <NameRow maker={m} size={13.5} />
                    <Meta>{c.time}</Meta>
                  </div>
                  <p className="mt-0.5 font-body text-[14px] leading-snug text-tg-ink">{c.text}</p>
                </div>
                <button type="button" className="flex flex-col items-center gap-0.5 text-tg-brown-soft">
                  <Heart size={15} />
                  <span className="font-mono text-[10px]">{c.likes}</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex flex-none items-center gap-2.5 border-t border-tg-line px-4 py-3 pb-6">
          <Avatar maker={me} size={32} />
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Add a comment…"
            className="min-w-0 flex-1 rounded-pill border border-tg-line bg-tg-card px-4 py-2.5 text-[14px] text-tg-ink outline-none placeholder:text-tg-brown-soft focus:border-tg-blue-accent"
          />
          <button
            type="button"
            onClick={send}
            disabled={!text.trim()}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-pill bg-tg-blue text-white disabled:opacity-40"
            aria-label="Send"
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
