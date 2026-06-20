import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Send, Sparkles } from "lucide-react";

import { WebPage } from "@/components/web/web-page";
import { RightRail } from "@/components/web/right-rail";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { getMyProfile, makerFromProfile, type ProfileRow } from "@/services/profile";
import type { Maker } from "@/lib/profile-shape";

/**
 * Desktop Community (reference: `web.jsx` → `WebCommunity`).
 * Single centered column of thoughts with a sticky composer at the top.
 * Right rail mirrors Feed so the page feels part of the same space.
 */
export function CommunityDesktop() {
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
    setList((prev) => [{ id: `local-${Date.now()}`, text: t, time: "now" }, ...prev]);
    setText("");
    inputRef.current?.focus(); // G8
  };

  return (
    <WebPage rail={<RightRail />} maxWidth={1000}>
      <header className="mb-5">
        <h1 className="font-serif text-[30px] leading-none tracking-[-0.02em]">Community</h1>
        <Meta className="mt-1.5 block">
          Designers&rsquo; thoughts, questions and notes from the studio.
        </Meta>
      </header>

      {/* Composer */}
      <div className="mb-6 flex gap-3 rounded-2xl border border-tg-line bg-tg-bg p-4">
        {me ? (
          <Avatar maker={me} size={44} />
        ) : (
          <span className="inline-block h-11 w-11 flex-none rounded-full bg-tg-stone2" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share a thought with the community…"
            rows={3}
            className="w-full resize-none bg-transparent font-body text-[15px] leading-snug text-tg-ink outline-none placeholder:text-tg-brown-soft"
          />
          <div className="mt-2 flex items-center justify-end">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={post}
              disabled={!text.trim()}
              className="inline-flex items-center gap-1.5 rounded-full bg-tg-blue px-5 py-2 font-display text-[13px] font-semibold text-white disabled:opacity-40"
            >
              <Send size={14} />
              Post
            </button>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-tg-line px-8 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-tg-stone2 text-tg-brown">
            <Sparkles size={22} />
          </span>
          <h2 className="mt-4 font-serif text-[22px] font-medium tracking-[-0.01em] text-tg-ink">
            The community is quiet
          </h2>
          <Meta className="mt-1.5 block max-w-[320px]">
            Be the first to share a thought, question or studio note.
          </Meta>
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border border-tg-line bg-tg-bg px-5 py-4"
            >
              <div className="flex gap-3">
                {me && <Avatar maker={me} size={42} />}
                <div className="min-w-0 flex-1">
                  {me && (
                    <div className="flex items-center gap-2">
                      <NameRow maker={me} size={14.5} />
                      <Meta>{p.time}</Meta>
                    </div>
                  )}
                  <p className="mt-1.5 font-body text-[15px] leading-relaxed text-tg-ink">{p.text}</p>
                  <div className="mt-3 flex items-center gap-7 text-tg-brown">
                    <Counter icon={<Heart size={17} />} count={0} />
                    <Counter icon={<MessageCircle size={17} />} count={0} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </WebPage>
  );
}

function Counter({ icon, count }: { icon: React.ReactNode; count: number }) {
  return (
    <button type="button" className="flex items-center gap-1.5 text-tg-brown">
      {icon}
      <span className="font-mono text-[12px]">{count}</span>
    </button>
  );
}
