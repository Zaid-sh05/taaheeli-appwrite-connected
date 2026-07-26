import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useSession } from "@/context/SessionContext";
import { ROLES } from "@/config/roles";
import type { Audience } from "@/config/roles";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  audience?: Audience;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
  secondary: "bg-white text-primary-700 border-2 border-primary-300 hover:bg-primary-50 active:bg-primary-100",
  ghost: "bg-transparent text-primary-700 hover:bg-primary-50 active:bg-primary-100",
  danger: "bg-error-600 text-white hover:bg-error-700 active:bg-error-800",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-base px-3 py-2 gap-1.5",
  md: "text-lg px-4 py-2.5 gap-2",
  lg: "text-xl px-6 py-3 gap-2.5",
};

const audienceMinTarget: Record<Audience, string> = {
  staff: "min-h-[48px]",
  "patient-family": "min-h-[56px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", audience, fullWidth = false, leftIcon, rightIcon, loading = false, disabled, className, children, ...props },
  ref,
) {
  const { session, selectedRole } = useSession();
  const role = session?.role ?? selectedRole ?? "manager";
  const effectiveAudience: Audience = audience ?? ROLES[role]?.audience ?? "staff";

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        audienceMinTarget[effectiveAudience],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
