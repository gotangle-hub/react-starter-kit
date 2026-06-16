import { Heart } from "lucide-react";
import { StateSuccess } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

/** 34 · Now following a maker — their new work appears in your Following feed. */
export default function FollowConfirm() {
  return (
    <StateSuccess
      icon={Heart}
      tone="blue"
      chip="Following"
      title="You're following Lina."
      body="Their new work will show in your Discover feed. Manage who you follow from your profile."
      primary={{ label: "Keep exploring", to: routes.collectorExplore }}
      secondary={{ label: "View profile", to: "/u/lina" }}
    />
  );
}
