import { User, ShieldCheck, AtSign, Lock, Bell, Ban, Zap, CreditCard, Megaphone, LifeBuoy, LogOut, Trash2 } from "lucide-react";
import { SettingsScaffold, SettingsGroup } from "@/components/app/settings-kit";
import { WebPage } from "@/components/web/web-page";
import { useWebViewport } from "@/hooks/use-is-desktop";
import { routes } from "@/lib/routes";

function SettingsBody() {
  return (
    <>
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
    </>
  );
}

export default function Settings() {
  const viewport = useWebViewport();
  if (viewport !== "mobile") {
    return (
      <WebPage maxWidth={760}>
        <h1 className="mb-8 font-serif text-[34px] font-medium leading-none tracking-[-0.02em] text-tg-ink">
          Settings
        </h1>
        <SettingsBody />
      </WebPage>
    );
  }
  return (
    <SettingsScaffold title="Settings">
      <SettingsBody />
    </SettingsScaffold>
  );
}
