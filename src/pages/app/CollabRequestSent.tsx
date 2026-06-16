import { UsersRound } from "lucide-react";
import { StateSuccess } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

export default function CollabRequestSent() {
  return (
    <StateSuccess
      icon={UsersRound}
      tone="blue"
      chip="Invite sent"
      title="Collaboration invite sent."
      body="If they accept, a shared project chat opens for everyone involved — collaborations can include more than two people."
      primary={{ label: "Done", to: routes.messages }}
    />
  );
}
