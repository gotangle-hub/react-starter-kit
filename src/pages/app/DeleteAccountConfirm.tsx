import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConfirmSheet } from "@/components/app/moderation";
import { routes } from "@/lib/routes";

export default function DeleteAccountConfirm() {
  const navigate = useNavigate();
  return (
    <ConfirmSheet
      icon={Trash2}
      danger
      title="Delete your account?"
      body="This permanently removes your profile, your work, your connections and your collaborations. This cannot be undone."
      confirmLabel="Delete account"
      cancelLabel="Keep my account"
      onConfirm={() => navigate(routes.signIn)}
    />
  );
}
