import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type Tone = "neutral" | "primary" | "success" | "warning" | "error" | "pending" | "accent";

interface BadgeProps {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  neutral: "bg-neutral-100 text-neutral-800",
  primary: "bg-primary-100 text-primary-800",
  success: "bg-success-100 text-success-800",
  warning: "bg-warning-100 text-warning-800",
  error: "bg-error-100 text-error-800",
  pending: "bg-secondary-100 text-secondary-800",
  accent: "bg-accent-100 text-accent-800",
};

export function Badge({ tone = "neutral", icon, children, className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold", toneClasses[tone], className)}>
      {icon}
      {children}
    </span>
  );
}
