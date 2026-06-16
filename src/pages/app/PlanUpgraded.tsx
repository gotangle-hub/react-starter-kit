import { Zap } from "lucide-react";
import { StateSuccess } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

export default function PlanUpgraded() {
  return (
    <StateSuccess
      icon={Zap}
      tone="yellow"
      chip="Tangle Pro"
      title="Welcome to Pro."
      body="Unlimited swipes, who liked you, advanced filters, the full salary database and more are unlocked. Your receipt is in Billing."
      primary={{ label: "Start exploring", to: routes.home }}
      secondary={{ label: "View billing", to: routes.billing }}
    />
  );
}
