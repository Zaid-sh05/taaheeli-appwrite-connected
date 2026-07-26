import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useSession } from "@/context/SessionContext";
import { ROLES } from "@/config/roles";
import type { Audience } from "@/config/roles";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  audience?: Audience;
}

const audienceMinTarget: Record<Audience, string> = {
  staff: "min-h-[48px] min-w-[48px]",
  "patient-family": "min-h-[56px] min-w-[56px]",
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, audience, className, id, ...props },
  ref,
) {
  const { session, selectedRole } = useSession();
  const role = session?.role ?? selectedRole ?? "manager";
  const effectiveAudience: Audience = audience ?? ROLES[role]?.audience ?? "staff";

  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        className={cn("mt-1 rounded border-2 border-neutral-300 text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600", audienceMinTarget[effectiveAudience], className)}
        {...props}
      />
      <span className="text-base text-ink leading-relaxed">{label}</span>
    </label>
  );
});
