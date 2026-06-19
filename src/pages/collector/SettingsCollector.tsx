import { AtSign, Ban, Bell, Globe, Heart, LifeBuoy, Lock, LogOut, ShieldCheck, Trash2, User } from "lucide-react";
import { SettingsScaffold, SettingsGroup } from "@/components/app/settings-kit";
import { routes } from "@/lib/routes";

/** 18 · Collector settings — browse-only account, consistent with the app. */
export default function SettingsCollector() {
  return (
    <SettingsScaffold title="Collector settings">
      <SettingsGroup
        title="Account"
        rows={[
          { icon: User, label: "Edit profile", sub: "Name, avatar, interests", to: routes.editProfile },
          { icon: Heart, label: "Interests", sub: "Tune your Discover feed", to: routes.editProfile },
          { icon: AtSign, label: "Username & email", to: routes.accountEmail },
          { icon: Lock, label: "Password & security", to: routes.passwordSecurity },
          { icon: Bell, label: "Notifications", to: routes.notificationSettings },
        ]}
      />
      <SettingsGroup
        title="Privacy"
        rows={[
          { icon: Globe, label: "Public profile", value: "On", to: routes.editProfile },
          { icon: Ban, label: "Blocked accounts", to: routes.blockedAccounts },
        ]}
      />
      <SettingsGroup title="Support" rows={[{ icon: LifeBuoy, label: "Help & legal", to: routes.legalHelp }]} />
      <SettingsGroup
        rows={[
          { icon: LogOut, label: "Log out", danger: true, to: routes.logoutConfirm },
          { icon: Trash2, label: "Delete account", danger: true, to: routes.deleteAccount },
        ]}
      />
    </SettingsScaffold>
  );
}
