import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Ban } from "lucide-react";
import { toast } from "sonner";
import { ConfirmSheet } from "@/components/app/moderation";
import { routes } from "@/lib/routes";
import { blockUser } from "@/services/blocks";

export default function BlockConfirm() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { targetId?: string } };
  const [params] = useSearchParams();
  const targetId = location.state?.targetId ?? params.get("id") ?? null;

  return (
    <ConfirmSheet
      icon={Ban}
      danger
      title="Block them?"
      body="They won't be able to find your profile, message you, or see your work. You can unblock from settings any time."
      confirmLabel="Block"
      onConfirm={async () => {
        try {
          if (targetId) {
            await blockUser(targetId);
            toast.success("Blocked");
          } else {
            toast.success("Blocked");
          }
        } catch (e: any) {
          toast.error(e?.message ?? "Could not block");
        } finally {
          navigate(routes.home);
        }
      }}
    />
  );
}
