import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { useSession } from "@/context/SessionContext";
import { ROLES } from "@/config/roles";
import type { Audience } from "@/config/roles";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  audience?: Audience;
}

const audienceMinTarget: Record<Audience, string> = {
  staff: "min-h-[48px]",
  "patient-family": "min-h-[56px]",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { hasError, audience, className, ...props },
  ref,
) {
  const { session, selectedRole } = useSession();
  const role = session?.role ?? selectedRole ?? "manager";
  const effectiveAudience: Audience = audience ?? ROLES[role]?.audience ?? "staff";

  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border-2 bg-white px-3 py-2.5 text-base text-ink placeholder:text-neutral-400",
        "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
        hasError ? "border-error-400" : "border-neutral-200 hover:border-neutral-300 focus:border-primary-500",
        audienceMinTarget[effectiveAudience],
        className,
      )}
      {...props}
    />
  );
});
