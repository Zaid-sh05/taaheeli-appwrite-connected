import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { required, className, children, ...props },
  ref,
) {
  return (
    <label ref={ref} className={cn("block text-base font-semibold text-ink mb-1.5", className)} {...props}>
      {children}
      {required && <span className="text-error-600 ms-1" aria-hidden="true">*</span>}
    </label>
  );
});
