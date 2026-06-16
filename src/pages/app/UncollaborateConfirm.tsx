import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { ConfirmSheet } from "@/components/app/moderation";
import { routes } from "@/lib/routes";

export default function UncollaborateConfirm() {
  const navigate = useNavigate();
  return (
    <ConfirmSheet
      icon={LogOut}
      danger
      title="Leave the collaboration?"
      body="You'll be removed from the group chat and its planning tools. The others can carry on without you."
      confirmLabel="Leave collaboration"
      onConfirm={() => navigate(routes.collabs)}
    />
  );
}
