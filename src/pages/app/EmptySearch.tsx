import { SearchX, ScanSearch } from "lucide-react";
import { EmptyState } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

export default function EmptySearch() {
  return (
    <EmptyState
      icon={SearchX}
      title="No results for that"
      body="Try fewer words, a different discipline, or search by image instead."
      cta={{ label: "Search by image", to: routes.searchVisual, icon: ScanSearch }}
    />
  );
}
