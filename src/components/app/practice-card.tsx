import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Meta } from "@/components/brand/atoms";
import { getPracticeStatus, type PracticeStatus } from "@/services/practice";
import { routes } from "@/lib/routes";

/**
 * Home-screen entry to Daily Practice. Hidden for ineligible accounts
 * (Pro, Studio, Institution, Collector, or already-granted). Editorial,
 * calm — no flames, points or confetti per the design brief.
 */
export function PracticeCard() {
  const navigate = useNavigate();
  const [s, setS] = useState<PracticeStatus | null>(null);

  useEffect(() => {
    let alive = true;
    getPracticeStatus().then((v) => { if (alive) setS(v); });
    return () => { alive = false; };
  }, []);

  if (!s || s.kind === null || !s.eligible) return null;

  const label = s.kind === "designer" ? "Daily practice" : "Get started";
  const title =
    s.kind === "designer"
      ? s.streak >= 10 ? "Ten days, unbroken" : `${labelN(s.streak)} of 10 days`
      : `${s.count} of 3 briefs`;
  const sub =
    s.kind === "designer"
      ? s.today_done
        ? "Today's piece is in. Come back tomorrow."
        : s.streak === 0
          ? "Add a piece today to start your free month of Pro"
          : "Add today's piece to keep the streak"
      : s.days_left > 0
        ? `${s.days_left} days left for a free month of Client Pro`
        : "Post three briefs to unlock a free month of Client Pro";

  return (
    <Card
      className="mt-2.5 flex cursor-pointer items-center gap-3 p-3.5"
      onClick={() => navigate(routes.practice)}
    >
      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[11px] bg-tg-stone2">
        <Gift size={18} className="text-tg-blue-accent" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-tg-blue-accent">
          {label}
        </div>
        <div className="mt-0.5 font-display text-[14.5px] font-semibold text-tg-ink">{title}</div>
        <Meta className="mt-0.5 block">{sub}</Meta>
      </div>
    </Card>
  );
}

function labelN(n: number) {
  return n <= 0 ? "Day 0" : `Day ${Math.min(n, 10)}`;
}
