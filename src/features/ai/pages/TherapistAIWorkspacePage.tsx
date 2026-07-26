import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Bot,
  FileText,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AIAuditLog } from "@/features/ai/components/AIAuditLog";
import { AIResultCard } from "@/features/ai/components/AIResultCard";
import { AISkeletonNotice } from "@/features/ai/components/AISkeletonNotice";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { Select } from "@/components/ui/Select";
import { useAI } from "@/context/AIContext";
import { useDemoData } from "@/context/DemoDataContext";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import type { AIAgentKey, AIAudience } from "@/types/ai";

const agentOptions: {
  key: AIAgentKey;
  label: string;
  description: string;
  icon: typeof FileText;
}[] = [
  {
    key: "case-summary",
    label: "تلخيص الحالة",
    description: "ينشئ مسودة ملخص من الجلسات والخطة والمؤشرات المسجلة.",
    icon: FileText,
  },
  {
    key: "recommendation",
    label: "مسودة توصيات",
    description: "يستخرج نقاط متابعة قابلة للمراجعة ولا يغيّر الخطة.",
    icon: Lightbulb,
  },
  {
    key: "progress-analysis",
    label: "تحليل التطور",
    description: "يصف مؤشرات التقدم الحالية وحدود البيانات المتوفرة.",
    icon: TrendingUp,
  },
];

export function TherapistAIWorkspacePage() {
  useDocumentTitle("المساعد الذكي");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const [searchParams] = useSearchParams();
  const { data } = useDemoData();
  const { session } = useSession();
  const {
    visibleResults,
    auditEvents,
    generate,
    reviewResult,
  } = useAI();
  const { showToast } = useToast();

  const therapist = useMemo(() => {
    const matched = data.employees.find(
      (employee) =>
        (employee.role === "doctor" || employee.role === "therapist") &&
        (employee.fullName === session?.username ||
          employee.id === session?.username),
    );
    return (
      matched ??
      data.employees.find((employee) => employee.id === "e2") ??
      data.employees.find(
        (employee) =>
          employee.role === "doctor" || employee.role === "therapist",
      )
    );
  }, [data.employees, session?.username]);

  const patients = useMemo(
    () =>
      data.patients.filter(
        (patient) => patient.assignedTherapistId === therapist?.id,
      ),
    [data.patients, therapist?.id],
  );

  const requestedPatientId = searchParams.get("patientId");
  const initialPatientId =
    patients.find((patient) => patient.id === requestedPatientId)?.id ??
    patients[0]?.id ??
    "";

  const [patientId, setPatientId] = useState(initialPatientId);
  const [agent, setAgent] = useState<AIAgentKey>("case-summary");
  const [audience, setAudience] = useState<AIAudience>("doctor");
  const [loading, setLoading] = useState(false);

  const patientIds = useMemo(
    () => new Set(patients.map((patient) => patient.id)),
    [patients],
  );

  const myResults = useMemo(
    () =>
      visibleResults.filter(
        (result) => result.patientId && patientIds.has(result.patientId),
      ),
    [patientIds, visibleResults],
  );

  const resultIds = useMemo(
    () => new Set(myResults.map((result) => result.id)),
    [myResults],
  );
  const myAuditEvents = useMemo(
    () =>
      auditEvents.filter(
        (event) => event.resultId && resultIds.has(event.resultId),
      ),
    [auditEvents, resultIds],
  );

  async function handleGenerate() {
    if (!patientId) {
      showToast("اختر مستفيداً أولاً", "error");
      return;
    }
    setLoading(true);
    try {
      await generate({
        agent,
        scope: "case",
        audience,
        patientId,
      });
      showToast("تم إنشاء مسودة تجريبية للمراجعة", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "تعذر تشغيل الوكيل",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleReview(
    resultId: string,
    decision: "approved" | "rejected",
    content: string,
    note?: string,
  ) {
    try {
      reviewResult({ resultId, decision, content, note });
      showToast(
        decision === "approved" ? "تم اعتماد النتيجة" : "تم رفض النتيجة",
        decision === "approved" ? "success" : "info",
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "تعذر حفظ المراجعة",
        "error",
      );
    }
  }

  return (
    <PageContainer maxWidth="max-w-5xl" className="py-8">
      <PageHeader
        title="مساحة عمل المساعد الذكي"
        subtitle="تشغيل الوكلاء ومراجعة نتائجهم قبل اعتمادها"
        actions={<DemoDataBadge />}
      />
      <h2 ref={headingRef} className="sr-only">
        مساحة عمل الذكاء الاصطناعي للمختص
      </h2>

      <AISkeletonNotice />

      {patients.length === 0 ? (
        <Alert tone="warning" title="لا توجد حالات مسندة">
          لا يمكن تشغيل الوكلاء قبل إسناد مستفيد إلى حساب المختص التجريبي.
        </Alert>
      ) : (
        <>
          <Card className="mb-6">
            <div className="flex items-center gap-3 mb-5">
              <Sparkles
                className="h-7 w-7 text-primary-600"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-xl font-bold text-ink">تشغيل وكيل</h3>
                <p className="text-base text-neutral-600">
                  اختر الحالة والوكيل والجمهور المستهدف للنتيجة.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <div>
                <label
                  htmlFor="ai-patient"
                  className="block text-base font-semibold text-neutral-700 mb-2"
                >
                  المستفيد
                </label>
                <Select
                  id="ai-patient"
                  value={patientId}
                  onChange={(event) => setPatientId(event.target.value)}
                >
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.fullName} — {patient.fileNumber}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label
                  htmlFor="ai-audience"
                  className="block text-base font-semibold text-neutral-700 mb-2"
                >
                  صياغة النتيجة
                </label>
                <Select
                  id="ai-audience"
                  value={audience}
                  onChange={(event) =>
                    setAudience(event.target.value as AIAudience)
                  }
                >
                  <option value="doctor">صياغة تفصيلية للمختص</option>
                  <option value="parent">صياغة مبسطة للأسرة</option>
                </Select>
              </div>
            </div>

            <fieldset className="mb-5">
              <legend className="text-base font-semibold text-neutral-700 mb-2">
                الوكيل
              </legend>
              <div className="grid md:grid-cols-3 gap-3">
                {agentOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = agent === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setAgent(option.key)}
                      className={
                        "rounded-lg border-2 p-4 text-start transition-colors min-h-[130px] " +
                        (selected
                          ? "border-primary-500 bg-primary-50"
                          : "border-neutral-200 bg-white hover:border-primary-300")
                      }
                      aria-pressed={selected}
                    >
                      <Icon
                        className="h-6 w-6 text-primary-700 mb-2"
                        aria-hidden="true"
                      />
                      <span className="block font-bold text-ink">
                        {option.label}
                      </span>
                      <span className="block text-sm text-neutral-600 mt-1">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <Button
              variant="primary"
              onClick={handleGenerate}
              loading={loading}
              leftIcon={<Bot className="h-5 w-5" aria-hidden="true" />}
            >
              إنشاء مسودة تجريبية
            </Button>
          </Card>

          <section aria-labelledby="ai-results-title" className="mb-6">
            <h3 id="ai-results-title" className="text-2xl font-bold text-ink mb-4">
              النتائج وسجل المراجعة
            </h3>
            {myResults.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<Bot className="h-12 w-12" aria-hidden="true" />}
                  title="لا توجد نتائج بعد"
                  description="شغّل أحد الوكلاء لتظهر المسودة والأدلة وخيارات المراجعة هنا."
                />
              </Card>
            ) : (
              <div className="space-y-6">
                {myResults.map((result) => (
                  <AIResultCard
                    key={result.id}
                    result={result}
                    allowReview
                    onReview={(decision, content, note) =>
                      handleReview(result.id, decision, content, note)
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <AIAuditLog events={myAuditEvents} />
        </>
      )}
    </PageContainer>
  );
}
