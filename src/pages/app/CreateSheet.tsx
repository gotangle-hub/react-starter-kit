import { useNavigate } from "react-router-dom";
import { ImagePlus, Megaphone, Users, MessageSquareText, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BottomSheet } from "@/components/app/bottom-sheet";
import { routes } from "@/lib/routes";

/**
 * 51 · Create — the bottom-sheet create menu. Add work, post a call out, start
 * a collaboration, or post to the community.
 */

const ITEMS: { icon: LucideIcon; label: string; desc: string; route: string }[] = [
  {
    icon: ImagePlus,
    label: "Add work",
    desc: "Upload photos, video or a PDF to your profile",
    route: routes.workUpload,
  },
  {
    icon: Megaphone,
    label: "Post a call out",
    desc: "Find collaborators or hire for a project",
    route: routes.postCallout,
  },
  {
    icon: Users,
    label: "Start a collaboration",
    desc: "Build a team for a competition or brief",
    route: routes.partnerMatch,
  },
  {
    icon: MessageSquareText,
    label: "Post to community",
    desc: "Share a thought with designers",
    route: routes.community,
  },
];

export default function CreateSheet() {
  const navigate = useNavigate();

  return (
    <BottomSheet title="Create">
      <div className="px-4 pb-7 pt-1">
        <div className="flex flex-col gap-1.5">
          {ITEMS.map(({ icon: Icon, label, desc, route }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(route)}
              className="flex items-center gap-3.5 rounded-lg px-3 py-3 text-left hover:bg-tg-stone2"
            >
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-DEFAULT bg-tg-stone2 text-tg-blue-accent">
                <Icon size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block font-display text-[15px] font-semibold text-tg-ink">
                  {label}
                </span>
                <span className="mt-0.5 block font-body text-[12.5px] leading-snug text-tg-brown">
                  {desc}
                </span>
              </div>
              <ChevronRight size={18} className="flex-none text-tg-brown-soft" />
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
