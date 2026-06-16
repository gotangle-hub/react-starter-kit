import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Check,
  GraduationCap,
  Heart,
  PenTool,
  User,
  UsersRound,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Chip } from "@/components/brand/chip";
import { Dots, Meta } from "@/components/brand/atoms";
import { MobileShell } from "@/components/app/mobile-shell";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Opt = {
  id: string;
  icon: typeof PenTool;
  title: string;
  desc: string;
};

const OPTS: Opt[] = [
  { id: "designer", icon: PenTool, title: "Designer", desc: "Architects, artists, photographers, studios — anyone who makes." },
  { id: "client", icon: Briefcase, title: "Client", desc: "Post a project or call out and find the right creative." },
  { id: "institution", icon: GraduationCap, title: "Institution", desc: "Design schools & universities — give every student Tangle." },
  { id: "collector", icon: Heart, title: "Collector", desc: "Just here to browse, follow and collect the design you love." },
];

const SUBS = [
  { id: "individual", icon: User, title: "Individual", desc: "You make the work yourself." },
  { id: "studio", icon: UsersRound, title: "Studio", desc: "A team with shared work, roles and billing." },
];

/** 04 · Choose your account type. No type preselected (G). */
export default function AccountType() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState<string | null>(null);
  const [sub, setSub] = useState<string | null>(null);

  const ready = (picked === "designer" && sub) || (picked && picked !== "designer");

  // Route each account type into its own onboarding flow.
  const continueTo = () => {
    if (picked === "designer") return sub === "studio" ? routes.plansCombined : routes.plans;
    if (picked === "client") return routes.clientSignup;
    if (picked === "institution") return routes.institutionFind;
    if (picked === "collector") return routes.collectorSignup;
    return routes.plans;
  };

  return (
    <MobileShell
      footer={
        <div className="flex-none px-[22px] pb-7 pt-2.5">
          {ready ? (
            <Button full size="lg" onClick={() => navigate(continueTo())}>
              {picked === "client" ? "Continue" : "Continue to plans"}
              <ArrowRight size={17} />
            </Button>
          ) : (
            <p className="text-center">
              <Meta>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-tg-blue-accent"
                  onClick={() => navigate(routes.signIn)}
                >
                  Sign in
                </button>
              </Meta>
            </p>
          )}
        </div>
      }
    >
      <div className="flex flex-none items-center justify-between px-[22px] pt-1.5">
        <Logo size={19} />
        <Dots count={3} index={2} />
      </div>

      <div className="px-[22px] pb-2 pt-3.5">
        <Chip>Tangle / 03</Chip>
        <h1 className="my-3 font-serif text-[32px] font-medium leading-none tracking-[-0.025em]">
          What brings you here?
        </h1>
      </div>

      <div className="flex flex-col gap-2.5 px-[22px] pb-4">
        <OptCard
          opt={OPTS[0]}
          selected={picked === "designer"}
          onClick={() => {
            setPicked(picked === "designer" ? null : "designer");
            setSub(null);
          }}
        />

        {/* Designer sub-types drop in; the rest slide lower */}
        <div
          className="flex flex-col gap-2.5 overflow-hidden transition-all duration-slow ease-standard"
          style={{
            maxHeight: picked === "designer" ? 280 : 0,
            opacity: picked === "designer" ? 1 : 0,
          }}
        >
          <span className="pl-2 pt-1 font-display text-[10px] font-semibold uppercase tracking-[0.1em] text-tg-brown-soft">
            Are you an…
          </span>
          {SUBS.map((s) => {
            const sel = sub === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSub(s.id)}
                className={cn(
                  "ml-4 flex items-center gap-3 rounded-lg border-[1.5px] p-3 text-left transition-all duration-fast",
                  sel ? "border-tg-blue-accent bg-tg-blue-accent/10" : "border-tg-line bg-tg-card",
                )}
              >
                <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-md bg-tg-stone2">
                  <s.icon size={19} className="text-tg-blue-accent" />
                </span>
                <span className="flex-1">
                  <span className="block font-display text-[15px] font-semibold">{s.title}</span>
                  <span className="mt-0.5 block font-body text-[12.5px] text-tg-brown">{s.desc}</span>
                </span>
                <span
                  className={cn(
                    "flex h-5 w-5 flex-none items-center justify-center rounded-pill border-[1.5px]",
                    sel ? "border-tg-blue-accent" : "border-tg-line",
                  )}
                >
                  {sel && <span className="h-2.5 w-2.5 rounded-pill bg-tg-blue-accent" />}
                </span>
              </button>
            );
          })}
        </div>

        {OPTS.slice(1).map((o) => (
          <OptCard
            key={o.id}
            opt={o}
            selected={picked === o.id}
            onClick={() => {
              setPicked(picked === o.id ? null : o.id);
              setSub(null);
            }}
          />
        ))}
      </div>
    </MobileShell>
  );
}

function OptCard({
  opt,
  selected,
  onClick,
}: {
  opt: Opt;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3.5 rounded-lg border-[1.5px] p-3.5 text-left transition-colors duration-base",
        selected ? "border-tg-emph bg-tg-emph text-tg-emph-text" : "border-tg-line bg-tg-card",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 flex-none items-center justify-center rounded-md",
          selected ? "bg-white/15" : "bg-tg-stone2",
        )}
      >
        <opt.icon size={22} className={selected ? "text-tg-emph-text" : "text-tg-ink"} />
      </span>
      <span className="flex-1">
        <span className={cn("block font-display text-[17px] font-semibold", selected ? "text-tg-emph-text" : "text-tg-ink")}>
          {opt.title}
        </span>
        <span className={cn("mt-1 block font-body text-[13px] leading-snug", selected ? "text-tg-emph-text/65" : "text-tg-brown")}>
          {opt.desc}
        </span>
      </span>
      {selected ? (
        <Check size={20} className="text-tg-emph-text" />
      ) : (
        <ArrowRight size={20} className="text-tg-brown-soft" />
      )}
    </button>
  );
}
