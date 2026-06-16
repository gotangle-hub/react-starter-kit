import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConfirmSheet } from "@/components/app/moderation";
import { routes } from "@/lib/routes";

export default function LogOutConfirm() {
  const navigate = useNavigate();
  return (
    <ConfirmSheet
      icon={LogOut}
      danger={false}
      title="Log out?"
      body="You'll need to sign in again to get back to your work, collaborations and connections."
      confirmLabel="Log out"
      onConfirm={() => navigate(routes.signIn)}
    />
  );
}
