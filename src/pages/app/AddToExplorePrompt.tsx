import { useNavigate, useSearchParams } from "react-router-dom";
import { Compass } from "lucide-react";
import { BottomSheet } from "@/components/app/bottom-sheet";
import { Button } from "@/components/ui/button";
import { feed } from "@/lib/fixtures";
import { routes } from "@/lib/routes";
import { setPostOnExplore } from "@/services/work";

/**
 * 49 · Also add to Explore? A sheet shown after a piece is added to your work,
 * asking whether to also publish it to the Explore feed. It stays on your
 * profile either way.
 */
export default function AddToExplorePrompt() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const postId = params.get("postId");

  async function publish() {
    if (postId) {
      try {
        await setPostOnExplore(postId, true);
      } catch {
        /* non-blocking */
      }
    }
    navigate(routes.explore);
  }

  async function skip() {
    if (postId) {
      try {
        await setPostOnExplore(postId, false);
      } catch {
        /* non-blocking */
      }
    }
    navigate(routes.profile);
  }

  return (
    <BottomSheet onClose={skip}>
      <div className="px-6 pb-8 pt-2">
        <div className="flex items-center gap-3.5">
          <span
            className="h-[58px] w-[58px] flex-none rounded-lg"
            style={{
              backgroundImage: `url(${feed("spec-full.jpg")})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <h2 className="font-serif text-[21px] font-medium leading-[1.1] tracking-[-0.01em] text-tg-ink">
            Saved. Add it to Explore too?
          </h2>
        </div>

        <p className="mt-3.5 font-body text-[14px] leading-relaxed text-tg-brown">
          Publishing to Explore lets people discover this piece in the feed and in search. It stays
          on your profile either way.
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          <Button variant="primary" full size="lg" onClick={publish}>
            <Compass size={16} />
            Publish to Explore
          </Button>
          <Button variant="ghost" full size="lg" onClick={skip}>
            Not now
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
