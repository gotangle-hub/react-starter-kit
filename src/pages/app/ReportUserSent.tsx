import { Flag } from "lucide-react";
import { StateSuccess } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

export default function ReportUserSent() {
  return (
    <StateSuccess
      icon={Flag}
      tone="ok"
      chip="Report sent"
      title="Thanks — we're on it."
      body="Your report has gone to the Tangle review team. We'll follow up if we need anything more."
      primary={{ label: "Done", to: routes.home }}
      secondary={{ label: "Block this person", to: routes.blockSheet }}
    />
  );
}
