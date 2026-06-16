import { UsersRound } from "lucide-react";
import { EmptyState } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

export default function EmptyCollaborations() {
  return (
    <EmptyState
      icon={UsersRound}
      title="No collaborations yet"
      body="Start one from a competition, a call out, or straight from someone's profile. Collaborations can include a whole team."
      cta={{ label: "Find a project", to: routes.callouts }}
    />
  );
}
