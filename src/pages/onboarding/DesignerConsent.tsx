import { useNavigate } from "react-router-dom";
import { ConsentStep } from "@/components/app/consent-step";
import { saveMarketingOptIn } from "@/lib/marketing-opt-in";
import { routes } from "@/lib/routes";

/** 09 · Legal consent — designer. */
export default function DesignerConsent() {
  const navigate = useNavigate();
  return (
    <ConsentStep
      type="designer"
      onAgree={async ({ marketingOptIn }) => {
        await saveMarketingOptIn(marketingOptIn);
        navigate(routes.welcome);
      }}
    />
  );
}
