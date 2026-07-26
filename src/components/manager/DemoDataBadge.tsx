import { Database } from "lucide-react";
import { cn } from "@/lib/cn";

interface DemoDataBadgeProps {
  className?: string;
}

export function DemoDataBadge({ className }: DemoDataBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold text-neutral-600", className)}>
      <Database className="h-4 w-4" aria-hidden="true" />
      بيانات Appwrite
    </span>
  );
}
