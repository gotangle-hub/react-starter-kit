import { MessageCircle, Flag, Ban, UserMinus } from "lucide-react";
import { ActionMenu } from "@/components/app/moderation";
import { routes, path } from "@/lib/routes";

export default function UserActionMenu() {
  return (
    <ActionMenu
      actions={[
        { icon: MessageCircle, label: "Message", to: path(routes.dmThread, { id: "lina" }) },
        { icon: Flag, label: "Report this person", danger: true, to: routes.reportUser },
        { icon: Ban, label: "Block", danger: true, to: routes.blockSheet },
        { icon: UserMinus, label: "Unconnect", danger: true, to: routes.unconnectSheet },
      ]}
    />
  );
}
