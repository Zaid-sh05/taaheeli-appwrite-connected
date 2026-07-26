import { cn } from "@/lib/cn";

interface PatientProgressIndicatorProps {
  value: number;
  className?: string;
}

export function PatientProgressIndicator({ value, className }: PatientProgressIndicatorProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const tone = clamped >= 70 ? "bg-success-500" : clamped >= 40 ? "bg-primary-500" : "bg-warning-500";
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-neutral-600">التقدم</span>
        <span className="text-sm font-bold text-ink">{clamped}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-neutral-100 overflow-hidden" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} aria-label="مستوى التقدم">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
