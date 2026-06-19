import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ReasonSheet } from "@/components/app/moderation";
import { routes } from "@/lib/routes";

export default function BlockSheet() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { targetId?: string } };
  const [params] = useSearchParams();
  const targetId = location.state?.targetId ?? params.get("id") ?? null;

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
      onSubmit={(reason) =>
        navigate(routes.blockConfirm, { state: { targetId, reason } })
      }
    />
  );
}
