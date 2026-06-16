import { useNavigate } from "react-router-dom";
import { ReasonSheet } from "@/components/app/moderation";
import { routes } from "@/lib/routes";

export default function UncollaborateSheet() {
  const navigate = useNavigate();
  return (
    <ReasonSheet
      title="Leave this collaboration?"
      subtitle="This works for group collaborations too."
      danger
      reasons={[
        "Project is finished",
        "Direction no longer fits",
        "Creative differences",
        "Partner is inactive",
        "Scope or workload changed",
        "I'd rather not say",
      ]}
      submitLabel="Continue"
      onSubmit={() => navigate(routes.uncollaborateConfirm)}
    />
  );
}
