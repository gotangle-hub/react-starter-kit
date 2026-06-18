import { useEffect, useRef, useState } from "react";
import { ImagePlus, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SettingsScaffold } from "@/components/app/settings-kit";
import { TextField, LocationField } from "@/components/app/fields";
import { Pill } from "@/components/brand/atoms";
import { UsernamePicker } from "@/components/app/username-picker";
import { Button } from "@/components/ui/button";
import { disciplines as allDisciplines } from "@/lib/fixtures";
import { routes } from "@/lib/routes";
import { getMyProfile, updateMyProfile, workPublicUrl } from "@/services/profile";
import { uploadService } from "@/services/uploads";
import { checkUsernameAvailable, normalizeUsername } from "@/services/usernames";

export default function EditProfileSettings() {
  const navigate = useNavigate();
  const bannerInput = useRef<HTMLInputElement>(null);
  const avatarInput = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [username, setUsername] = useState("");
  const [usernameOk, setUsernameOk] = useState(true);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [bannerPath, setBannerPath] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await getMyProfile();
      if (p) {
        setName(p.display_name ?? "");
        setUsername(p.username ?? "");
        setOriginalUsername(p.username ?? "");
        setBio(p.bio ?? "");
        setLocation(p.location ?? "");
        setPicked(p.disciplines ?? []);
        setAvatarPath(p.avatar_path ?? null);
        setBannerPath(p.banner_path ?? null);
        const links = (p.links ?? {}) as Record<string, string>;
        setWebsite(links.website ?? "");
        setInstagram(links.instagram ?? "");
      }
      setLoading(false);
    })();
  }, []);

  function toggle(d: string) {
    setPicked((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  async function pickFile(kind: "avatar" | "banner", file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const sub = `${kind}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
      const result = await uploadService.upload("work", sub, file);
      if (kind === "avatar") setAvatarPath(result.path);
      else setBannerPath(result.path);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    try {
      const targetUsername = normalizeUsername(username);
      // Only re-check uniqueness if the handle changed.
      if (targetUsername !== normalizeUsername(originalUsername)) {
        if (!usernameOk) {
          // eslint-disable-next-line no-alert
          alert("Pick an available username to save.");
          setBusy(false);
          return;
        }
        if (!(await checkUsernameAvailable(targetUsername))) {
          // eslint-disable-next-line no-alert
          alert("That username was just taken — try another.");
          setBusy(false);
          return;
        }
      }
      await updateMyProfile({
        display_name: name || null,
        username: targetUsername,
        bio: bio || null,
        location: location || null,
        disciplines: picked,
        avatar_path: avatarPath,
        banner_path: bannerPath,
        links: {
          ...(website ? { website } : {}),
          ...(instagram ? { instagram } : {}),
        },
      });
      navigate(routes.settings);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  const bannerUrl = workPublicUrl(bannerPath);
  const avatarUrl = workPublicUrl(avatarPath);

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
              onClick={() => bannerInput.current?.click()}
              className="flex h-28 w-full items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed border-tg-line bg-tg-stone2 text-tg-brown"
              style={
                bannerUrl
                  ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : undefined
              }
            >
              {!bannerUrl && (
                <>
                  <ImagePlus size={18} />
                  <span className="font-display text-[13px] font-medium">Upload banner</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => avatarInput.current?.click()}
              className="absolute -bottom-5 left-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-pill border border-dashed border-tg-line bg-tg-card text-tg-brown shadow-card"
              style={
                avatarUrl
                  ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : undefined
              }
            >
              {!avatarUrl && <UserCircle2 size={22} />}
            </button>
            <input
              ref={bannerInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => pickFile("banner", e.target.files?.[0])}
            />
            <input
              ref={avatarInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => pickFile("avatar", e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="mt-4">
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <UsernamePicker
          value={username}
          onChange={setUsername}
          onValidityChange={(s) => setUsernameOk((s.valid && s.available) || normalizeUsername(username) === normalizeUsername(originalUsername))}
          label="Username"
          baseSuggestion={name}
        />

        <label className="block">
          <span className="mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
            Bio
          </span>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full resize-none rounded-DEFAULT border border-tg-line bg-tg-card px-3.5 py-3 text-[14.5px] text-tg-ink outline-none placeholder:text-tg-brown-soft focus:border-tg-blue-accent"
          />
        </label>

        <div>
          <span className="mb-2 block font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
            Disciplines
          </span>
          <div className="flex flex-wrap gap-2">
            {allDisciplines.map((d) => (
              <button key={d} type="button" onClick={() => toggle(d)}>
                <Pill on={picked.includes(d)}>{d}</Pill>
              </button>
            ))}
          </div>
        </div>

        <LocationField label="Location" defaultValue={location} onChange={setLocation} />

        <TextField label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
        <TextField label="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle" />

        <Button full size="lg" variant="primary" className="mt-2" onClick={save} disabled={busy || loading}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </SettingsScaffold>
  );
}
