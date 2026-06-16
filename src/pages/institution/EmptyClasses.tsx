import { BookOpen } from "lucide-react";
import { BackHeader } from "@/components/app/bits";
import { EmptyState } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

/** 72 · Empty state — no classes yet (G14). */
export default function EmptyClasses() {
  return (
    <EmptyState
      icon={BookOpen}
      title="No classes yet"
      body="When a professor adds you to a class, or you join with a class code, it appears here."
      cta={{ label: "Enter a class code", to: routes.studentClasses }}
      header={<BackHeader title="Classes" />}
      showTabBar={false}
    />
  );
}
