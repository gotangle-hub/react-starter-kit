import { useEffect, useState } from "react";
import { Megaphone, Loader2 } from "lucide-react";
import { StateSuccess } from "@/components/app/state-screens";
import { routes } from "@/lib/routes";
import { getMyLatestBoost, type BoostRow } from "@/services/boosts";

/**
 * 93 · Boost live confirmation (G6). Reads the user's most recent boost and
 * shows the real product, audience, duration, and (if already counted) reach.
 */
export default function BoostConfirm() {
  const [boost, setBoost] = useState<BoostRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyLatestBoost()
      .then((b) => setBoost(b))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <StateSuccess
        icon={Loader2}
        tone="ok"
        chip="Boost"
        title="Loading your boost…"
        body="One moment."
        primary={{ label: "Done", to: routes.home }}
      />
    );
  }

  if (!boost) {
    return (
      <StateSuccess
        icon={Megaphone}
        tone="yellow"
        chip="No boost yet"
        title="You don't have a boost running."
        body="Set one up in Promote to feature your work."
        primary={{ label: "Promote", to: routes.promote }}
        secondary={{ label: "Home", to: routes.home }}
      />
    );
  }

  const live = boost.status === "active";
  const chip = live ? "Boost live" : boost.status === "pending" ? "Awaiting payment" : `Boost ${boost.status}`;
  const title = live
    ? `${boost.product_name} is running.`
    : boost.status === "pending"
      ? `${boost.product_name} — awaiting payment.`
      : `${boost.product_name} — ${boost.status}.`;
  const ends = boost.ends_at ? new Date(boost.ends_at).toLocaleDateString() : `${boost.duration_days} days`;
  const body = live
    ? `${boost.impressions.toLocaleString()} impressions so far · audience: ${boost.audience} · ends ${ends}.`
    : boost.status === "pending"
      ? "Your boost will go live as soon as Ziina confirms the payment."
      : "Try again from Promote when you're ready.";

  return (
    <StateSuccess
      icon={live ? Megaphone : Megaphone}
      tone={live ? "ok" : "yellow"}
      chip={chip}
      title={title}
      body={body}
      primary={{ label: live ? "View reach stats" : "Back to Promote", to: routes.promote }}
      secondary={{ label: "Done", to: routes.home }}
    />
  );
}
