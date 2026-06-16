import { ImagePlus, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SettingsScaffold } from "@/components/app/settings-kit";
import { TextField, LocationField } from "@/components/app/fields";
import { Pill } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { me, disciplines } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

export default function EditProfileSettings() {
  const navigate = useNavigate();
  return (
    <SettingsScaffold title="Edit profile">
      <div className="flex flex-col gap-5">
        <div>
          <span className="mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
            Banner & avatar
          </span>
          <div className="relative">
            <button
              type="button"
              className="flex h-28 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-tg-line bg-tg-stone2 text-tg-brown"
            >
              <ImagePlus size={18} />
              <span className="font-display text-[13px] font-medium">Upload banner</span>
            </button>
            <button
              type="button"
              className="absolute -bottom-5 left-4 flex h-16 w-16 items-center justify-center rounded-pill border border-dashed border-tg-line bg-tg-card text-tg-brown shadow-card"
            >
              <UserCircle2 size={22} />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <TextField label="Name" defaultValue={me.name} />
        </div>

        <label className="block">
          <span className="mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
            Bio
          </span>
          <textarea
            rows={3}
            defaultValue={me.bio}
            className="w-full resize-none rounded-DEFAULT border border-tg-line bg-tg-card px-3.5 py-3 text-[14.5px] text-tg-ink outline-none placeholder:text-tg-brown-soft focus:border-tg-blue-accent"
          />
        </label>

        <div>
          <span className="mb-2 block font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
            Disciplines
          </span>
          <div className="flex flex-wrap gap-2">
            {disciplines.map((d) => (
              <Pill key={d} on={me.disciplines.includes(d)}>
                {d}
              </Pill>
            ))}
          </div>
        </div>

        <LocationField label="Location" defaultValue={me.city} />

        <Button full size="lg" variant="primary" className="mt-2" onClick={() => navigate(routes.settings)}>
          Save changes
        </Button>
      </div>
    </SettingsScaffold>
  );
}
