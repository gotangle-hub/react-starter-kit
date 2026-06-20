import { NavLink } from "react-router-dom";
import {
  Bell,
  Bookmark,
  Building2,
  Compass,
  GraduationCap,
  Grid2x2,
  House,
  MessageCircle,
  PlusSquare,
  Search,
  Settings,
  Trophy,
  User,
  Users,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { AccountType } from "@/lib/types";
import { useAccountType } from "@/hooks/use-account-type";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface NavEntry {
  to: string;
  icon: LucideIcon;
  label: string;
}

/**
 * Desktop sidebar nav (Instagram-style). Mirrors the per-account tab sets in
 * `app-tab-bar.tsx` and adds a couple of extra destinations that fit naturally
 * on a wider nav. Hidden below the desktop breakpoint — the bottom tab bar
 * continues to handle navigation on mobile/native.
 */
const NAV_SETS: Record<AccountType, NavEntry[]> = {
  designer: [
    { to: routes.home, icon: House, label: "Home" },
    { to: routes.explore, icon: Grid2x2, label: "Explore" },
    { to: routes.search, icon: Search, label: "Search" },
    { to: routes.match, icon: Users, label: "Match" },
    { to: routes.messages, icon: MessageCircle, label: "Messages" },
    { to: routes.notifications, icon: Bell, label: "Notifications" },
    { to: routes.community, icon: Compass, label: "Community" },
    { to: routes.competitions, icon: Trophy, label: "Competitions" },
    { to: routes.createSheet, icon: PlusSquare, label: "Create" },
    { to: routes.profile, icon: User, label: "You" },
  ],
  studio: [
    { to: routes.home, icon: House, label: "Home" },
    { to: routes.explore, icon: Grid2x2, label: "Explore" },
    { to: routes.talentPool, icon: Users, label: "Talent" },
    { to: routes.messages, icon: MessageCircle, label: "Messages" },
    { to: routes.studioPage, icon: Building2, label: "Studio" },
    { to: routes.profile, icon: User, label: "You" },
  ],
  client: [
    { to: routes.clientHome, icon: House, label: "Home" },
    { to: routes.explore, icon: Grid2x2, label: "Explore" },
    { to: routes.talentPool, icon: Users, label: "Talent" },
    { to: routes.messages, icon: MessageCircle, label: "Messages" },
    { to: routes.profile, icon: User, label: "You" },
  ],
  student: [
    { to: routes.studentClasses, icon: GraduationCap, label: "Classes" },
    { to: routes.explore, icon: Grid2x2, label: "Explore" },
    { to: routes.studentCompetitions, icon: Trophy, label: "Compete" },
    { to: routes.community, icon: Users, label: "Community" },
    { to: routes.messages, icon: MessageCircle, label: "Messages" },
    { to: routes.profile, icon: User, label: "You" },
  ],
  institution: [
    { to: routes.classList, icon: GraduationCap, label: "Classes" },
    { to: routes.explore, icon: Grid2x2, label: "Explore" },
    { to: routes.community, icon: Users, label: "Community" },
    { to: routes.messages, icon: MessageCircle, label: "Messages" },
    { to: routes.profile, icon: User, label: "You" },
  ],
  collector: [
    { to: routes.collectorHome, icon: Compass, label: "Discover" },
    { to: routes.collectorExplore, icon: Grid2x2, label: "Explore" },
    { to: routes.collectorSaved, icon: Bookmark, label: "Saved" },
    { to: routes.collectorProfile, icon: User, label: "You" },
  ],
};

export function WebSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const { accountType } = useAccountType();
  const items = NAV_SETS[accountType] ?? NAV_SETS.designer;

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-[100dvh] flex-none flex-col border-r border-tg-line bg-tg-bg text-tg-ink lg:flex",
        collapsed ? "w-[76px]" : "w-[244px]",
      )}
    >
      {/* Brand */}
      <div className={cn("flex items-center px-6 pb-6 pt-7", collapsed && "justify-center px-0")}>
        <span className="font-serif text-2xl tracking-tight text-tg-ink">
          {collapsed ? "·t" : "·tangle"}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 rounded-xl px-3 py-3 transition-colors duration-fast",
                "hover:bg-tg-page-board",
                isActive ? "font-semibold text-tg-blue-accent" : "text-tg-ink",
              )
            }
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon size={24} strokeWidth={isActive ? 2.25 : 1.75} />
                {!collapsed && <span className="text-[15px]">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6">
        <NavLink
          to={routes.settings}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-4 rounded-xl px-3 py-3 transition-colors duration-fast",
              "hover:bg-tg-page-board",
              isActive ? "font-semibold text-tg-blue-accent" : "text-tg-ink",
            )
          }
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={22} strokeWidth={1.75} />
          {!collapsed && <span className="text-[15px]">Settings</span>}

        </NavLink>
      </div>
    </aside>
  );
}
