import { useNavigate } from "react-router-dom";
import { ConsentStep } from "@/components/app/consent-step";
import { routes } from "@/lib/routes";

/** 05 · Legal consent — collector (respect copyright, never repost as your own). */
export default function CollectorConsent() {
  const navigate = useNavigate();
  return (
    <ConsentStep
      type="collector"
      onAgree={() => navigate(`${routes.welcome}?next=${routes.tourCollector}`)}
    />
  );
}
