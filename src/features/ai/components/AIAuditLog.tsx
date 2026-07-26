import { ClipboardCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatDateTime } from "@/lib/format";
import type { AIAuditEvent } from "@/types/ai";

const actionLabels: Record<AIAuditEvent["action"], string> = {
  generated: "توليد نتيجة",
  approved: "اعتماد نتيجة",
  rejected: "رفض نتيجة",
  "companion-response": "استجابة المرافق",
};

export function AIAuditLog({ events }: { events: AIAuditEvent[] }) {
  return (
    <Card>
      <h3 className="text-xl font-bold text-ink mb-4">سجل التدقيق</h3>
      {events.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="h-12 w-12" aria-hidden="true" />}
          title="لا توجد أحداث بعد"
          description="سيظهر هنا كل تشغيل واعتماد أو رفض لنتائج الذكاء الاصطناعي."
        />
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="border-b border-neutral-100 pb-3 last:border-0"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-semibold text-ink">
                  {actionLabels[event.action]} — {event.actorName}
                </p>
                <p className="text-sm text-neutral-500">
                  {formatDateTime(event.createdAt)}
                </p>
              </div>
              <p className="text-base text-neutral-600">{event.details}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
