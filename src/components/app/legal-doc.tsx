import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Chip } from "@/components/brand/chip";
import { Meta } from "@/components/brand/atoms";

export interface LegalSection {
  h: string;
  p: string[];
}

/** Shared long-form legal document (Terms, Privacy, Copyright). */
export function LegalDoc({
  kicker,
  title,
  updated,
  intro,
  sections,
}: {
  kicker: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <MobileShell>
      <BackHeader title={title} />
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-5 pb-12">
        <Chip>{kicker}</Chip>
        <h1 className="mt-3 font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.025em]">{title}</h1>
        <Meta className="mt-2 block">Last updated {updated}</Meta>
        <p className="mt-4 font-body text-[15px] leading-relaxed text-tg-ink">{intro}</p>
        <div className="mt-6 flex flex-col gap-6">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="mb-2 font-display text-[15px] font-semibold text-tg-ink">{s.h}</h2>
              <div className="flex flex-col gap-2.5">
                {s.p.map((para, i) => (
                  <p key={i} className="font-body text-[14px] leading-relaxed text-tg-brown">{para}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
