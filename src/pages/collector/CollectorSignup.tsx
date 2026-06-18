import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { Logo } from "@/components/brand/logo";
import { Chip } from "@/components/brand/chip";
import { Meta, Pill } from "@/components/brand/atoms";
import { LocationField, TextField } from "@/components/app/fields";
import { UsernamePicker } from "@/components/app/username-picker";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { supabase } from "@/integrations/supabase/client";
import { checkUsernameAvailable } from "@/services/usernames";

const TAGS = ["Architecture", "Interiors", "Product", "Type & lettering", "Ceramics", "Textiles", "Photography", "Furniture", "Graphic", "Illustration", "Landscape", "Jewellery"];

/** 04 · Create a collector account — lightweight; browse, follow and save. */
export default function CollectorSignup() {
  const navigate = useNavigate();
  const [tags, setTags] = useState<Set<string>>(new Set(["Architecture", "Product", "Ceramics"]));
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameOk, setUsernameOk] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = (t: string) =>
    setTags((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });

  const handleContinue = async () => {
    setError(null);
    if (!email || !password) {
      setError("Enter an email and password to continue.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!usernameOk) {
      setError("Pick an available username to continue.");
      return;
    }
    const stillFree = await checkUsernameAvailable(username);
    if (!stillFree) {
      setError("That username was just taken — try another.");
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${routes.collectorHome}`,
        data: {
          account_type: "collector",
          display_name: name || undefined,
          username,
          disciplines: Array.from(tags),
        },
      },
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate(routes.verifyEmail, { state: { email: email.trim(), next: routes.collectorConsent } });
  };

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          {error && (
            <p className="mb-2 text-[12.5px] text-tg-terra" role="alert">
              {error}
            </p>
          )}
          <Button full size="lg" onClick={handleContinue} disabled={busy}>
            {busy ? "Creating account…" : "Start collecting"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-none items-center justify-between px-[22px] pt-1.5">
        <Logo size={19} />
        <Meta>Collector</Meta>
      </div>

      <div className="px-[22px] py-3.5">
        <Chip>Collector</Chip>
        <h1 className="mb-2 mt-3 font-serif text-[31px] font-medium leading-[1.05] tracking-[-0.025em]">
          Collect the design you love.
        </h1>
        <p className="mb-[18px] font-body text-[14px] leading-relaxed text-tg-brown">
          A free account to browse, follow makers and save work into collections. No portfolio needed.
        </p>

        <div className="flex flex-col gap-3">
          <TextField
            label="Name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <UsernamePicker
            value={username}
            onChange={setUsername}
            onValidityChange={(s) => setUsernameOk(s.valid && s.available)}
            label="Username"
            baseSuggestion={name}
          />
          <TextField
            label="Email"
            mono
            icon={<Mail size={17} />}
            type="email"
            placeholder="you@home.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            icon={<Lock size={17} />}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <LocationField label="Where you're based" defaultValue="Dubai, UAE" />
          <div>
            <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">What do you love?</div>
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map((t) => (
                <Pill key={t} small on={tags.has(t)} onClick={() => toggle(t)}>{t}</Pill>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-[18px] flex items-center gap-3 rounded-DEFAULT bg-tg-stone2 p-3.5">
          <Sparkles size={18} className="text-tg-blue-accent" />
          <span className="font-body text-[12.5px] leading-snug text-tg-brown">
            Your Discover feed is built from what you save and follow — it gets sharper over time.
          </span>
        </div>
      </div>
    </MobileShell>
  );
}
