import { Hand } from "lucide-react";
import { StateSuccess } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

export default function InterestedConfirm() {
  return (
    <StateSuccess
      icon={Hand}
      tone="yellow"
      chip="Marked interested"
      title="You're on the interested list."
      body="The organiser can see you're keen. Want to take it further? Start a collaboration and pull in the people you'd build it with."
      primary={{ label: "Create collaboration", to: routes.partnerMatch }}
      secondary={{ label: "See who's interested (Pro)", to: routes.plans }}
    />
  );
}
