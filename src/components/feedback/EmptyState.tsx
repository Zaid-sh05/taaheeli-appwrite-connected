import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      {icon && <div className="mx-auto mb-4 text-neutral-400">{icon}</div>}
      <p className="text-lg font-bold text-ink mb-2">{title}</p>
      {description && <p className="text-base text-neutral-600 max-w-prose mx-auto">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
