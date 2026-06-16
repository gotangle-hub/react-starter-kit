import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Heart, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta, PhotoTile } from "@/components/brand/atoms";
import { Chip } from "@/components/brand/chip";
import { Button } from "@/components/ui/button";
import { feed, makerById, posts } from "@/lib/fixtures";

/** 24 · Project detail (G3). Full project — images, title, maker, credits, caption. */
export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const post = posts.find((p) => p.id === id) ?? posts[0];
  const maker = makerById(post.maker);

  return (
    <MobileShell
      footer={
        <div className="flex flex-none items-center gap-4 border-t border-tg-line px-[18px] py-3">
          <button type="button" className="flex items-center gap-1.5 text-tg-ink">
            <Heart size={22} />
            <span className="font-display text-[13px] font-semibold">{post.likes}</span>
          </button>
          <button type="button" className="flex items-center gap-1.5 text-tg-ink" onClick={() => navigate("/project/" + post.id + "/comments")}>
            <MessageCircle size={22} />
            <span className="font-display text-[13px] font-semibold">{post.comments}</span>
          </button>
          <button type="button" className="flex items-center gap-1.5 text-tg-ink" onClick={() => navigate("/pin")}>
            <Bookmark size={22} />
          </button>
          <span className="flex-1" />
          <Button size="sm" onClick={() => navigate("/request")}>Connect</Button>
        </div>
      }
    >
      <div className="relative">
        <PhotoTile width="100%" height={420} img={feed(post.img)} swatch="#161514" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-pill bg-black/35 text-white backdrop-blur">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button type="button" aria-label="Share" className="flex h-9 w-9 items-center justify-center rounded-pill bg-black/35 text-white backdrop-blur">
              <Share2 size={18} />
            </button>
            <button type="button" aria-label="More" onClick={() => navigate("/post-menu")} className="flex h-9 w-9 items-center justify-center rounded-pill bg-black/35 text-white backdrop-blur">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-[22px] py-5">
        <Chip>{post.cat}</Chip>
        <h1 className="mt-3 font-serif text-[34px] font-medium leading-none tracking-[-0.025em]">{post.title}</h1>
        <Meta className="mt-2 block">
          {post.place} · {post.year}
        </Meta>

        <button type="button" onClick={() => navigate("/u/" + maker.id)} className="mt-4 flex w-full items-center gap-3 rounded-lg border border-tg-line bg-tg-card p-3 text-left">
          <Avatar maker={maker} size={42} />
          <div className="flex-1">
            <NameRow maker={maker} size={14.5} />
            <Meta className="mt-0.5 block">
              {maker.role} · {maker.city}
            </Meta>
          </div>
          <Button variant="outline" size="sm">Follow</Button>
        </button>

        <p className="mt-5 font-body text-[15.5px] leading-relaxed text-tg-ink">
          A house arranged around a single shaft of morning light. Warm materials,
          restraint, and a section that does most of the talking — drawn before
          anything was rendered.
        </p>

        <div className="mt-5">
          <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-tg-brown">
            Credits
          </div>
          <div className="flex flex-col gap-2">
            <CreditRow role="Lead" maker={maker.name} />
            <CreditRow role="Photography" maker="Sami Okonkwo" />
            <CreditRow role="Used in" maker={post.usedIn} />
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

function CreditRow({ role, maker }: { role: string; maker: string }) {
  return (
    <div className="flex items-center justify-between border-b border-tg-line-soft pb-2">
      <Meta>{role}</Meta>
      <span className="font-display text-[13.5px] font-medium text-tg-ink">{maker}</span>
    </div>
  );
}
