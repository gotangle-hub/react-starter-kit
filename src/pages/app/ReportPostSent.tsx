import { Flag } from "lucide-react";
import { StateSuccess } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

export default function ReportPostSent() {
  return (
    <StateSuccess
      icon={Flag}
      tone="ok"
      chip="Report sent"
      title="Thanks — we're on it."
      body="Your report has gone to the Tangle review team. We review every report and act on plagiarism and missing credit."
      primary={{ label: "Done", to: routes.explore }}
      secondary={{ label: "Block this person too", to: routes.blockSheet }}
    />
  );
}
