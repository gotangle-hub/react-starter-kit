import { FileText, Shield, Copyright, Mail, HelpCircle } from "lucide-react";
import { SettingsScaffold, SettingsGroup } from "@/components/app/settings-kit";
import { routes } from "@/lib/routes";

export default function LegalHelp() {
  return (
    <SettingsScaffold title="Help & legal">
      <SettingsGroup
        title="Policies"
        rows={[
          { icon: FileText, label: "Terms & Conditions", to: routes.terms },
          { icon: Shield, label: "Privacy Policy", to: routes.privacy },
          { icon: Copyright, label: "Copyright Policy", to: routes.copyright },
        ]}
      />
      <SettingsGroup
        title="Support"
        rows={[
          { icon: Mail, label: "Contact us", sub: "help@gotangle.app", onClick: () => { window.location.href = "mailto:help@gotangle.app"; } },
          { icon: HelpCircle, label: "FAQ" },
        ]}
      />
    </SettingsScaffold>
  );
}

