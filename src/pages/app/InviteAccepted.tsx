import { Check } from "lucide-react";
import { StateSuccess } from "@/components/app/state-screens";
import { routes, path } from "@/lib/routes";

export default function InviteAccepted() {
  return (
    <StateSuccess
      icon={Check}
      tone="ok"
      chip="Connected"
      title="You're connected."
      body="You and Arian are now in each other's network. Your new chat is ready in Messages."
      primary={{ label: "Open chat", to: path(routes.dmThread, { id: "arian" }) }}
      secondary={{ label: "View profile", to: path(routes.publicProfile, { id: "arian" }) }}
    />
  );
}
