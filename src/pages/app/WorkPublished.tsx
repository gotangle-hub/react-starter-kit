import { Check } from "lucide-react";
import { StateSuccess } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

export default function WorkPublished() {
  return (
    <StateSuccess
      icon={Check}
      tone="ok"
      chip="Published"
      title="Your work is live."
      body="It's on your profile now. Add it to Explore too so more designers can find it."
      primary={{ label: "Add to Explore", to: routes.addToExplore }}
      secondary={{ label: "View profile", to: routes.profile }}
    />
  );
}
