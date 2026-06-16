import { useNavigate } from "react-router-dom";
import { SettingsScaffold } from "@/components/app/settings-kit";
import { TextField } from "@/components/app/fields";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function AccountEmail() {
  const navigate = useNavigate();
  return (
    <SettingsScaffold title="Username & email">
      <div className="flex flex-col gap-5">
        <TextField label="Username" defaultValue="@munaabbas" />
        <TextField label="Email" mono defaultValue="muna@studio.co" />
        <Button full size="lg" variant="primary" className="mt-2" onClick={() => navigate(routes.settings)}>
          Save changes
        </Button>
      </div>
    </SettingsScaffold>
  );
}
