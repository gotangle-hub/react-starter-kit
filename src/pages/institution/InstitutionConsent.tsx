import { useNavigate, useSearchParams } from "react-router-dom";
import { ConsentStep } from "@/components/app/consent-step";
import { saveMarketingOptIn } from "@/lib/marketing-opt-in";
import { routes } from "@/lib/routes";

/**
 * 09 · Legal consent — student/faculty. Branches by detected role: students get
 * the student-worded consent and student tour; faculty get the faculty wording
 * and faculty tour.
 */
export default function InstitutionConsent() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const faculty = params.get("role") === "faculty";
  return (
    <ConsentStep
      type={faculty ? "institution" : "student"}
      onAgree={async ({ marketingOptIn }) => {
        await saveMarketingOptIn(marketingOptIn);
        navigate(`${routes.welcome}?next=${faculty ? routes.tourFaculty : routes.tourStudent}`);
      }}
    />
  );
}
