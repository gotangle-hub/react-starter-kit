import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Search } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { InstLogo } from "@/components/app/inst-logo";
import { Chip } from "@/components/brand/chip";
import { Meta } from "@/components/brand/atoms";
import { schools } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

/**
 * 03 · Find your school (G13). Predictive search that autocompletes the
 * institution name as you type. A prominent "Register your institution" for
 * unlisted schools.
 */
export default function InstitutionFind() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const matches = q ? schools.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())) : schools;

  return (
    <MobileShell>
      <BackHeader title="Institution" />
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-3.5 pb-6">
        <Chip>Institution</Chip>
        <h1 className="mb-1.5 mt-3 font-serif text-[30px] font-medium leading-[1.04] tracking-[-0.02em]">
          Find your design school.
        </h1>
        <p className="mb-4 font-body text-[14px] leading-relaxed text-tg-brown">
          If your school is on Tangle, students join free through the campus plan.
        </p>

        <div className="flex items-center gap-2.5 rounded-lg border-[1.5px] border-tg-blue-accent bg-tg-card px-3.5 py-3">
          <Search size={18} className="text-tg-blue-accent" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your institution…"
            className="min-w-0 flex-1 border-none bg-transparent p-0 text-[15px] font-medium text-tg-ink outline-none placeholder:font-normal placeholder:text-tg-brown-soft"
          />
        </div>

        <div className="mt-2.5 overflow-hidden rounded-lg border border-tg-line">
          {matches.map((s, i) => (
            <button
              key={s.name}
              type="button"
              onClick={() => navigate(routes.institutionLogin)}
              className={`flex w-full items-center gap-3 px-3.5 py-3 text-left ${i > 0 ? "border-t border-tg-line" : ""} ${i === 0 ? "bg-tg-stone2" : "bg-tg-card"}`}
            >
              <InstLogo school={s} size={38} />
              <div className="min-w-0 flex-1">
                <div className="font-display text-[14.5px] font-semibold">{s.name}</div>
                <Meta className="mt-0.5 block">{s.city} · {s.domain}</Meta>
              </div>
              <ArrowRight size={18} className={i === 0 ? "text-tg-blue-accent" : "text-tg-brown-soft"} />
            </button>
          ))}
          {matches.length === 0 && (
            <div className="px-3.5 py-4 text-[13.5px] text-tg-brown-soft">No match — register your school below.</div>
          )}
        </div>

        <div className="mt-[18px] rounded-lg bg-tg-emph p-[18px] text-white">
          <div className="font-serif text-[19px] font-medium leading-tight tracking-[-0.01em]">Don't see your school?</div>
          <p className="my-2 font-body text-[13px] leading-relaxed text-white/70">
            Register your institution and we'll reach out about bringing Tangle to your students.
          </p>
          <button
            type="button"
            onClick={() => navigate(routes.institutionRegister)}
            className="inline-flex items-center gap-2 rounded-DEFAULT bg-white px-4 py-2.5 font-display text-[14px] font-semibold text-tg-ink"
          >
            <Building2 size={16} />
            Register your institution
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
