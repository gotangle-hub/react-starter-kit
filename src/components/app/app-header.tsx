import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/brand/avatar";
import { me } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

/** Shared top header for tab-root screens: wordmark, notifications, your avatar. */
export function AppHeader({ unread = 3 }: { unread?: number }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-none items-center justify-between px-[22px] pt-2">
      <Logo size={24} />
      <div className="flex items-center gap-4">
        <button type="button" className="relative" aria-label="Notifications" onClick={() => navigate("/notifications")}>
          <Bell size={22} className="text-tg-ink" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-pill bg-tg-blue px-1 font-display text-[9px] font-bold text-white ring-2 ring-tg-bg">
              {unread}
            </span>
          )}
        </button>
        <button type="button" onClick={() => navigate(routes.profile)} aria-label="Your profile">
          <Avatar maker={me} size={30} />
        </button>
      </div>
    </div>
  );
}
