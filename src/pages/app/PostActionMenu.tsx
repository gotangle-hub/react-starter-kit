import { Bookmark, Share2, Flag } from "lucide-react";
import { ActionMenu } from "@/components/app/moderation";
import { routes } from "@/lib/routes";

export default function PostActionMenu() {
  return (
    <ActionMenu
      actions={[
        { icon: Bookmark, label: "Save / pin", sub: "Add to one of your pin ups", to: routes.pinToBoard },
        { icon: Share2, label: "Share" },
        {
          icon: Flag,
          label: "Report this post",
          sub: "Plagiarism, missing credit & more",
          danger: true,
          to: routes.reportPost,
        },
      ]}
    />
  );
}
