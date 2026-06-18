import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Send, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader, RefreshHint } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { getMyProfile, makerFromProfile, type ProfileRow } from "@/services/profile";
import type { Maker } from "@/lib/profile-shape";

/**
 * 39 · Community (G2, G3, G7, G8). A thoughts feed for Designer + Institutional
 * accounts. The compose box keeps the keyboard open after posting (G8).
 *
 * Backend for community posts isn't wired yet — the surface is real (compose +
 * empty state); when the table lands the list will populate from it.
 */
export default function Community() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [me, setMe] = useState<Maker | null>(null);
  const [text, setText] = useState("");
  const [list, setList] = useState<Array<{ id: string; text: string; time: string }>>([]);

  useEffect(() => {
    let alive = true;
    getMyProfile().then((p) => {
      if (alive) setMe(p ? (makerFromProfile(p as ProfileRow) as Maker) : null);
    });
    return () => { alive = false; };
  }, []);

  const post = () => {
    const t = text.trim();
    if (!t) return;
    // Optimistic local insert — replaced by the community_posts table once wired.
    setList((prev) => [{ id: `local-${Date.now()}`, text: t, time: "now" }, ...prev]);
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
          {me ? (
            <Avatar maker={me} size={38} />
          ) : (
            <span className="inline-block h-[38px] w-[38px] rounded-pill bg-tg-stone2" aria-hidden />
          )}
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
                onMouseDown={(e) => e.preventDefault()}
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

        {list.length === 0 ? (
          <div className="mt-12 flex flex-col items-center px-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tg-stone2 text-tg-brown">
              <Sparkles size={22} />
            </span>
            <h2 className="mt-4 font-serif text-[20px] font-medium tracking-[-0.01em] text-tg-ink">The community is quiet</h2>
            <Meta className="mt-1.5 block max-w-[280px]">Designers&rsquo; thoughts, questions and notes from the studio appear here. Be the first.</Meta>
          </div>
        ) : (
          <ul>
            {list.map((p) => (
              <li key={p.id} className="border-b border-tg-line-soft px-[18px] py-4">
                <div className="flex gap-3">
                  {me && <Avatar maker={me} size={40} />}
                  <div className="min-w-0 flex-1">
                    {me && (
                      <div className="flex items-center gap-2">
                        <NameRow maker={me} size={14} />
                        <Meta>{p.time}</Meta>
                      </div>
                    )}
                    <p className="mt-1 font-body text-[14.5px] leading-relaxed text-tg-ink">{p.text}</p>
                    <div className="mt-3 flex items-center gap-7 text-tg-brown">
                      <Counter icon={<Heart size={16} />} count={0} />
                      <Counter icon={<MessageCircle size={16} />} count={0} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
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
