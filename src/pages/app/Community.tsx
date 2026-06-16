import { useRef, useState } from "react";
import { Heart, MessageCircle, Repeat2, Send } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta, PhotoTile } from "@/components/brand/atoms";
import { community as seed, feed, makerById, me, type CommunityPost, type Maker } from "@/lib/fixtures";

/**
 * 39 · Community (G2, G3, G7, G8). A thoughts feed for designers — Designer and
 * Institutional accounts. The compose box keeps the keyboard open after posting:
 * clear the value, re-focus the input. Feed is suggested for you; pull to refresh.
 */
export default function Community() {
  const [list, setList] = useState<CommunityPost[]>(seed);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const post = () => {
    const t = text.trim();
    if (!t) return;
    setList((prev) => [
      { id: "p" + (prev.length + 1), maker: me.id, time: "now", text: t, likes: 0, replies: 0, reposts: 0 },
      ...prev,
    ]);
    setText("");
    // G8 — keep the keyboard open after posting.
    inputRef.current?.focus();
  };

  return (
    <MobileShell>
      <BackHeader title="Community" />

      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        {/* Compose */}
        <div className="flex gap-3 border-b border-tg-line px-[18px] py-3.5">
          <Avatar maker={me as Maker} size={38} />
          <div className="min-w-0 flex-1">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share a thought with the community…"
              rows={2}
              className="w-full resize-none bg-transparent font-body text-[14.5px] leading-snug text-tg-ink outline-none placeholder:text-tg-brown-soft"
            />
            <div className="mt-1 flex items-center justify-end">
              <button
                type="button"
                onClick={post}
                disabled={!text.trim()}
                className="inline-flex items-center gap-1.5 rounded-pill bg-tg-blue px-4 py-1.5 font-display text-[13px] font-semibold text-white disabled:opacity-40"
              >
                <Send size={14} />
                Post
              </button>
            </div>
          </div>
        </div>

        <RefreshHint />

        <ul>
          {list.map((p) => {
            const maker = makerById(p.maker);
            return (
              <li key={p.id} className="border-b border-tg-line-soft px-[18px] py-4">
                <div className="flex gap-3">
                  <Avatar maker={maker} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <NameRow maker={maker} size={14} />
                      <Meta>{p.time}</Meta>
                    </div>
                    <p className="mt-1 font-body text-[14.5px] leading-relaxed text-tg-ink">{p.text}</p>
                    {p.img && (
                      <div className="mt-3 overflow-hidden rounded-lg">
                        <PhotoTile width="100%" height={200} img={feed(p.img)} radius={16} />
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-7 text-tg-brown">
                      <Counter icon={<Heart size={16} />} count={p.likes} />
                      <Counter icon={<MessageCircle size={16} />} count={p.replies} />
                      <Counter icon={<Repeat2 size={16} />} count={p.reposts} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </MobileShell>
  );
}

function Counter({ icon, count }: { icon: React.ReactNode; count: number }) {
  return (
    <button type="button" className="flex items-center gap-1.5 text-tg-brown">
      {icon}
      <span className="font-mono text-[11.5px]">{count}</span>
    </button>
  );
}
