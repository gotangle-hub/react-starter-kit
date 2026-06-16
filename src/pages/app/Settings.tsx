import { User, ShieldCheck, AtSign, Lock, Bell, Ban, Zap, CreditCard, Megaphone, LifeBuoy, LogOut, Trash2 } from "lucide-react";
import { SettingsScaffold, SettingsGroup } from "@/components/app/settings-kit";
import { routes } from "@/lib/routes";

export default function Settings() {
  return (
    <SettingsScaffold title="Settings">
      <SettingsGroup
        title="Account"
        rows={[
          { icon: User, label: "Edit profile", sub: "Name, bio, disciplines", to: routes.editProfile },
          { icon: ShieldCheck, label: "Get verified", to: routes.verification },
          { icon: AtSign, label: "Username & email", to: routes.accountEmail },
          { icon: Lock, label: "Password & security", to: routes.passwordSecurity },
          { icon: Bell, label: "Notifications", to: routes.notificationSettings },
        ]}
      />
      <SettingsGroup
        title="Privacy"
        rows={[{ icon: Ban, label: "Blocked accounts", to: routes.blockedAccounts }]}
      />
      <SettingsGroup
        title="Plan & money"
        rows={[
          { icon: Zap, label: "Tangle Pro", value: "Manage", to: routes.billing },
          { icon: CreditCard, label: "Billing & payments", to: routes.billing },
          { icon: Megaphone, label: "Promote your work", to: routes.promote },
        ]}
      />
      <SettingsGroup
        title="Support"
        rows={[{ icon: LifeBuoy, label: "Help & legal", to: routes.legalHelp }]}
      />
      <SettingsGroup
        title=""
        rows={[
          { icon: LogOut, label: "Log out", danger: true, to: routes.logoutConfirm },
          { icon: Trash2, label: "Delete account", danger: true, to: routes.deleteAccount },
        ]}
      />
    </SettingsScaffold>
  );
}
