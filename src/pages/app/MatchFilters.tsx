import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Segmented } from "@/components/app/segmented";
import { LocationField } from "@/components/app/fields";
import { Pill, Meta } from "@/components/brand/atoms";
import { Button } from "@/components/ui/button";
import { disciplines } from "@/lib/fixtures";
import { routes } from "@/lib/routes";

const AVAILABILITY = ["Any", "Open to work", "Collaborations", "Full-time"];
const DISTANCE = ["This city", "Within 50km", "Country", "Anywhere"];

/** 19 · Match filters — refine who appears in the deck. */
export default function MatchFilters() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState<string[]>(["Architecture", "Type & lettering"]);
  const [avail, setAvail] = useState("Open to work");
  const [distance, setDistance] = useState("Within 50km");

  function toggle(d: string) {
    setPicked((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));
  }

  return (
    <MobileShell
      header={
        <BackHeader
          title="Filter matches"
          right={
            <button
              type="button"
              onClick={() => {
                setPicked([]);
                setAvail("Any");
                setDistance("Anywhere");
              }}
            >
              <Meta>Reset</Meta>
            </button>
          }
        />
      }
      footer={
        <div className="border-t border-tg-line bg-tg-bg px-[22px] py-4">
          <Button full size="lg" onClick={() => navigate(routes.match)}>
            Show results
          </Button>
        </div>
      }
    >
      <div className="px-[22px] pb-6 pt-3">
        <Section label="Discipline">
          <div className="flex flex-wrap gap-2">
            {disciplines.map((d) => (
              <Pill key={d} on={picked.includes(d)} onClick={() => toggle(d)}>
                {d}
              </Pill>
            ))}
          </div>
        </Section>

        <Section label="Location">
          <LocationField label="" defaultValue="Dubai, UAE" />
        </Section>

        <Section label="Distance">
          <div className="flex flex-wrap gap-2">
            {DISTANCE.map((d) => (
              <Pill key={d} on={distance === d} onClick={() => setDistance(d)}>
                {d}
              </Pill>
            ))}
          </div>
        </Section>

        <Section label="Availability">
          <Segmented items={AVAILABILITY} active={avail} onChange={setAvail} />
        </Section>
      </div>
    </MobileShell>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 first:mt-2">
      <div className="mb-3 font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-tg-brown">
        {label}
      </div>
      {children}
    </div>
  );
}
