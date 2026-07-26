import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { PatientProgressIndicator } from "@/components/manager/PatientProgressIndicator";
import { EmptyState } from "@/components/feedback/EmptyState";
import { AttendanceChart } from "@/components/charts/AttendanceChart";
import { CalendarDays, TrendingUp, Dumbbell, Target, Activity, Sparkles } from "lucide-react";

export function FamilyProgressPage() {
  useDocumentTitle("تقدم العلاج");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data } = useDemoData();

  // Identify the linked patient: first patient with a caregiverName field, else patients[0].
  const patient = useMemo(
    () => data.patients.find((p) => p.caregiverName) ?? data.patients[0],
    [data.patients],
  );

  // Sessions for this patient only
  const patientSessions = useMemo(
    () => data.sessions.filter((s) => s.patientId === patient.id),
    [data.sessions, patient.id],
  );

  // Attendance chart data (by day of week)
  const attendanceData = useMemo(() => {
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
    return days.map((day, i) => {
      const daySessions = patientSessions.filter((s) => {
        const d = new Date(s.date);
        return d.getDay() === (i === 6 ? 0 : i + 1);
      });
      return {
        day,
        attended: daySessions.filter((s) => s.attendance === "attended").length,
        missed: daySessions.filter((s) => s.attendance === "missed").length,
      };
    });
  }, [patientSessions]);

  // Completed sessions count
  const completedSessionsCount = useMemo(
    () => patientSessions.filter((s) => s.status === "completed").length,
    [patientSessions],
  );

  // Completed exercises count
  const patientExercises = useMemo(
    () => data.exercises.filter((ex) => ex.patientId === patient.id),
    [data.exercises, patient.id],
  );

  const completedExercisesCount = useMemo(
    () => patientExercises.filter((ex) => ex.status === "completed").length,
    [patientExercises],
  );

  // Active treatment plan with goals
  const activePlan = useMemo(
    () => data.treatmentPlans.find((tp) => tp.patientId === patient.id && tp.status === "active"),
    [data.treatmentPlans, patient.id],
  );

  return (
    <PageContainer maxWidth="max-w-4xl" className="py-8">
      <PageHeader
        title="تقدم العلاج"
        subtitle={`رحلة ${patient.fullName} في برنامج التأهيل`}
        actions={<DemoDataBadge />}
      />
      <h2 ref={headingRef} className="sr-only">صفحة تقدم العلاج</h2>

      {/* Overall progress */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-6 w-6 text-primary-600" aria-hidden="true" />
          <h3 className="text-xl font-bold text-ink">التقدم الإجمالي</h3>
        </div>
        <PatientProgressIndicator value={patient.progress} />
        <p className="text-base text-neutral-600 mt-3 leading-relaxed">
          هذا المؤشر يوضح مدى تقدم {patient.fullName} بشكل عام في رحلة التأهيل. كل خطوة صغيرة تُحدث فرقاً كبيراً.
        </p>
      </Card>

      {/* Attendance chart */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-6 w-6 text-success-600" aria-hidden="true" />
          <h3 className="text-xl font-bold text-ink">رسم بياني للحضور والغياب</h3>
        </div>
        {patientSessions.length > 0 ? (
          <>
            <AttendanceChart data={attendanceData} />
            <p className="text-base text-neutral-600 mt-4 leading-relaxed">
              هذا الرسم يوضح عدد الجلسات التي حضرها {patient.fullName} وعدد الجلسات التي غابها خلال أيام الأسبوع.
              الحضور المنتظم يساعد على تحقيق نتائج أفضل.
            </p>
          </>
        ) : (
          <EmptyState
            icon={<TrendingUp className="h-12 w-12" aria-hidden="true" />}
            title="لا توجد بيانات حضور بعد"
            description="بعد بدء الجلسات ستظهر بيانات الحضور هنا بشكل واضح."
          />
        )}
      </Card>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full bg-success-100 p-2 shrink-0">
              <Activity className="h-6 w-6 text-success-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-ink">الجلسات المكتملة</h3>
          </div>
          <p className="text-3xl font-bold text-ink mb-2">{completedSessionsCount}</p>
          <p className="text-base text-neutral-600 leading-relaxed">
            عدد الجلسات التي اكتملت لـ{patient.fullName}. كل جلسة مكتملة هي خطوة نحو التحسن.
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full bg-primary-100 p-2 shrink-0">
              <Dumbbell className="h-6 w-6 text-primary-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-ink">التمارين المكتملة</h3>
          </div>
          <p className="text-3xl font-bold text-ink mb-2">{completedExercisesCount}</p>
          <p className="text-base text-neutral-600 leading-relaxed">
            عدد التمارين التي أنجزها {patient.fullName}. أداء التمارين في المنزل يقوّي نتائج العلاج.
          </p>
        </Card>
      </div>

      {/* Goal progress for each goal in the active plan */}
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
                  <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                    {goal.progress >= 70
                      ? `تقدم ممتاز! ${patient.fullName} يقترب من تحقيق هذا الهدف.`
                      : goal.progress >= 40
                        ? `تقدم جيد. استمري على الدعم والمتابعة.`
                        : `لا تزال البداية. كل خطوة صغيرة تساعد على التقدم.`}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6">
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

      {/* Simple explanation */}
      <Alert tone="info" title="كيف نقرأ التقدم؟">
        <ul className="space-y-2">
          <li>• <strong>التقدم الإجمالي:</strong> نسبة مئوية توضح مدى تحسن {patient.fullName} بشكل عام.</li>
          <li>• <strong>الحضور:</strong> كلما زاد الحضور، كانت النتائج أفضل.</li>
          <li>• <strong>التمارين:</strong> أداء التمارين في المنزل يساعد على التحسن الأسرع.</li>
          <li>• <strong>الأهداف:</strong> كل هدف له نسبة تقدم خاصة. تحقيق الأهداف يتم تدريجياً.</li>
        </ul>
      </Alert>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/family/appointments">
          <Button variant="secondary" leftIcon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}>
            عرض المواعيد
          </Button>
        </Link>
        <Link to="/family/reports">
          <Button variant="secondary" leftIcon={<Sparkles className="h-5 w-5" aria-hidden="true" />}>
            عرض التقارير
          </Button>
        </Link>
      </div>
    </PageContainer>
  );
}
