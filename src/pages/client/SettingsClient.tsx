import {
  AtSign,
  Ban,
  Bell,
  Briefcase,
  CreditCard,
  Globe,
  LifeBuoy,
  Lock,
  LogOut,
  Receipt,
  ShieldCheck,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { SettingsScaffold, SettingsGroup } from "@/components/app/settings-kit";
import { routes } from "@/lib/routes";

/** 24 · Client settings — client-worded, consistent with the rest of the app. */
export default function SettingsClient() {
  return (
    <SettingsScaffold title="Client settings">
      <SettingsGroup
        title="Account"
        rows={[
          { icon: User, label: "Edit profile", sub: "Name, logo, about", to: routes.editProfile },
          { icon: Briefcase, label: "Company details", sub: "Type, sector, website", to: routes.editProfile },
          { icon: AtSign, label: "Username & email", to: routes.accountEmail },
          { icon: ShieldCheck, label: "Get verified", to: routes.verification },
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
      <SettingsGroup
        title="Plan & money"
        rows={[
          { icon: Zap, label: "Client plan", value: "Manage", to: routes.plansCombined },
          { icon: CreditCard, label: "Payment methods", to: routes.billing },
          { icon: Receipt, label: "Invoices & receipts", to: routes.billing },
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
