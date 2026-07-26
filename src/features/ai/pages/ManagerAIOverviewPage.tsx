import { useMemo, useState } from "react";
import { Bot, Building2, Sparkles } from "lucide-react";
import { AIAuditLog } from "@/features/ai/components/AIAuditLog";
import { AIResultCard } from "@/features/ai/components/AIResultCard";
import { AISkeletonNotice } from "@/features/ai/components/AISkeletonNotice";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { useAI } from "@/context/AIContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";

export function ManagerAIOverviewPage() {
  useDocumentTitle("الملخص الذكي للإدارة");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { visibleResults, auditEvents, generate, reviewResult } = useAI();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const managerResults = useMemo(
    () =>
      visibleResults.filter(
        (result) =>
          result.scope === "center" && result.audience === "manager",
      ),
    [visibleResults],
  );
  const resultIds = useMemo(
    () => new Set(managerResults.map((result) => result.id)),
    [managerResults],
  );
  const managerAuditEvents = useMemo(
    () =>
      auditEvents.filter(
        (event) => event.resultId && resultIds.has(event.resultId),
      ),
    [auditEvents, resultIds],
  );

  async function handleGenerate() {
    setLoading(true);
    try {
      await generate({
        agent: "case-summary",
        scope: "center",
        audience: "manager",
      });
      showToast("تم إنشاء الملخص الإداري التجريبي", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "تعذر إنشاء الملخص",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer maxWidth="max-w-5xl" className="py-8">
      <PageHeader
        title="الملخص الذكي للإدارة"
        subtitle="مؤشرات إدارية مجمعة دون عرض الملاحظات العلاجية الفردية"
        actions={<DemoDataBadge />}
      />
      <h2 ref={headingRef} className="sr-only">
        الملخص الذكي لإدارة المركز
      </h2>

      <AISkeletonNotice />

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-primary-100 p-3">
              <Building2
                className="h-7 w-7 text-primary-700"
                aria-hidden="true"
              />
            </span>
            <div>
              <h3 className="text-xl font-bold text-ink">
                إنشاء ملخص أداء المركز
              </h3>
              <p className="text-base text-neutral-600 leading-relaxed">
                يجمع أعداد المستفيدين والجلسات والحضور ومتوسط المؤشرات
                والمستندات الناقصة. لا يقرأ ملاحظات الحالات في صياغة الإدارة.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={handleGenerate}
            loading={loading}
            leftIcon={<Sparkles className="h-5 w-5" aria-hidden="true" />}
            className="shrink-0"
          >
            إنشاء الملخص
          </Button>
        </div>
      </Card>

      <section aria-labelledby="manager-ai-results" className="mb-6">
        <h3 id="manager-ai-results" className="text-2xl font-bold text-ink mb-4">
          الملخصات السابقة
        </h3>
        {managerResults.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Bot className="h-12 w-12" aria-hidden="true" />}
              title="لا توجد ملخصات بعد"
              description="أنشئ أول ملخص إداري تجريبي لمراجعته واعتماده."
            />
          </Card>
        ) : (
          <div className="space-y-6">
            {managerResults.map((result) => (
              <AIResultCard
                key={result.id}
                result={result}
                allowReview
                onReview={(decision, content, note) => {
                  try {
                    reviewResult({
                      resultId: result.id,
                      decision,
                      content,
                      note,
                    });
                    showToast(
                      decision === "approved"
                        ? "تم اعتماد الملخص"
                        : "تم رفض الملخص",
                      decision === "approved" ? "success" : "info",
                    );
                  } catch (error) {
                    showToast(
                      error instanceof Error
                        ? error.message
                        : "تعذر حفظ المراجعة",
                      "error",
                    );
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>

      <AIAuditLog events={managerAuditEvents} />
    </PageContainer>
  );
}
