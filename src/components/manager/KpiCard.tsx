import { cn } from "@/lib/cn";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  tone?: "primary" | "success" | "warning" | "accent" | "secondary" | "error";
  linkTo?: string;
  subtitle?: string;
}

const toneClasses: Record<string, string> = {
  primary: "text-primary-600 bg-primary-50",
  success: "text-success-600 bg-success-50",
  warning: "text-warning-600 bg-warning-50",
  accent: "text-accent-600 bg-accent-50",
  secondary: "text-secondary-600 bg-secondary-50",
  error: "text-error-600 bg-error-50",
};

export function KpiCard({ label, value, icon, tone = "primary", linkTo, subtitle }: KpiCardProps) {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[icon] ?? Icons.Circle;
  const content = (
    <div className={cn("flex items-start gap-3 p-5 rounded-xl bg-white border border-neutral-100 shadow-sm transition-all", linkTo && "hover:shadow-md hover:border-primary-200")}>
      <span className={cn("inline-flex h-12 w-12 items-center justify-center rounded-lg shrink-0", toneClasses[tone])}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-ink">{value}</p>
        {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 rounded-xl">{content}</Link>;
  }
  return content;
}
