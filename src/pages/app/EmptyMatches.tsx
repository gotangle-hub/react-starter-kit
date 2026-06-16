import { Layers, SlidersHorizontal } from "lucide-react";
import { EmptyState } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

export default function EmptyMatches() {
  return (
    <EmptyState
      icon={Layers}
      title="That's everyone for now"
      body="You've seen all the suggestions in your area today. Widen your filters or check back later for new designers and studios."
      cta={{ label: "Adjust filters", to: routes.matchFilters, icon: SlidersHorizontal }}
    />
  );
}
