import { useEffect, useState } from "react";
import { Check, Shapes, ShieldCheck, X } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { routes, path } from "@/lib/routes";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { acceptClassInvite } from "@/services/classes";

const CAN = ["Post documents and lectures", "Help run the class group chat", "Add and share references"];
const CANNOT = ["Delete the class", "Change the roster"];

export default function TAInviteAccept() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [className, setClassName] = useState("This class");
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    supabase.rpc("get_class_invite_for_acceptance", { _token: token })
      .then(({ data }) => {
        const rows = Array.isArray(data) ? data : data ? [data] : [];
        const row = rows[0] as { email?: string; class_name?: string } | undefined;
        if (row?.email) setEmail(row.email);
        if (row?.class_name) setClassName(row.class_name);
      });
  }, [token]);


  const accept = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const classId = await acceptClassInvite(token);
      navigate(path(routes.studioClassPage, { id: classId }));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not accept invite.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobileShell
      footer={
        <div className="flex-none border-t border-tg-line px-[22px] pb-7 pt-3">
          <Button full size="lg" onClick={accept} disabled={busy || !token}>
            <Check size={16} />
            {busy ? "Joining…" : "Accept & join as TA"}
          </Button>
          <div className="mt-2.5">
            <Button variant="ghost" full size="md" onClick={() => navigate(-1)}>Decline</Button>
          </div>
        </div>
      }
    >
      <BackHeader title="Join as TA" />

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-3.5 pb-4">
        <div className="mb-[18px] flex items-center gap-3 rounded-[16px] border border-tg-line bg-tg-card p-4">
          <span className="flex h-[50px] w-[50px] flex-none items-center justify-center rounded-[13px] bg-tg-blue">
            <Shapes size={24} className="text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[16px] font-semibold text-tg-ink">{className}</div>
            <Meta className="mt-1 block">Private class</Meta>
          </div>
        </div>

        <h1 className="font-serif text-[27px] font-medium leading-[1.08] tracking-[-0.02em]">Join as a teaching assistant.</h1>
        <p className="my-2.5 font-body text-[14px] leading-relaxed text-tg-brown">You were invited to help run this class.</p>

        {err && <div className="mb-3 rounded-md border border-tg-line bg-tg-card p-3 font-body text-[12.5px] text-tg-ink">{err}</div>}

        <div className="mb-2 mt-4 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">What a TA can do</div>
        <div className="flex flex-col gap-2.5">
          {CAN.map((c) => (
            <div key={c} className="flex items-center gap-3">
              <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-pill bg-tg-stone2">
                <Check size={13} strokeWidth={3} className="text-tg-blue-accent" />
              </span>
              <span className="font-body text-[13.5px] leading-snug text-tg-ink">{c}</span>
            </div>
          ))}
        </div>

        <div className="mb-2 mt-5 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">What a TA can&apos;t do</div>
        <div className="flex flex-col gap-2.5">
          {CANNOT.map((c) => (
            <div key={c} className="flex items-center gap-3">
              <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-pill bg-tg-stone2">
                <X size={13} strokeWidth={3} className="text-tg-brown-soft" />
              </span>
              <span className="font-body text-[13.5px] leading-snug text-tg-brown">{c}</span>
            </div>
          ))}
        </div>

        {email && (
          <div className="mt-[18px] flex items-center gap-2 rounded-[12px] bg-tg-stone2 p-3.5">
            <ShieldCheck size={15} className="flex-none text-tg-brown-soft" />
            <Meta>Invite for {email}</Meta>
            <VerifiedBadge size={15} />
          </div>
        )}
      </div>
    </MobileShell>
  );
}
