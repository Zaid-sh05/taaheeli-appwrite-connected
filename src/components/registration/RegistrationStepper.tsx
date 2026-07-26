import { STEPS } from "@/types/registration";
import { cn } from "@/lib/cn";
import { Check } from "lucide-react";

interface RegistrationStepperProps {
  currentIndex: number;
}

export function RegistrationStepper({ currentIndex }: RegistrationStepperProps) {
  return (
    <nav aria-label="مراحل التسجيل">
      <ol className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={step.key} className="flex items-center shrink-0">
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold min-h-[40px]",
                  active && "bg-primary-600 text-white",
                  done && "bg-success-100 text-success-800",
                  !active && !done && "bg-neutral-100 text-neutral-600",
                )}
              >
                {done ? <Check className="h-4 w-4" aria-hidden="true" /> : <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/30 text-xs">{i + 1}</span>}
                <span>{step.label}</span>
              </span>
              {i < STEPS.length - 1 && <span className="mx-1 h-px w-4 sm:w-8 bg-neutral-200" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
