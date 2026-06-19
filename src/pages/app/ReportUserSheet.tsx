import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ReasonSheet } from "@/components/app/moderation";
import { routes } from "@/lib/routes";
import { supabase } from "@/integrations/supabase/client";

export default function ReportUserSheet() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { targetId?: string } };
  const [params] = useSearchParams();

  return (
    <ReasonSheet
      title="Report this person"
      reasons={[
        "Plagiarism — passes off others' work",
        "Doesn't credit teammates or collaborators",
        "Fake or impersonated profile",
        "Harassment or abuse",
        "Scam, fraud or fake hiring",
        "Misleading credentials or verification",
        "Posts spam",
      ]}
      note="Reports are confidential and go straight to the Tangle review team."
      submitLabel="Submit report"
      onSubmit={async (reason, details) => {
        const targetId = location.state?.targetId ?? params.get("id");
        try {
          const { data: u } = await supabase.auth.getUser();
          if (u.user && targetId) {
            const { error } = await supabase.from("reports").insert({
              reporter_id: u.user.id,
              target_type: "user",
              target_id: targetId,
              reason: reason ?? "Unspecified",
              details: details || null,
            });
            if (error) throw error;
          }
          toast.success("Report sent to the Tangle review team");
        } catch (e: any) {
          toast.error(e?.message ?? "Could not send report");
        } finally {
          navigate(routes.reportUserSent);
        }
      }}
    />
  );
}
