import { useNavigate } from "react-router-dom";
import { ConsentStep } from "@/components/app/consent-step";
import { saveMarketingOptIn } from "@/lib/marketing-opt-in";
import { routes } from "@/lib/routes";

/** 06 · Legal consent — studio (same 3-checkbox structure, studio-worded). */
export default function StudioConsent() {
  const navigate = useNavigate();
  return (
    <ConsentStep
      type="studio"
      onAgree={async ({ marketingOptIn }) => {
        await saveMarketingOptIn(marketingOptIn);
        navigate(`${routes.welcome}?next=${routes.tourStudio}`);
      }}
    />
  );
}
