import { useNavigate } from "react-router-dom";
import { ConsentStep } from "@/components/app/consent-step";
import { routes } from "@/lib/routes";

/** 06 · Legal consent — studio (same 3-checkbox structure, studio-worded). */
export default function StudioConsent() {
  const navigate = useNavigate();
  return (
    <ConsentStep
      type="studio"
      onAgree={() => navigate(`${routes.welcome}?next=${routes.tourStudio}`)}
    />
  );
}
