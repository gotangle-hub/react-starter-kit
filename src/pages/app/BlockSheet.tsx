import { useNavigate } from "react-router-dom";
import { ReasonSheet } from "@/components/app/moderation";
import { routes } from "@/lib/routes";

export default function BlockSheet() {
  const navigate = useNavigate();
  return (
    <ReasonSheet
      title="Block this person"
      danger
      reasons={[
        "Harassment or bullying",
        "Spam or scam",
        "Impersonation",
        "Plagiarised my work",
        "Inappropriate messages",
        "I just don't want to interact",
      ]}
      submitLabel="Continue to block"
      onSubmit={() => navigate(routes.blockConfirm)}
    />
  );
}
