import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { MobileShell } from "@/components/app/mobile-shell";
import { BackHeader } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

/**
 * 56 · Submission received. Thank-you confirmation after an anonymous salary
 * submission — reinforces that every entry makes pay fairer.
 */
export default function SalarySubmitted() {
  const navigate = useNavigate();

  return (
    <MobileShell header={<BackHeader title="Salary database" />}>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-9 pb-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-pill bg-tg-blue">
          <Check size={30} className="text-white" strokeWidth={2.5} />
        </span>

        <h1 className="mt-6 font-serif text-[25px] font-medium leading-[1.08] tracking-[-0.02em]">
          Thank you. The picture just got clearer.
        </h1>
        <p className="mt-3 max-w-[19rem] text-[14px] leading-[1.55] text-tg-brown">
          Your figure is in the community database — anonymously, with nothing
          tied to your account. Every entry makes pay fairer for the people who
          come after you.
        </p>

        <div className="mt-8 flex w-full max-w-[18rem] flex-col gap-2.5">
          <Button full size="lg" onClick={() => navigate(routes.salary)}>
            Back to salaries
          </Button>
          <Button
            variant="outline"
            full
            size="lg"
            onClick={() => navigate(routes.salarySubmit)}
          >
            Add another
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}
