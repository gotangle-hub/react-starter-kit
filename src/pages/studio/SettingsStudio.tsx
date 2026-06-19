import {
  AtSign,
  Ban,
  Bell,
  Building2,
  CreditCard,
  Globe,
  LifeBuoy,
  Lock,
  LogOut,
  Megaphone,
  Shield,
  ShieldCheck,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { SettingsScaffold, SettingsGroup } from "@/components/app/settings-kit";
import { routes } from "@/lib/routes";

/** 33 · Studio settings — studio-worded, consistent with the rest of the app. */
export default function SettingsStudio() {
  return (
    <SettingsScaffold title="Studio settings">
      <SettingsGroup
        title="Studio"
        rows={[
          { icon: Building2, label: "Studio page", to: routes.studioPage },
          { icon: Users, label: "Team & seats", to: routes.studioTeam },
          { icon: Shield, label: "Roles & permissions", to: routes.studioTeam },
          { icon: Globe, label: "Public studio profile", value: "On", to: routes.editProfile },
        ]}
      />
      <SettingsGroup
        title="Account"
        rows={[
          { icon: AtSign, label: "Username & email", to: routes.accountEmail },
          { icon: ShieldCheck, label: "Get verified", to: routes.verification },
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
          { icon: Zap, label: "Studio plan", value: "Manage", to: routes.billing },
          { icon: CreditCard, label: "Billing & seats", to: routes.billing },
          { icon: Megaphone, label: "Promote the studio", to: routes.promote },
        ]}
      />
      <SettingsGroup title="Support" rows={[{ icon: LifeBuoy, label: "Help & legal", to: routes.legalHelp }]} />
      <SettingsGroup
        rows={[
          { icon: LogOut, label: "Log out", danger: true, to: routes.logoutConfirm },
          { icon: Trash2, label: "Delete studio account", danger: true, to: routes.deleteAccount },
        ]}
      />
    </SettingsScaffold>
  );
}
