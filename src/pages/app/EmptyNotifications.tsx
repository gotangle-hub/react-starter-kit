import { Bell } from "lucide-react";
import { EmptyState } from "@/components/app/state-screens";

export default function EmptyNotifications() {
  return (
    <EmptyState
      icon={Bell}
      title="You're all caught up"
      body="Likes, connection requests, comments and collaboration updates will show here."
    />
  );
}
