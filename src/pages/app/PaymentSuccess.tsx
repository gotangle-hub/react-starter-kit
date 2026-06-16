import { Check } from "lucide-react";
import { StateSuccess } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

export default function PaymentSuccess() {
  return (
    <StateSuccess
      icon={Check}
      tone="ok"
      chip="Payment complete"
      title="Payment received."
      body="Thank you — your plan is active. A receipt has been emailed to you and saved under Billing."
      primary={{ label: "Done", to: routes.home }}
      secondary={{ label: "View billing", to: routes.billing }}
    />
  );
}
