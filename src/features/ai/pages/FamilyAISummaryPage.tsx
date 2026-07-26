import { useMemo } from "react";
import { Bot, ShieldCheck, Sparkles } from "lucide-react";
import { AIResultCard } from "@/features/ai/components/AIResultCard";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { useAI } from "@/context/AIContext";
import { useDemoData } from "@/context/DemoDataContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";

export function FamilyAISummaryPage() {
  useDocumentTitle("الملخص الذكي المعتمد");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data } = useDemoData();
  const { visibleResults } = useAI();

  const patient = useMemo(
    () =>
      data.patients.find((item) => item.caregiverName) ?? data.patients[0],
    [data.patients],
  );

  const approvedResults = useMemo(
    () =>
      visibleResults.filter(
        (result) =>
          result.patientId === patient.id &&
          result.audience === "parent" &&
          result.status === "approved",
      ),
    [patient.id, visibleResults],
  );

  return (
    <PageContainer maxWidth="max-w-4xl" className="py-8">
      <PageHeader
        title="الملخص الذكي المعتمد"
        subtitle={`نتائج مبسطة ومعتمدة لمتابعة ${patient.fullName}`}
        actions={<DemoDataBadge />}
      />
      <h2 ref={headingRef} className="sr-only">
        الملخصات الذكية المعتمدة للأسرة
      </h2>

      <Alert tone="success" title="محتوى خاضع لمراجعة المختص" className="mb-6">
        لا تظهر في هذه الصفحة أي مسودة خام. كل نتيجة أدناه راجعها واعتمدها
        مختص قبل مشاركتها مع الأسرة.
      </Alert>

      {approvedResults.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bot className="h-12 w-12" aria-hidden="true" />}
            title="لا يوجد ملخص ذكي معتمد بعد"
            description="عندما ينشئ المختص صياغة مخصصة للأسرة ويعتمدها ستظهر هنا تلقائياً."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-success-700">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            <p className="font-bold">
              {approvedResults.length} نتائج معتمدة متاحة للأسرة
            </p>
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          {approvedResults.map((result) => (
            <AIResultCard key={result.id} result={result} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
