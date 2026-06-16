import { NavLink } from "react-router-dom";
import {
  Bookmark,
  Building2,
  Compass,
  GraduationCap,
  Grid2x2,
  House,
  MessageCircle,
  Search,
  Trophy,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AccountType } from "@/lib/types";
import { useAccountType } from "@/hooks/use-account-type";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface Tab {
  to: string;
  icon: LucideIcon;
  label: string;
}

/**
 * The bottom tab bar adapts to the account type (G — each journey has its own
 * home and surfaces). Shared screens (Explore, Messages, …) render whichever set
 * matches the signed-in account, so the same screen shows the right tabs.
 */
const TAB_SETS: Record<AccountType, Tab[]> = {
  designer: [
    { to: routes.home, icon: House, label: "Home" },
    { to: routes.explore, icon: Grid2x2, label: "Explore" },
    { to: routes.search, icon: Search, label: "Search" },
    { to: routes.messages, icon: MessageCircle, label: "Messages" },
    { to: routes.profile, icon: User, label: "You" },
  ],
  studio: [
    { to: routes.home, icon: House, label: "Home" },
    { to: routes.explore, icon: Grid2x2, label: "Explore" },
    { to: routes.talentPool, icon: Users, label: "Talent" },
    { to: routes.messages, icon: MessageCircle, label: "Messages" },
    { to: routes.studioPage, icon: Building2, label: "Studio" },
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

export function AppTabBar() {
  const { accountType } = useAccountType();
  const tabs = TAB_SETS[accountType] ?? TAB_SETS.designer;

  return (
    <nav className="flex flex-none items-start border-t border-tg-line bg-tg-bg/95 px-1.5 pb-7 pt-2.5 backdrop-blur">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={label}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-1 transition-colors duration-fast",
              isActive ? "text-tg-blue-accent" : "text-tg-brown-soft",
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={23} strokeWidth={isActive ? 2.25 : 1.75} />
              <span className={cn("text-[10px] tracking-meta", isActive ? "font-semibold" : "font-medium")}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
