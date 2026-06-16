import { useNavigate } from "react-router-dom";
import { ConsentStep } from "@/components/app/consent-step";
import { routes } from "@/lib/routes";

/** 04 · Legal consent — client (deliver, pay on time, respect IP & credit). */
export default function ClientConsent() {
  const navigate = useNavigate();
  return (
    <ConsentStep
      type="client"
      onAgree={() => navigate(`${routes.welcome}?next=${routes.tourClient}`)}
    />
  );
}
