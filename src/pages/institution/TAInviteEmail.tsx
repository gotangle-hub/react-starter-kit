import { useEffect, useState } from "react";
import { ExternalLink, Shapes } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Logo } from "@/components/brand/logo";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { listPendingInvites, type ClassInvite } from "@/services/classes";

/** 27 · Preview of the TA invite email; tapping the CTA opens the accept page with the real token. */
export default function TAInviteEmail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [invite, setInvite] = useState<ClassInvite | null>(null);
  const [className, setClassName] = useState("This class");

  useEffect(() => {
    if (!id) return;
    listPendingInvites(id).then((rows) => setInvite(rows[0] ?? null));
    supabase.from("classes").select("name").eq("id", id).maybeSingle().then(({ data }) => {
      if (data?.name) setClassName(data.name);
    });
  }, [id]);

  return (
    <MobileShell>
      <BackHeader title="TA invite" />

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-3.5 pb-6">
        <div className="overflow-hidden rounded-[16px] border border-tg-line bg-tg-card">
          <div className="flex items-center gap-3 border-b border-tg-line px-4 py-3.5">
            <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-pill bg-tg-emph">
              <Logo size={16} onDark />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-[14px] font-semibold text-tg-ink">Tangle</div>
              <Meta className="mt-0.5 block">from team@tangle.app · to {invite?.email ?? "your TA"}</Meta>
            </div>
            <Meta>now</Meta>
          </div>

          <div className="px-4 py-4">
            <Meta className="block uppercase tracking-[0.1em]">Subject</Meta>
            <h1 className="mt-1.5 font-serif text-[22px] font-medium leading-[1.15] tracking-[-0.01em]">
              You&apos;ve been invited to assist {className}.
            </h1>
            <p className="mt-3 font-body text-[14px] leading-[1.6] text-tg-ink">
              You&apos;ve been invited to assist <b>{className}</b> as a TA. Open the class in Tangle to review what a TA can do and accept.
            </p>

            <div className="my-4 flex items-center gap-3 rounded-[14px] border border-tg-line bg-tg-stone2 p-3.5">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[11px] bg-tg-blue">
                <Shapes size={21} className="text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-[14.5px] font-semibold text-tg-ink">{className}</div>
                <Meta className="mt-0.5 block">Private class on Tangle</Meta>
              </div>
            </div>

            <Button
              full
              size="lg"
              disabled={!invite}
              onClick={() => invite && navigate(routes.taInviteAccept.replace(":token", invite.token))}
            >
              <ExternalLink size={17} />
              Open in Tangle to accept
            </Button>

            <Meta className="mt-3 block text-center">
              This invite is tied to {invite?.email ?? "the TA email"}.
            </Meta>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
