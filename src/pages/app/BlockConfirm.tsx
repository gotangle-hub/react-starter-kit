import { useNavigate } from "react-router-dom";
import { Ban } from "lucide-react";
import { ConfirmSheet } from "@/components/app/moderation";
import { routes } from "@/lib/routes";

export default function BlockConfirm() {
  const navigate = useNavigate();
  return (
    <ConfirmSheet
      icon={Ban}
      danger
      title="Block them?"
      body="They won't be able to find your profile, message you, or see your work. You can unblock from settings any time."
      confirmLabel="Block"
      onConfirm={() => navigate(routes.home)}
    />
  );
}
