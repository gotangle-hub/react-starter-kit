import { MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

export default function EmptyMessages() {
  return (
    <EmptyState
      icon={MessageCircle}
      title="No messages yet"
      body="When you connect, match or start a collaboration, your chats land here."
      cta={{ label: "Find people", to: routes.match }}
    />
  );
}
