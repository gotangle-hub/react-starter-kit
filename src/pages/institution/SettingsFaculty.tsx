import {
  AtSign,
  Ban,
  Bell,
  BookOpen,
  Building2,
  LifeBuoy,
  Mail,
  Lock,
  LogOut,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import { SettingsScaffold, SettingsGroup } from "@/components/app/settings-kit";
import { recallInstitution } from "@/services/institutions";
import { routes } from "@/lib/routes";

/** 45 · Faculty settings — faculty-worded, consistent with the rest of the app. */
export default function SettingsFaculty() {
  const inst = recallInstitution();
  return (
    <SettingsScaffold title="Faculty settings">
      <SettingsGroup
        title="Teaching"
        rows={[
          { icon: Building2, label: "Institution", value: inst?.name ?? "Not linked" },
          { icon: BookOpen, label: "My classes", to: routes.classList },
          { icon: UserPlus, label: "Invite a TA", to: routes.professorCreateClass },
        ]}
      />
      <SettingsGroup
        title="Account"
        rows={[
          { icon: User, label: "Edit profile", to: routes.editProfile },
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
        title="Support"
        rows={[
          { icon: LifeBuoy, label: "Help & legal", to: routes.legalHelp },
          { icon: Mail, label: "Contact us", sub: "help@gotangle.app", onClick: () => { window.location.href = "mailto:help@gotangle.app"; } },
        ]}
      />
      <SettingsGroup
        rows={[
          { icon: LogOut, label: "Log out", danger: true, to: routes.logoutConfirm },
          { icon: Trash2, label: "Delete account", danger: true, to: routes.deleteAccount },
        ]}
      />
    </SettingsScaffold>
  );
}
