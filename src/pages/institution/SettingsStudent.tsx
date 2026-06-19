import {
  AtSign,
  Ban,
  Bell,
  BookOpen,
  Building2,
  GraduationCap,
  LifeBuoy,
  Lock,
  LogOut,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { SettingsScaffold, SettingsGroup } from "@/components/app/settings-kit";
import { recallInstitution } from "@/services/institutions";
import { routes } from "@/lib/routes";

/** 43 · Student settings — student-worded, consistent with the rest of the app. */
export default function SettingsStudent() {
  const inst = recallInstitution();
  return (
    <SettingsScaffold title="Student settings">
      <SettingsGroup
        title="Campus"
        rows={[
          { icon: Building2, label: "Institution", value: inst?.name ?? "Not linked" },
          { icon: GraduationCap, label: "Graduation status", to: routes.studentGraduation },
          { icon: BookOpen, label: "My classes", to: routes.studentClasses },
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

      <div className="mb-6 flex items-start gap-3 rounded-lg border border-tg-line bg-tg-stone2 px-4 py-3.5">
        <Sparkles size={19} className="mt-0.5 flex-none text-tg-blue-accent" />
        <p className="font-body text-[13px] leading-relaxed text-tg-brown">
          Every Pro feature is free on your student account — unlimited swipes, who liked you,
          advanced filters and the full salary database — included under your campus subscription.
        </p>
      </div>

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
