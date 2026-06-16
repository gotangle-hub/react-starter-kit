import { Send } from "lucide-react";
import { StateSuccess } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

export default function ApplicationSent() {
  return (
    <StateSuccess
      icon={Send}
      tone="blue"
      chip="Application sent"
      title="Your pitch is on its way."
      body="The client will see your application and attached work. You'll hear back in Messages — most replies come within a few days."
      primary={{ label: "Back to opportunities", to: routes.callouts }}
      secondary={{ label: "View messages", to: routes.messages }}
    />
  );
}
