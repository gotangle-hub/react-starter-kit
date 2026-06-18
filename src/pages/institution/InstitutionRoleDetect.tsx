import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Check, ChevronRight, GraduationCap, Loader2, Presentation, ShieldAlert, Unlock } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { useSession } from "@/hooks/use-session";
import { authService } from "@/services/auth";
import { linkMembership, recallInstitution, setInstitutionRole, type Institution } from "@/services/institutions";

/**
 * 06 · Role detected (G13). After SSO/OTP sign-in we hand the chosen
 * institution to the server-side `link_institution_membership` RPC which
 * (a) checks the user's verified auth email against the institution's
 * registered domains and (b) applies that institution's own faculty/student
 * regex rules to decide the role. The link, email and role are persisted on
 * the profile in a single transaction. If the domain doesn't match we sign
 * the user out and send them back. If detection is ambiguous we ask the user
 * to confirm — but they cannot self-promote to a campus they don't belong to.
 */
type State =
  | { kind: "verifying" }
  | { kind: "verified"; role: "faculty" | "student"; email: string; ambiguous: boolean }
  | { kind: "ambiguous"; email: string }
  | { kind: "domain_mismatch"; email: string; expected: string }
  | { kind: "error"; message: string };

export default function InstitutionRoleDetect() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const [inst, setInst] = useState<Institution | null>(null);
  const [state, setState] = useState<State>({ kind: "verifying" });

  useEffect(() => { setInst(recallInstitution()); }, []);

  useEffect(() => {
    if (loading || !inst) return;
    if (!session?.user) {
      navigate(routes.institutionLogin, { replace: true });
      return;
    }
    let active = true;
    (async () => {
      const res = await linkMembership(inst.id);
      if (!active) return;
      if ("ok" in res && res.ok) {
        if (res.role) setState({ kind: "verified", role: res.role, email: res.email, ambiguous: false });
        else setState({ kind: "ambiguous", email: res.email });
      } else if ("reason" in res && res.reason === "domain_mismatch") {
        setState({ kind: "domain_mismatch", email: res.email, expected: res.expected_domain });
      } else {
        const msg = (res as { reason: string; message?: string }).message ?? "Could not verify your campus membership.";
        setState({ kind: "error", message: msg });
      }
    })();
    return () => { active = false; };
  }, [loading, session?.user?.id, inst, navigate]);

  if (!inst) {
    return (
      <MobileShell>
        <BackHeader title="Welcome to your campus" />
        <div className="flex min-h-0 flex-1 flex-col justify-center px-[22px]">
          <Meta>No institution selected.</Meta>
          <Button className="mt-4" onClick={() => navigate(routes.institutionFind)}>Find your school</Button>
        </div>
      </MobileShell>
    );
  }

  // Domain mismatch — sign user out so they retry with the right account.
  if (state.kind === "domain_mismatch") {
    return (
      <MobileShell
        footer={
          <div className="flex-none px-[22px] pb-7 flex flex-col gap-2.5">
            <Button full size="lg" onClick={async () => { await authService.signOut(); navigate(routes.institutionLogin, { replace: true }); }}>
              Use my @{state.expected} email
            </Button>
            <Button full variant="ghost" onClick={() => navigate(routes.institutionFind, { replace: true })}>
              Pick a different school
            </Button>
          </div>
        }
      >
        <BackHeader title="We can't link this account" />
        <div className="flex min-h-0 flex-1 flex-col justify-center px-[22px]">
          <ShieldAlert size={28} className="text-tg-terra mb-3" />
          <h1 className="font-serif text-[26px] font-medium leading-[1.08] tracking-[-0.02em]">
            That isn&apos;t a {inst.name} email.
          </h1>
          <p className="mt-2.5 font-body text-[14px] leading-relaxed text-tg-brown">
            You signed in as <span className="font-mono">{state.email}</span>. To join the {inst.name} campus you need to sign in with an
            <span className="font-mono"> @{state.expected}</span> address.
          </p>
        </div>
      </MobileShell>
    );
  }

  if (state.kind === "error") {
    return (
      <MobileShell footer={<div className="flex-none px-[22px] pb-7"><Button full size="lg" onClick={() => navigate(routes.institutionLogin, { replace: true })}>Try again</Button></div>}>
        <BackHeader title="Verification failed" />
        <div className="flex min-h-0 flex-1 flex-col justify-center px-[22px]">
          <ShieldAlert size={28} className="text-tg-terra mb-3" />
          <Meta>{state.message}</Meta>
        </div>
      </MobileShell>
    );
  }

  if (state.kind === "verifying" || loading) {
    return (
      <MobileShell>
        <BackHeader title="Verifying your campus" />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-[22px]">
          <Loader2 className="animate-spin text-tg-blue-accent" size={24} />
          <Meta>Checking with {inst.name}…</Meta>
        </div>
      </MobileShell>
    );
  }

  // Ambiguous: ask the user to confirm.
  if (state.kind === "ambiguous") {
    return (
      <MobileShell>
        <BackHeader title="One last check" />
        <div className="flex min-h-0 flex-1 flex-col justify-center px-[22px]">
          <BadgeCheck size={20} className="text-[#1F8A5B] mb-2" />
          <Meta className="!text-[#1F8A5B]">Verified · {state.email}</Meta>
          <h1 className="mt-3 font-serif text-[26px] font-medium leading-[1.08] tracking-[-0.02em]">
            Which role are you at {inst.name}?
          </h1>
          <p className="mt-2 mb-5 font-body text-[14px] leading-relaxed text-tg-brown">
            We couldn&apos;t tell from your email alone.
          </p>
          {(["faculty", "student"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={async () => {
                const { error } = await setInstitutionRole(r);
                if (error) { setState({ kind: "error", message: error }); return; }
                navigate(r === "faculty" ? routes.facultyProfile : routes.institutionProfile);
              }}
              className="mb-2 flex items-center gap-3.5 rounded-lg border border-tg-line bg-tg-card p-3.5 text-left"
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-tg-stone2">
                {r === "faculty" ? <Presentation size={19} className="text-tg-ink" /> : <GraduationCap size={19} className="text-tg-ink" />}
              </span>
              <div className="flex-1">
                <div className="font-display text-[14.5px] font-semibold capitalize">{r}</div>
                <Meta className="mt-0.5 block">
                  {r === "faculty" ? "Create classes, post documents, run crits." : "Join classes, share pins, build your portfolio."}
                </Meta>
              </div>
              <ChevronRight size={19} className="text-tg-brown-soft" />
            </button>
          ))}
        </div>
      </MobileShell>
    );
  }

  // Verified with a detected role.
  const role = state.role;
  return (
    <MobileShell
      footer={
        <div className="flex-none px-[22px] pb-7">
          <Button full size="lg" onClick={() => navigate(role === "faculty" ? routes.facultyProfile : routes.institutionProfile)}>
            Continue as {role}
          </Button>
        </div>
      }
    >
      <BackHeader title="Welcome to your campus" />
      <div className="flex min-h-0 flex-1 flex-col justify-center px-[22px]">
        <div className="mb-3.5 flex items-center gap-2">
          <BadgeCheck size={17} className="text-[#1F8A5B]" />
          <Meta className="!text-[#1F8A5B]">Verified · {state.email}</Meta>
        </div>
        <h1 className="font-serif text-[29px] font-medium leading-[1.06] tracking-[-0.025em]">
          {role === "faculty" ? "We recognised you as faculty." : "We recognised you as a student."}
        </h1>
        <p className="my-2.5 mb-5 font-body text-[14px] leading-relaxed text-tg-brown">
          Your role was detected from your {inst.name} account using your campus&apos;s own rules.
        </p>

        <div className="flex items-center gap-3.5 rounded-lg bg-tg-emph p-4 text-white">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-md bg-white/15">
            {role === "faculty" ? <Presentation size={23} /> : <GraduationCap size={23} />}
          </span>
          <div className="flex-1">
            <div className="font-display text-[16px] font-semibold capitalize">{role}</div>
            <div className="mt-0.5 font-body text-[12.5px] text-white/70">
              {role === "faculty" ? "Create classes, post documents, run studio crits." : "Join classes, share pins, build your portfolio."}
            </div>
          </div>
          <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-pill bg-tg-yellow">
            <Check size={14} strokeWidth={3} className="text-tg-ink dark:text-white" />
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Unlock size={14} className="text-tg-blue-accent" />
          <Meta>Every Pro feature is unlocked on campus accounts — only paid advertising is excluded.</Meta>
        </div>
      </div>
    </MobileShell>
  );
}
