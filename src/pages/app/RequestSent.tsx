import { UserPlus } from "lucide-react";
import { StateSuccess } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

export default function RequestSent() {
  return (
    <StateSuccess
      icon={UserPlus}
      tone="blue"
      chip="Request sent"
      title="Connection requested."
      body="We've let them know you'd like to connect. When they accept, you'll both appear in each other's network and a chat opens."
      primary={{ label: "Done", to: routes.home }}
      secondary={{ label: "Undo request", to: routes.home }}
    />
  );
}
