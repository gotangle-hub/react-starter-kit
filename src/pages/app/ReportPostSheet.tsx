import { useNavigate } from "react-router-dom";
import { ReasonSheet } from "@/components/app/moderation";
import { routes } from "@/lib/routes";

export default function ReportPostSheet() {
  const navigate = useNavigate();
  return (
    <ReasonSheet
      title="Report this post"
      reasons={[
        "Plagiarism — copied someone's work",
        "Didn't credit teammates or collaborators",
        "Stolen or misused client work",
        "Misleading or fake project",
        "Hateful, explicit or harmful content",
        "Spam or advertising",
        "Infringes my copyright",
      ]}
      note="Reports are confidential and go straight to the Tangle review team."
      submitLabel="Submit report"
      onSubmit={() => navigate(routes.reportPostSent)}
    />
  );
}
