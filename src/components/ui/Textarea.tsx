import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { hasError, className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border-2 bg-white px-3 py-2.5 text-base text-ink placeholder:text-neutral-400 min-h-[120px]",
        "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
        hasError ? "border-error-400" : "border-neutral-200 hover:border-neutral-300 focus:border-primary-500",
        className,
      )}
      {...props}
    />
  );
});
