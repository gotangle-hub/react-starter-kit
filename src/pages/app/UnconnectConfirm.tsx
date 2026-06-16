import { useNavigate } from "react-router-dom";
import { UserMinus } from "lucide-react";
import { ConfirmSheet } from "@/components/app/moderation";
import { routes } from "@/lib/routes";

export default function UnconnectConfirm() {
  const navigate = useNavigate();
  return (
    <ConfirmSheet
      icon={UserMinus}
      danger
      title="Unconnect?"
      body="You'll be removed from each other's network. This doesn't affect any shared collaborations."
      confirmLabel="Unconnect"
      onConfirm={() => navigate(routes.home)}
    />
  );
}
