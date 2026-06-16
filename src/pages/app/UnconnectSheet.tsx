import { useNavigate } from "react-router-dom";
import { ReasonSheet } from "@/components/app/moderation";
import { routes } from "@/lib/routes";

export default function UnconnectSheet() {
  const navigate = useNavigate();
  return (
    <ReasonSheet
      title="Why unconnect?"
      danger
      reasons={[
        "We don't really know each other",
        "No longer relevant",
        "Too many messages",
        "I connected by mistake",
        "I'd rather not say",
      ]}
      submitLabel="Continue"
      onSubmit={() => navigate(routes.unconnectConfirm)}
    />
  );
}
