import { Database, FileSearch } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { AIEvidence } from "@/types/ai";

export function AIEvidenceList({ evidence }: { evidence: AIEvidence[] }) {
  return (
    <details className="rounded-lg border border-neutral-200 bg-neutral-50">
      <summary className="flex min-h-[48px] cursor-pointer items-center gap-2 px-4 py-3 font-semibold text-neutral-700">
        <FileSearch className="h-5 w-5 text-primary-600" aria-hidden="true" />
        الأدلة المستخدمة ({evidence.length})
      </summary>
      <ul className="border-t border-neutral-200 px-4 py-3 space-y-3">
        {evidence.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <Database
              className="h-5 w-5 shrink-0 text-neutral-400 mt-1"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-ink">{item.label}</p>
              <p className="text-neutral-600">{item.value}</p>
              {item.recordedAt && (
                <p className="text-sm text-neutral-500">
                  تاريخ السجل: {formatDate(item.recordedAt)}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </details>
  );
}
