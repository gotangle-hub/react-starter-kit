import { ImagePlus, Plus } from "lucide-react";
import { EmptyState } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";

export default function EmptyWork() {
  return (
    <EmptyState
      icon={ImagePlus}
      title="Add your first work"
      body="Your profile comes alive once you add work. Upload photos or video, or import a PDF and we'll pull the projects out."
      cta={{ label: "Add work", to: routes.workUpload, icon: Plus }}
    />
  );
}
