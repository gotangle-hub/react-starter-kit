import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export default function Unsubscribe() {
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const [state, setState] = useState<"loading" | "valid" | "done" | "invalid" | "already">("loading");
  const [email, setEmail] = useState<string>("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    (async () => {
      try {
        const r = await fetch(`${FN_URL}?token=${encodeURIComponent(token)}`, {
          headers: { apikey: ANON },
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) { setState(data?.already ? "already" : "invalid"); return; }
        if (data?.email) setEmail(data.email);
        setState(data?.already ? "already" : "valid");
      } catch {
        setState("invalid");
      }
    })();
  }, [token]);

  const confirm = async () => {
    setBusy(true);
    try {
      const r = await fetch(FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: ANON },
        body: JSON.stringify({ token }),
      });
      if (r.ok) setState("done");
      else setState("invalid");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <p className="font-serif italic text-3xl tracking-tight mb-8">
          <span className="text-primary">.t</span>angle
        </p>
        {state === "loading" && <p className="text-muted-foreground">Checking your link…</p>}
        {state === "valid" && (
          <>
            <h1 className="text-2xl font-semibold mb-2">Unsubscribe from Tangle emails?</h1>
            <p className="text-muted-foreground mb-8">
              {email ? <>We'll stop sending app emails to <span className="text-foreground">{email}</span>.</> : "We'll stop sending app emails to this address."}
            </p>
            <Button onClick={confirm} disabled={busy} className="w-full">
              {busy ? "Unsubscribing…" : "Confirm unsubscribe"}
            </Button>
          </>
        )}
        {state === "done" && (
          <>
            <h1 className="text-2xl font-semibold mb-2">You're unsubscribed</h1>
            <p className="text-muted-foreground mb-8">We won't send app emails to this address anymore.</p>
            <Link to="/"><Button variant="outline">Back to Tangle</Button></Link>
          </>
        )}
        {state === "already" && (
          <>
            <h1 className="text-2xl font-semibold mb-2">Already unsubscribed</h1>
            <p className="text-muted-foreground mb-8">This address is already removed from app emails.</p>
            <Link to="/"><Button variant="outline">Back to Tangle</Button></Link>
          </>
        )}
        {state === "invalid" && (
          <>
            <h1 className="text-2xl font-semibold mb-2">Link expired or invalid</h1>
            <p className="text-muted-foreground mb-8">Please use the latest unsubscribe link from one of our emails.</p>
            <Link to="/"><Button variant="outline">Back to Tangle</Button></Link>
          </>
        )}
      </div>
    </div>
  );
}
