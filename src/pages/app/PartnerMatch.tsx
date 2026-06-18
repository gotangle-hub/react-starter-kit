import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Hand } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Avatar } from "@/components/brand/avatar";
import { NameRow, Meta } from "@/components/brand/atoms";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { routes, path } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { makerFromProfile, type ProfileRow } from "@/services/profile";
import { createCollaboration } from "@/services/collaborations";

/**
 * 36 · Find a partner (G2, G10) — pick collaborators, then create a real
 * collaboration with the selected group and jump into its chat.
 */
export default function PartnerMatch() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const compName = sp.get("comp") || "New collaboration";
  const compMeta = sp.get("meta") || "";

  const [suggested, setSuggested] = useState<ProfileRow[]>([]);
  const [looking, setLooking] = useState(true);
  const [team, setTeam] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let q = supabase
        .from("profiles")
        .select("id, account_type, display_name, username, disciplines, bio, location, links, avatar_path, banner_path, created_at, updated_at")
        .not("username", "is", null)
        .limit(12);
      if (user) q = q.neq("id", user.id);
      const { data } = await q;
      setSuggested(((data ?? []) as ProfileRow[]).filter((p) => p.display_name || p.username));
    })();
  }, []);

  const toggle = (id: string) =>
    setTeam((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  const selected = suggested.filter((m) => team.includes(m.id));

  const invite = async () => {
    if (selected.length === 0) return;
    setSubmitting(true);
    try {
      const collabId = await createCollaboration(compName, compMeta, selected.map((s) => s.id));
      navigate(path(routes.projectChat, { id: collabId }));
    } catch (e) {
      console.warn("create collab failed", e);
      setSubmitting(false);
    }
  };

  return (
    <MobileShell header={<BackHeader title="Find a partner" />}>
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-8">
        <div className="mt-3">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-tg-brown">
            Collaboration
          </span>
          <h1 className="mt-1.5 font-serif text-[24px] font-medium leading-[1.1] tracking-[-0.02em] text-tg-ink">
            {compName}
          </h1>
          {compMeta && <Meta className="mt-1.5 block">{compMeta}</Meta>}
        </div>

        <Card className="mt-4 flex items-center gap-3 bg-tg-emph p-3.5 text-tg-emph-text">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-pill bg-white/15">
            <Hand size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[13.5px] font-semibold">
              You&apos;re looking for a partner
            </div>
            <div className="mt-0.5 font-mono text-[11px] opacity-70">
              Others can find you for this collaboration.
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={looking}
            onClick={() => setLooking((v) => !v)}
            className={cn(
              "relative h-6 w-11 flex-none rounded-pill transition-colors",
              looking ? "bg-tg-yellow" : "bg-white/25",
            )}
          >
            <span
              className={cn(
                "absolute top-[3px] h-[18px] w-[18px] rounded-pill bg-white transition-all",
                looking ? "right-[3px]" : "left-[3px]",
              )}
            />
          </button>
        </Card>

        <h2 className="mt-6 font-serif text-[18px] font-medium tracking-[-0.01em] text-tg-ink">
          Suggested · open to teams
        </h2>
        <Meta className="mt-1 block">
          Build a group — add more than one partner.
        </Meta>

        <div className="mt-3.5 flex flex-col gap-2.5">
          {suggested.length === 0 && <Meta>No suggested partners yet.</Meta>}
          {suggested.map((p) => (
            <PartnerRow
              key={p.id}
              profile={p}
              on={team.includes(p.id)}
              onToggle={() => toggle(p.id)}
            />
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex-none border-t border-tg-line bg-tg-card px-[22px] py-3.5">
          <div className="flex items-center justify-between">
            <Meta>
              {selected.length} {selected.length === 1 ? "partner" : "partners"} selected
            </Meta>
            <button
              type="button"
              onClick={() => setTeam([])}
              className="font-mono text-[11px] uppercase tracking-[0.06em] text-tg-terra"
            >
              Clear
            </button>
          </div>
          <div className="mt-2.5 flex items-center gap-3">
            <div className="flex -space-x-2">
              {selected.map((p) => (
                <Avatar key={p.id} maker={makerFromProfile(p)} size={34} ring />
              ))}
            </div>
            <Button full className="flex-1" onClick={invite} disabled={submitting}>
              {submitting ? "Creating…" : `Invite ${selected.length > 1 ? "group" : (selected[0].display_name || selected[0].username || "")}`}
            </Button>
          </div>
        </div>
      )}
    </MobileShell>
  );
}

function PartnerRow({
  profile,
  on,
  onToggle,
}: {
  profile: ProfileRow;
  on: boolean;
  onToggle: () => void;
}) {
  const maker = makerFromProfile(profile);
  return (
    <Card className="flex items-center gap-3 p-3">
      <Avatar maker={maker} size={46} />
      <div className="min-w-0 flex-1">
        <NameRow maker={maker} size={14.5} />
        <Meta className="mt-0.5 block">
          {(profile.disciplines?.[0] as string | undefined) ?? "Designer"}
          {profile.location && ` · ${profile.location}`}
        </Meta>
      </div>
      <Button variant={on ? "primary" : "outline"} size="sm" onClick={onToggle}>
        {on ? (
          <>
            <Check size={14} className="mr-1" />
            Added
          </>
        ) : (
          "Invite"
        )}
      </Button>
    </Card>
  );
}
