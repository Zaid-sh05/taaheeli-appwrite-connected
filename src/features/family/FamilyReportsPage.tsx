import { useMemo, useState } from "react";
import { useDemoData } from "@/context/DemoDataContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Select } from "@/components/ui/Select";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { PatientProgressIndicator } from "@/components/manager/PatientProgressIndicator";
import { EmptyState } from "@/components/feedback/EmptyState";
import { printReport } from "@/lib/print";
import { formatDate } from "@/lib/format";
import { Printer, TrendingUp, Dumbbell, Target, Chrome as Home, Sparkles } from "lucide-react";

type ReportPeriod = "weekly" | "monthly";

export function FamilyReportsPage() {
  useDocumentTitle("التقارير");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data } = useDemoData();
  const { showToast } = useToast();

  const [period, setPeriod] = useState<ReportPeriod>("weekly");

  // Identify the linked patient: first patient with a caregiverName field, else patients[0].
  const patient = useMemo(
    () => data.patients.find((p) => p.caregiverName) ?? data.patients[0],
    [data.patients],
  );

  // Sessions for this patient only, filtered by period
  const today = new Date();
  const periodStart = useMemo(() => {
    const d = new Date(today);
    if (period === "weekly") {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 30);
    }
    return d.toISOString().split("T")[0];
  }, [period, today]);

  const periodEnd = today.toISOString().split("T")[0];

  const patientSessions = useMemo(
    () => data.sessions.filter((s) => s.patientId === patient.id),
    [data.sessions, patient.id],
  );

  const periodSessions = useMemo(
    () => patientSessions.filter((s) => s.date >= periodStart && s.date <= periodEnd),
    [patientSessions, periodStart, periodEnd],
  );

  // Attendance summary
  const attendanceSummary = useMemo(() => {
    const total = periodSessions.length;
    const attended = periodSessions.filter((s) => s.attendance === "attended").length;
    const missed = periodSessions.filter((s) => s.attendance === "missed").length;
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;
    return { total, attended, missed, rate };
  }, [periodSessions]);

  // Exercises for this patient
  const patientExercises = useMemo(
    () => data.exercises.filter((ex) => ex.patientId === patient.id),
    [data.exercises, patient.id],
  );

  // Exercise completion rate
  const exerciseSummary = useMemo(() => {
    const total = patientExercises.length;
    const completed = patientExercises.filter((ex) => ex.status === "completed").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, rate };
  }, [patientExercises]);

  // Active treatment plan with goals
  const activePlan = useMemo(
    () => data.treatmentPlans.find((tp) => tp.patientId === patient.id && tp.status === "active"),
    [data.treatmentPlans, patient.id],
  );

  // Latest session with recommendations (approved for family display)
  const latestSession = useMemo(() => {
    return patientSessions
      .filter((s) => s.status === "completed")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [patientSessions]);

  const periodLabel = period === "weekly" ? "الأسبوع" : "الشهر";

  function handlePrint() {
    const goalsRows = activePlan
      ? activePlan.goals
          .map((g) => `<tr><td>${g.text}</td><td>${g.progress}%</td></tr>`)
          .join("")
      : `<tr><td colspan="2">لا توجد خطة نشطة</td></tr>`;

    const bodyHTML = `
      <div class="summary-grid">
        <div class="summary-card"><div class="label">الجلسات في ${periodLabel}</div><div class="value">${attendanceSummary.total}</div></div>
        <div class="summary-card"><div class="label">معدل الحضور</div><div class="value">${attendanceSummary.rate}%</div></div>
        <div class="summary-card"><div class="label">إكمال التمارين</div><div class="value">${exerciseSummary.rate}%</div></div>
      </div>
      <p class="section-title">ملخص الحضور (${periodLabel})</p>
      <table><thead><tr><th>البيان</th><th>العدد</th></tr></thead><tbody>
        <tr><td>إجمالي الجلسات</td><td>${attendanceSummary.total}</td></tr>
        <tr><td>جلسات حضرها</td><td>${attendanceSummary.attended}</td></tr>
        <tr><td>جلسات غابها</td><td>${attendanceSummary.missed}</td></tr>
        <tr><td>معدل الحضور</td><td>${attendanceSummary.rate}%</td></tr>
      </tbody></table>
      <p class="section-title">ملخص التمارين</p>
      <table><thead><tr><th>البيان</th><th>العدد</th></tr></thead><tbody>
        <tr><td>إجمالي التمارين</td><td>${exerciseSummary.total}</td></tr>
        <tr><td>تمارين مكتملة</td><td>${exerciseSummary.completed}</td></tr>
        <tr><td>نسبة الإكمال</td><td>${exerciseSummary.rate}%</td></tr>
      </tbody></table>
      <p class="section-title">تقدم أهداف العلاج</p>
      <table><thead><tr><th>الهدف</th><th>التقدم</th></tr></thead><tbody>
        ${goalsRows}
      </tbody></table>
      ${latestSession?.nextRecommendations ? `
      <p class="section-title">توصيات المعالج للمنزل</p>
      <p>${latestSession.nextRecommendations}</p>
      ` : ""}
    `;
    printReport({
      title: `تقرير رعاية ${patient.fullName} — ${periodLabel}`,
      bodyHTML,
    });
    showToast("تم فتح نافذة الطباعة", "info");
  }

  return (
    <PageContainer maxWidth="max-w-4xl" className="py-8">
      <PageHeader
        title="التقارير"
        subtitle={`تقارير بسيطة عن رعاية ${patient.fullName}`}
        actions={<DemoDataBadge />}
      />
      <h2 ref={headingRef} className="sr-only">صفحة التقارير</h2>

      {/* Period toggle */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="report-period" className="block text-sm font-semibold text-neutral-600 mb-1">
              فترة التقرير
            </label>
            <Select
              id="report-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
            >
              <option value="weekly">تقرير أسبوعي</option>
              <option value="monthly">تقرير شهري</option>
            </Select>
          </div>
          <Button
            variant="primary"
            leftIcon={<Printer className="h-5 w-5" aria-hidden="true" />}
            onClick={handlePrint}
          >
            طباعة التقرير
          </Button>
        </div>
        <p className="text-sm text-neutral-500 mt-3">
          الفترة: من {formatDate(periodStart)} إلى {formatDate(periodEnd)}
        </p>
      </Card>

      {/* Attendance summary */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-6 w-6 text-success-600" aria-hidden="true" />
          <h3 className="text-xl font-bold text-ink">ملخص الحضور ({periodLabel})</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center bg-neutral-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-ink">{attendanceSummary.total}</p>
            <p className="text-sm text-neutral-600 mt-1">إجمالي الجلسات</p>
          </div>
          <div className="text-center bg-success-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-success-700">{attendanceSummary.attended}</p>
            <p className="text-sm text-neutral-600 mt-1">حضرها</p>
          </div>
          <div className="text-center bg-error-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-error-700">{attendanceSummary.missed}</p>
            <p className="text-sm text-neutral-600 mt-1">غابها</p>
          </div>
          <div className="text-center bg-primary-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-primary-700">{attendanceSummary.rate}%</p>
            <p className="text-sm text-neutral-600 mt-1">معدل الحضور</p>
          </div>
        </div>
        <p className="text-base text-neutral-600 mt-4 leading-relaxed">
          {attendanceSummary.total > 0
            ? `حضر ${patient.fullName} ${attendanceSummary.attended} جلسة من أصل ${attendanceSummary.total} جلسة في ${periodLabel}. معدل الحضور ${attendanceSummary.rate}%.`
            : `لا توجد جلسات في ${periodLabel} الماضي.`}
        </p>
      </Card>

      {/* Exercise completion rate */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Dumbbell className="h-6 w-6 text-primary-600" aria-hidden="true" />
          <h3 className="text-xl font-bold text-ink">نسبة إكمال التمارين</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center bg-neutral-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-ink">{exerciseSummary.total}</p>
            <p className="text-sm text-neutral-600 mt-1">إجمالي التمارين</p>
          </div>
          <div className="text-center bg-success-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-success-700">{exerciseSummary.completed}</p>
            <p className="text-sm text-neutral-600 mt-1">تمارين مكتملة</p>
          </div>
          <div className="text-center bg-primary-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-primary-700">{exerciseSummary.rate}%</p>
            <p className="text-sm text-neutral-600 mt-1">نسبة الإكمال</p>
          </div>
        </div>
        <PatientProgressIndicator value={exerciseSummary.rate} />
        <p className="text-base text-neutral-600 mt-3 leading-relaxed">
          {exerciseSummary.total > 0
            ? `أنجز ${patient.fullName} ${exerciseSummary.completed} تمرين من أصل ${exerciseSummary.total} تمارين.`
            : `لا توجد تمارين مسجلة لـ${patient.fullName} بعد.`}
        </p>
      </Card>

      {/* Goal progress summary */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-6 w-6 text-primary-600" aria-hidden="true" />
          <h3 className="text-xl font-bold text-ink">تقدم أهداف العلاج</h3>
        </div>
        {activePlan ? (
          <>
            <p className="text-lg font-semibold text-ink mb-4">{activePlan.title}</p>
            <div className="space-y-6">
              {activePlan.goals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex items-start gap-2 mb-2">
                    <Target className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-base font-semibold text-ink">{goal.text}</p>
                  </div>
                  <PatientProgressIndicator value={goal.progress} />
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-100">
              <PatientProgressIndicator value={activePlan.progress} />
              <p className="text-sm text-neutral-600 mt-2">التقدم الإجمالي للخطة</p>
            </div>
          </>
        ) : (
          <EmptyState
            icon={<Target className="h-12 w-12" aria-hidden="true" />}
            title="لا توجد خطة علاجية نشطة"
            description="عندما يضع المعالج خطة علاجية ستظهر أهدافها وتقدمها هنا."
          />
        )}
      </Card>

      {/* Therapist notes approved for family display */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Home className="h-6 w-6 text-primary-600" aria-hidden="true" />
          <h3 className="text-xl font-bold text-ink">توصيات المعالج للمنزل</h3>
        </div>
        {latestSession?.nextRecommendations ? (
          <>
            <Alert tone="info" title="آخر توصيات المعالج">
              {latestSession.nextRecommendations}
            </Alert>
            <p className="text-sm text-neutral-500 mt-3">
              صدرت هذه التوصيات بعد آخر جلسة بتاريخ {formatDate(latestSession.date)}
            </p>
          </>
        ) : (
          <EmptyState
            icon={<Home className="h-12 w-12" aria-hidden="true" />}
            title="لا توجد توصيات منزلية بعد"
            description="بعد أول جلسة، سيضع المعالج توصيات بسيطة لمساعدتك في المنزل."
          />
        )}
      </Card>

      {/* Print action */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          size="lg"
          leftIcon={<Printer className="h-6 w-6" aria-hidden="true" />}
          onClick={handlePrint}
        >
          طباعة التقرير الكامل
        </Button>
      </div>

      {/* Note about data */}
      <div className="mt-6">
        <div className="flex items-start gap-3 text-base text-neutral-600">
          <Sparkles className="h-5 w-5 text-neutral-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">
            يعرض التقرير البيانات المسموح بها لحساب ولي الأمر. عند الطباعة سيظهر باللغة العربية ومن اليمين إلى اليسار مع وسم "بيانات النظام".
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
