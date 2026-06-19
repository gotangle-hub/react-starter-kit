import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { routes } from "@/lib/routes";

/**
 * Practice Reward — full-screen celebration shown ONCE when the user
 * unlocks the free month. Always rendered on the blue brand surface
 * (the only screen Tangle pins to blue regardless of theme).
 */
export default function PracticeReward() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[100dvh] w-full justify-center bg-[#0107FF]">
      <div className="relative flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden bg-[#0107FF] text-white">
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-white/75">
              Ten days, unbroken
            </span>
            <div className="mt-4 font-serif text-[50px] font-medium leading-none tracking-[-0.03em] text-white">
              Pro is on us<span className="text-[#F4D738]">.</span>
            </div>
            <div className="my-[34px] flex h-[132px] w-[132px] flex-col items-center justify-center rounded-full border-[1.5px] border-white/40">
              <span className="font-serif text-[46px] font-medium leading-none text-[#F4D738]">30</span>
              <span className="mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
                days of Pro
              </span>
            </div>
            <p className="max-w-[300px] font-body text-[15px] leading-[1.6] text-white/80">
              You showed up every day for ten days. That's not a streak. It's a practice. The next month of Tangle Pro is yours, free.
            </p>
          </div>
        </div>
        <div className="flex flex-none flex-col gap-2.5 bg-[#0107FF] px-[22px] pb-[30px] pt-[18px]">
          <button
            type="button"
            onClick={() => navigate(routes.home)}
            className="flex h-[52px] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white font-display text-[15px] font-semibold text-[#161514]"
          >
            <Zap size={17} className="text-[#161514]" />
            Start using Pro
          </button>
          <button
            type="button"
            onClick={() => navigate(routes.billing)}
            className="h-5 text-center font-display text-[14px] font-medium text-white/80"
          >
            See everything in Pro
          </button>
        </div>
      </div>
    </div>
  );
}
