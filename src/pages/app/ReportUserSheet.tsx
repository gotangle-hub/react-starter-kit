import { useNavigate } from "react-router-dom";
import { ReasonSheet } from "@/components/app/moderation";
import { routes } from "@/lib/routes";

export default function ReportUserSheet() {
  const navigate = useNavigate();
  return (
    <ReasonSheet
      title="Report this person"
      reasons={[
        "Plagiarism — passes off others' work",
        "Doesn't credit teammates or collaborators",
        "Fake or impersonated profile",
        "Harassment or abuse",
        "Scam, fraud or fake hiring",
        "Misleading credentials or verification",
        "Posts spam",
      ]}
      note="Reports are confidential and go straight to the Tangle review team."
      submitLabel="Submit report"
      onSubmit={() => navigate(routes.reportUserSent)}
    />
  );
}
