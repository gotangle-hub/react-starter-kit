import {
  Ban,
  Building2,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  ShieldCheck,
  Ticket,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { SettingsScaffold, SettingsGroup } from "@/components/app/settings-kit";
import { routes } from "@/lib/routes";

/** 46 · Institution settings — admin view, consistent with the rest of the app. */
export default function SettingsInstitution() {
  return (
    <SettingsScaffold title="Institution settings">
      <SettingsGroup
        title="Institution"
        rows={[
          { icon: Building2, label: "Institution profile", to: routes.editProfile },
          { icon: LayoutGrid, label: "Manage classes", value: "12", to: routes.classList },
          { icon: Ticket, label: "Licenses & seats", value: "480", to: routes.plansCombined },
        ]}
      />
      <SettingsGroup
        title="People"
        rows={[
          { icon: Users, label: "Faculty & students" },
          { icon: Ban, label: "Blocked accounts", to: routes.blockedAccounts },
        ]}
      />
      <SettingsGroup
        title="Plan"
        rows={[{ icon: Wallet, label: "Campus subscription", value: "Manage", to: routes.plansCombined }]}
      />
      <SettingsGroup title="Support" rows={[{ icon: LifeBuoy, label: "Help & legal", to: routes.legalHelp }]} />
      <SettingsGroup
        rows={[
          { icon: LogOut, label: "Log out", danger: true, to: routes.logoutConfirm },
          { icon: Trash2, label: "Delete institution account", danger: true, to: routes.deleteAccount },
        ]}
      />
    </SettingsScaffold>
  );
}
