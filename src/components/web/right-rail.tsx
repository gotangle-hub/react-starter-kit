import { useAccountType } from "@/hooks/use-account-type";

/**
 * Instagram-style right rail. Visible only at the desktop breakpoint
 * (≥1440px). Intentionally light-touch in the first pass: a compact "you" card
 * plus an empty-state suggestions panel that real data can drop into later. No
 * placeholder/dummy data per G14.
 */
export function RightRail() {
  const { accountType } = useAccountType();

  return (
    <aside className="sticky top-0 hidden h-[100dvh] w-[320px] flex-none flex-col gap-6 overflow-y-auto bg-tg-page-board px-6 py-8 min-[1440px]:flex">
      <div className="rounded-2xl border border-tg-line bg-tg-bg p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-tg-brown-soft">
          Signed in as
        </p>
        <p className="mt-1 text-[15px] font-medium capitalize text-tg-ink">{accountType}</p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[13px] font-medium text-tg-brown-soft">Suggested for you</p>
        <div className="rounded-2xl border border-dashed border-tg-line p-5 text-[13px] text-tg-brown-soft">
          As you connect with people and save work, suggestions will appear here.
        </div>
      </div>

      <div className="mt-auto pb-4 text-[11px] leading-relaxed text-tg-brown-soft">
        © Tangle · Built for designers.
      </div>
    </aside>
  );
}
