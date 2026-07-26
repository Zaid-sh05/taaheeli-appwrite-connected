import { cn } from "@/lib/cn";
import type { ReactNode } from "react";
import { CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Circle as XCircle, Clock, Info } from "lucide-react";

type Tone = "info" | "success" | "warning" | "error" | "pending";

interface AlertProps {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  info: "bg-primary-50 border-primary-200 text-primary-800",
  success: "bg-success-50 border-success-200 text-success-800",
  warning: "bg-warning-50 border-warning-200 text-warning-800",
  error: "bg-error-50 border-error-200 text-error-800",
  pending: "bg-secondary-50 border-secondary-200 text-secondary-800",
};

const icons: Record<Tone, ReactNode> = {
  info: <Info className="h-5 w-5 shrink-0" aria-hidden="true" />,
  success: <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />,
  warning: <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />,
  error: <XCircle className="h-5 w-5 shrink-0" aria-hidden="true" />,
  pending: <Clock className="h-5 w-5 shrink-0" aria-hidden="true" />,
};

export function Alert({ tone = "info", title, children, className }: AlertProps) {
  return (
    <div role="alert" className={cn("flex items-start gap-3 rounded-lg border-2 p-4 text-base", toneClasses[tone], className)}>
      {icons[tone]}
      <div className="flex-1">
        {title && <p className="font-bold mb-1">{title}</p>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
