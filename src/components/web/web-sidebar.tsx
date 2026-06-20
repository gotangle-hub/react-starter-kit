import { NavLink } from "react-router-dom";

import type { AccountType } from "@/lib/types";
import { useAccountType } from "@/hooks/use-account-type";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { TIcon, type TIconName } from "@/components/web/t-icon";
import { useWebFlyout } from "@/components/web/flyouts";

/**
 * Tangle WEB sidebar — Instagram-style left rail. Ported to match the uploaded
 * reference (`web.jsx` → `WebSidebar`) exactly: `.tangle` wordmark with the
 * `.t` in the blue accent, custom `TIcon` set in the same accent, Profile +
 * More pinned to the bottom. Single source of truth — used at tablet (collapsed
 * to 76px, icons only) and desktop (244px with labels). Hidden on mobile and
 * NEVER renders inside the native Capacitor app (per `useIsDesktop`).
 *
 * Each account type keeps its own destination set per the spec, but every set
 * uses the same custom icon vocabulary and the same chrome.
 */

interface NavEntry {
  to: string;
  icon: TIconName;
  label: string;
}

const NAV_SETS: Record<AccountType, NavEntry[]> = {
  designer: [
    { to: routes.home, icon: "home", label: "Home" },
    { to: routes.search, icon: "search", label: "Search" },
    { to: routes.explore, icon: "explore", label: "Explore" },
    { to: routes.match, icon: "discover", label: "Discover" },
    { to: routes.competitions, icon: "competitions", label: "Competitions" },
    { to: routes.community, icon: "community", label: "Community" },
    { to: routes.messages, icon: "messages", label: "Messages" },
    { to: routes.notifications, icon: "notifications", label: "Notifications" },
    { to: routes.createSheet, icon: "create", label: "Share work" },
  ],
  studio: [
    { to: routes.home, icon: "home", label: "Home" },
    { to: routes.search, icon: "search", label: "Search" },
    { to: routes.explore, icon: "explore", label: "Explore" },
    { to: routes.talentPool, icon: "community", label: "Talent pool" },
    { to: routes.competitions, icon: "competitions", label: "Competitions" },
    { to: routes.messages, icon: "messages", label: "Messages" },
    { to: routes.notifications, icon: "notifications", label: "Notifications" },
    { to: routes.studioPage, icon: "discover", label: "Studio page" },
    { to: routes.createSheet, icon: "create", label: "Share work" },
  ],
  client: [
    { to: routes.clientHome, icon: "home", label: "Home" },
    { to: routes.search, icon: "search", label: "Search" },
    { to: routes.explore, icon: "explore", label: "Explore" },
    { to: routes.talentPool, icon: "community", label: "Talent pool" },
    { to: routes.messages, icon: "messages", label: "Messages" },
    { to: routes.notifications, icon: "notifications", label: "Notifications" },
    { to: routes.postCallout, icon: "create", label: "Post brief" },
  ],
  student: [
    { to: routes.home, icon: "home", label: "Home" },
    { to: routes.search, icon: "search", label: "Search" },
    { to: routes.explore, icon: "explore", label: "Explore" },
    { to: routes.studentClasses, icon: "discover", label: "Classes" },
    { to: routes.studentCompetitions, icon: "competitions", label: "Competitions" },
    { to: routes.community, icon: "community", label: "Community" },
    { to: routes.messages, icon: "messages", label: "Messages" },
    { to: routes.notifications, icon: "notifications", label: "Notifications" },
    { to: routes.createSheet, icon: "create", label: "Share work" },
  ],
  institution: [
    { to: routes.classList, icon: "discover", label: "Classes" },
    { to: routes.search, icon: "search", label: "Search" },
    { to: routes.explore, icon: "explore", label: "Explore" },
    { to: routes.community, icon: "community", label: "Community" },
    { to: routes.messages, icon: "messages", label: "Messages" },
    { to: routes.notifications, icon: "notifications", label: "Notifications" },
  ],
  collector: [
    { to: routes.collectorHome, icon: "home", label: "Discover" },
    { to: routes.search, icon: "search", label: "Search" },
    { to: routes.collectorExplore, icon: "explore", label: "Explore" },
    { to: routes.collectorSaved, icon: "discover", label: "Saved" },
    { to: routes.messages, icon: "messages", label: "Messages" },
    { to: routes.notifications, icon: "notifications", label: "Notifications" },
  ],
};

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    "flex items-center gap-4 rounded-xl px-3 py-3 transition-colors duration-fast",
    "hover:bg-tg-page-board",
    isActive ? "font-semibold text-tg-ink" : "font-normal text-tg-ink",
  );
}

export function WebSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const { accountType } = useAccountType();
  const items = NAV_SETS[accountType] ?? NAV_SETS.designer;

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-[100dvh] flex-none flex-col border-r border-tg-line bg-tg-bg text-tg-ink",
        // Spec: sidebar visible from 700px (tablet, collapsed) and 1100px (desktop, full)
        "min-[700px]:flex",
        collapsed ? "w-[76px] px-3 py-6" : "w-[244px] px-3.5 py-6",
      )}
    >
      {/* Brand — `.tangle` wordmark, the `.t` in the blue accent (yellow in dark) */}
      <div
        className={cn(
          "mb-5 flex items-center px-2.5 pb-2",
          collapsed && "justify-center px-0",
        )}
      >
        <span className="font-serif text-[26px] leading-none tracking-tight text-tg-ink">
          <span className="italic text-tg-blue-accent">.</span>
          <span className="text-tg-blue-accent">t</span>
          {!collapsed && "angle"}
        </span>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-[3px]">
        {items.map(({ to, icon, label }) => {
          // Search & Notifications open as flyout panels (Instagram pattern), not routes
          const flyout: "search" | "notifications" | null =
            icon === "search" ? "search" : icon === "notifications" ? "notifications" : null;
          if (flyout) {
            return (
              <FlyoutButton
                key={`${label}-${flyout}`}
                flyout={flyout}
                icon={icon}
                label={label}
                collapsed={collapsed}
              />
            );
          }
          return (
            <NavLink
              key={`${label}-${to}`}
              to={to}
              end={to === "/"}
              className={navLinkClass}
              title={collapsed ? label : undefined}
            >
              {({ isActive }) => (
                <>
                  <span className="text-tg-blue-accent">
                    <TIcon name={icon} size={25} active={isActive} />
                  </span>
                  {!collapsed && (
                    <span
                      className={cn(
                        "text-[16px] leading-none tracking-[0.01em]",
                        isActive ? "font-bold" : "font-normal",
                      )}
                    >
                      {label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Profile + More pinned to bottom (per spec) */}
      <div className="flex flex-col gap-[3px]">
        <NavLink to={routes.profile} className={navLinkClass} title={collapsed ? "Profile" : undefined}>
          {({ isActive }) => (
            <>
              <span className="text-tg-blue-accent">
                <TIcon name="profile" size={25} active={isActive} />
              </span>
              {!collapsed && (
                <span className={cn("text-[16px] leading-none", isActive ? "font-bold" : "font-normal")}>
                  Profile
                </span>
              )}
            </>
          )}
        </NavLink>

        <NavLink to={routes.settings} className={navLinkClass} title={collapsed ? "More" : undefined}>
          {({ isActive }) => (
            <>
              <span className="text-tg-blue-accent">
                <TIcon name="more" size={25} active={isActive} />
              </span>
              {!collapsed && (
                <span className={cn("text-[16px] leading-none", isActive ? "font-bold" : "font-normal")}>
                  More
                </span>
              )}
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
}

function FlyoutButton({
  flyout,
  icon,
  label,
  collapsed,
}: {
  flyout: "search" | "notifications";
  icon: TIconName;
  label: string;
  collapsed: boolean;
}) {
  const { open, openFlyout } = useWebFlyout();
  const isActive = open === flyout;
  return (
    <button
      type="button"
      onClick={() => openFlyout(flyout)}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-4 rounded-xl px-3 py-3 text-left transition-colors duration-fast",
        "hover:bg-tg-page-board",
        isActive ? "font-semibold text-tg-ink" : "font-normal text-tg-ink",
      )}
    >
      <span className="text-tg-blue-accent">
        <TIcon name={icon} size={25} active={isActive} />
      </span>
      {!collapsed && (
        <span
          className={cn(
            "text-[16px] leading-none tracking-[0.01em]",
            isActive ? "font-bold" : "font-normal",
          )}
        >
          {label}
        </span>
      )}
    </button>
  );
}
