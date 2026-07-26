import { useEffect, useState } from "react";
import {
  Bot,
  CheckCircle2,
  CircleGauge,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { AIEvidenceList } from "@/features/ai/components/AIEvidenceList";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { formatDateTime } from "@/lib/format";
import type { AIResult } from "@/types/ai";

const agentLabels: Record<AIResult["agent"], string> = {
  "case-summary": "وكيل تلخيص الحالة",
  recommendation: "وكيل التوصيات",
  "progress-analysis": "وكيل تحليل التطور",
};

const audienceLabels: Record<AIResult["audience"], string> = {
  doctor: "للمختص",
  manager: "للإدارة",
  parent: "للأسرة",
};

interface AIResultCardProps {
  result: AIResult;
  allowReview?: boolean;
  onReview?: (
    decision: "approved" | "rejected",
    content: string,
    note?: string,
  ) => void;
}

export function AIResultCard({
  result,
  allowReview = false,
  onReview,
}: AIResultCardProps) {
  const [content, setContent] = useState(result.content);
  const [note, setNote] = useState("");

  useEffect(() => {
    setContent(result.content);
    setNote("");
  }, [result.content, result.id, result.status]);

  const status =
    result.status === "approved"
      ? { label: "معتمد", tone: "success" as const }
      : result.status === "rejected"
        ? { label: "مرفوض", tone: "error" as const }
        : { label: "مسودة للمراجعة", tone: "pending" as const };

  return (
    <Card className="border-2 border-primary-100">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <span className="rounded-full bg-primary-100 p-2.5">
            <Bot className="h-6 w-6 text-primary-700" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-xl font-bold text-ink">{result.title}</h3>
            <p className="text-sm text-neutral-600">
              {agentLabels[result.agent]} — {audienceLabels[result.audience]}
            </p>
          </div>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-4 text-sm">
        <div className="rounded-lg bg-neutral-50 p-3">
          <p className="font-semibold text-neutral-600">وقت التوليد</p>
          <p className="text-ink">{formatDateTime(result.generatedAt)}</p>
        </div>
        <div className="rounded-lg bg-neutral-50 p-3">
          <p className="font-semibold text-neutral-600">المزود</p>
          <p className="text-ink">{result.modelVersion}</p>
        </div>
        <div className="rounded-lg bg-neutral-50 p-3">
          <p className="font-semibold text-neutral-600">درجة الثقة</p>
          <p className="text-ink">
            {result.confidence === null
              ? "غير متاحة في الوضع التجريبي"
              : `${result.confidence}%`}
          </p>
        </div>
      </div>

      {allowReview && result.status === "draft" ? (
        <div className="mb-4">
          <label
            htmlFor={`ai-content-${result.id}`}
            className="block text-base font-bold text-ink mb-2"
          >
            راجع النص وعدّله قبل الاعتماد
          </label>
          <Textarea
            id={`ai-content-${result.id}`}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="min-h-[230px] whitespace-pre-line"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 mb-4">
          <p className="whitespace-pre-line text-base leading-loose text-ink">
            {result.content}
          </p>
        </div>
      )}

      <div className="mb-4">
        <AIEvidenceList evidence={result.evidence} />
      </div>

      <Alert tone="warning" title="القيود وحدود الاستخدام" className="mb-4">
        <ul className="space-y-1">
          {result.limitations.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </Alert>

      {allowReview && result.status === "draft" && onReview && (
        <div className="border-t border-neutral-200 pt-4">
          <label
            htmlFor={`ai-note-${result.id}`}
            className="block text-base font-semibold text-neutral-700 mb-2"
          >
            ملاحظة المراجع (اختيارية)
          </label>
          <Textarea
            id={`ai-note-${result.id}`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="min-h-[90px] mb-3"
            placeholder="سبب التعديل أو الرفض..."
          />
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => onReview("approved", content, note)}
              disabled={!content.trim()}
              leftIcon={
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              }
            >
              اعتماد النتيجة
            </Button>
            <Button
              variant="danger"
              onClick={() => onReview("rejected", content, note)}
              leftIcon={<XCircle className="h-5 w-5" aria-hidden="true" />}
            >
              رفض النتيجة
            </Button>
          </div>
        </div>
      )}

      {result.review && (
        <div
          className={
            "rounded-lg border p-4 " +
            (result.review.decision === "approved"
              ? "bg-success-50 border-success-200"
              : "bg-error-50 border-error-200")
          }
        >
          <div className="flex items-start gap-2">
            {result.review.decision === "approved" ? (
              <ShieldCheck
                className="h-5 w-5 shrink-0 text-success-700 mt-1"
                aria-hidden="true"
              />
            ) : (
              <XCircle
                className="h-5 w-5 shrink-0 text-error-700 mt-1"
                aria-hidden="true"
              />
            )}
            <div>
              <p className="font-bold text-ink">
                {result.review.decision === "approved" ? "تم الاعتماد" : "تم الرفض"}{" "}
                بواسطة {result.review.reviewedBy}
              </p>
              <p className="text-sm text-neutral-600">
                {formatDateTime(result.review.reviewedAt)}
                {result.review.contentWasEdited ? " — تم تعديل النص قبل الاعتماد" : ""}
              </p>
              {result.review.note && (
                <p className="text-base text-neutral-700 mt-2">
                  {result.review.note}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
        <CircleGauge className="h-4 w-4" aria-hidden="true" />
        النتيجة قابلة للتتبع عبر سجل التدقيق، ولا تعدّل الملف العلاجي تلقائياً.
      </div>
    </Card>
  );
}
