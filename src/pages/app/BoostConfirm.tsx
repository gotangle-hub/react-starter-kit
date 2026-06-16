import { Megaphone } from "lucide-react";
import { StateSuccess } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

export default function BoostConfirm() {
  return (
    <StateSuccess
      icon={Megaphone}
      tone="ok"
      chip="Boost live"
      title="Your boost is running."
      body="Your work is now featured to the right designers for the next 7 days. Track reach in Promote."
      primary={{ label: "View reach stats", to: routes.promote }}
      secondary={{ label: "Done", to: routes.home }}
    />
  );
}
