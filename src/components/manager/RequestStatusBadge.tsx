import { Badge } from "@/components/ui/Badge";
import type { RequestStatus } from "@/types/demo";
import { Clock, CircleCheck as CheckCircle2, Circle as XCircle, CircleAlert as AlertCircle } from "lucide-react";

const config: Record<RequestStatus, { tone: "pending" | "success" | "error" | "warning"; label: string; icon: React.ReactNode }> = {
  pending: { tone: "pending", label: "بانتظار", icon: <Clock className="h-4 w-4" /> },
  approved: { tone: "success", label: "مقبول", icon: <CheckCircle2 className="h-4 w-4" /> },
  rejected: { tone: "error", label: "مرفوض", icon: <XCircle className="h-4 w-4" /> },
  "info-requested": { tone: "warning", label: "استكمال مطلوب", icon: <AlertCircle className="h-4 w-4" /> },
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const c = config[status];
  return <Badge tone={c.tone} icon={c.icon}>{c.label}</Badge>;
}
