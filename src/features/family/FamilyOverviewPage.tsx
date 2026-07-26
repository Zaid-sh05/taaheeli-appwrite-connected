import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { PatientProgressIndicator } from "@/components/manager/PatientProgressIndicator";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatDate, formatRelative } from "@/lib/format";
import { CalendarDays, CalendarClock, Stethoscope, User, Heart, Activity, Bell, Chrome as Home, Sparkles, MessageCircle, TrendingUp, CircleCheck as CheckCircle2, Video } from "lucide-react";

export function FamilyOverviewPage() {
  useDocumentTitle("صفحة الأسرة");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data, markNotificationRead } = useDemoData();

  // Identify the linked patient: first patient with a caregiverName field, else patients[0].
  const patient = useMemo(
    () => data.patients.find((p) => p.caregiverName) ?? data.patients[0],
    [data.patients],
  );

  const today = new Date().toISOString().split("T")[0];

  // Next upcoming appointment for this patient
  const nextAppointment = useMemo(() => {
    return data.appointments
      .filter((a) => a.patientId === patient.id && a.status === "scheduled" && a.date >= today)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  }, [data.appointments, patient.id, today]);

  // Assigned therapist
  const therapist = useMemo(
    () => data.employees.find((e) => e.id === patient.assignedTherapistId),
    [data.employees, patient.assignedTherapistId],
  );

  // Active treatment plan
  const activePlan = useMemo(
    () => data.treatmentPlans.find((tp) => tp.patientId === patient.id && tp.status === "active"),
    [data.treatmentPlans, patient.id],
  );

  // Sessions for this patient only
  const patientSessions = useMemo(
    () => data.sessions.filter((s) => s.patientId === patient.id),
    [data.sessions, patient.id],
  );

  // Attendance summary
  const attendanceSummary = useMemo(() => {
    const total = patientSessions.length;
    const attended = patientSessions.filter((s) => s.attendance === "attended").length;
    return { total, attended };
  }, [patientSessions]);

  // Latest completed session with recommendations (home recommendations from therapist)
  const latestSession = useMemo(() => {
    return patientSessions
      .filter((s) => s.status === "completed")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [patientSessions]);

  // Unread notifications for family role (targetRole "parent")
  const familyAlerts = useMemo(
    () => data.notifications.filter((n) => n.targetRole === "parent" && !n.read),
    [data.notifications],
  );

  function handleReadAlert(id: string) {
    markNotificationRead(id);
  }

  return (
    <PageContainer maxWidth="max-w-4xl" className="py-8">
      <PageHeader
        title={`أهلاً ${patient.caregiverName ?? "بك"}`}
        subtitle={`متابعة رحلة ${patient.fullName} في برنامج التأهيل`}
        actions={<DemoDataBadge />}
      />
      <h2 ref={headingRef} className="sr-only">لوحة متابعة الأسرة</h2>

      {/* Patient summary card */}
      <Card className="mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="rounded-full bg-accent-100 p-3 shrink-0">
            <Heart className="h-8 w-8 text-accent-700" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold text-ink mb-1">{patient.fullName}</p>
            <p className="text-base text-neutral-600">
              رقم الملف: {patient.fileNumber}
            </p>
            {patient.caregiverName && (
              <p className="text-base text-neutral-600 mt-1">
                مقدم الرعاية: {patient.caregiverName}
                {patient.caregiverRelation ? ` (${patient.caregiverRelation})` : ""}
              </p>
            )}
          </div>
          <Badge tone={patient.status === "active" ? "success" : "neutral"}>
            {patient.status === "active" ? "نشط" : "غير نشط"}
          </Badge>
        </div>
      </Card>

      {/* Current plan in simple language */}
      {activePlan ? (
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-6 w-6 text-primary-600" aria-hidden="true" />
            <h3 className="text-xl font-bold text-ink">الخطة العلاجية الحالية</h3>
          </div>
          <p className="text-lg font-semibold text-ink mb-2">{activePlan.title}</p>
          <p className="text-base text-neutral-600 mb-3">
            عدد الجلسات: {activePlan.sessionFrequency}
          </p>
          <p className="text-sm font-semibold text-neutral-600 mb-2">أهداف العلاج:</p>
          <ul className="space-y-2 mb-4">
            {activePlan.goals.map((goal) => (
              <li key={goal.id} className="flex items-start gap-2 text-base text-neutral-700">
                <Heart className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{goal.text}</span>
              </li>
            ))}
          </ul>
          <PatientProgressIndicator value={activePlan.progress} />
          <p className="text-base text-neutral-600 mt-3 leading-relaxed">
            هذه الخطة يضعها المعالج لمساعدة {patient.fullName} على التحسن. كل تقدم يقرّبه من أهدافه.
          </p>
        </Card>
      ) : (
        <Card className="mb-6">
          <EmptyState
            icon={<Activity className="h-12 w-12" aria-hidden="true" />}
            title="لا توجد خطة علاجية نشطة"
            description="عندما يضع المعالج خطة علاجية ستظهر هنا بأسلوب بسيط."
          />
        </Card>
      )}

      {/* Recent progress indicator */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-6 w-6 text-primary-600" aria-hidden="true" />
          <h3 className="text-xl font-bold text-ink">التقدم الحالي</h3>
        </div>
        <PatientProgressIndicator value={patient.progress} />
        <p className="text-base text-neutral-600 mt-3 leading-relaxed">
          هذا مؤشر بسيط يوضح مدى تقدم {patient.fullName} في رحلة التأهيل. استمري على المتابعة والدعم.
        </p>
      </Card>

      {/* Attendance summary */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-6 w-6 text-success-600" aria-hidden="true" />
          <h3 className="text-xl font-bold text-ink">ملخص الحضور</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-success-50 rounded-lg p-4">
            <p className="text-3xl font-bold text-success-700">{attendanceSummary.attended}</p>
            <p className="text-base text-neutral-600 mt-1">جلسات حضرها</p>
          </div>
          <div className="text-center bg-neutral-50 rounded-lg p-4">
            <p className="text-3xl font-bold text-ink">{attendanceSummary.total}</p>
            <p className="text-base text-neutral-600 mt-1">إجمالي الجلسات</p>
          </div>
        </div>
        <p className="text-base text-neutral-600 mt-4 leading-relaxed">
          {attendanceSummary.total > 0
            ? `حضر ${patient.fullName} ${attendanceSummary.attended} جلسة من أصل ${attendanceSummary.total} جلسات.`
            : `لا توجد جلسات مسجلة بعد لـ${patient.fullName}.`}
        </p>
      </Card>

      {/* Next appointment card */}
      {nextAppointment ? (
        <Card className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-6 w-6 text-primary-600" aria-hidden="true" />
              <h3 className="text-xl font-bold text-ink">الموعد القادم</h3>
            </div>
            <Badge tone={nextAppointment.channel === "video" ? "accent" : "primary"}>
              {nextAppointment.channel === "video" ? "عن بُعد (فيديو)" : "حضوري"}
            </Badge>
          </div>
          <div className="space-y-3 text-base text-neutral-700">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-neutral-400" aria-hidden="true" />
              <span>{formatDate(nextAppointment.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-neutral-400" aria-hidden="true" />
              <span>الساعة {nextAppointment.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-neutral-400" aria-hidden="true" />
              <span>النوع: {nextAppointment.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-neutral-400" aria-hidden="true" />
              <span>المعالج: {therapist?.fullName ?? "غير محدد"}</span>
            </div>
          </div>
          <div className="mt-5">
            <Link to="/family/appointments">
              <Button variant="secondary" fullWidth leftIcon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}>
                الذهاب إلى المواعيد
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="mb-6">
          <EmptyState
            icon={<CalendarDays className="h-12 w-12" aria-hidden="true" />}
            title="لا يوجد موعد قادم"
            description="عندما يتم جدولة موعد لـ{patient.fullName} سيظهر هنا."
            action={
              <Link to="/family/appointments">
                <Button variant="primary">الذهاب إلى المواعيد</Button>
              </Link>
            }
          />
        </Card>
      )}

      {/* Home recommendations from therapist */}
      {latestSession?.nextRecommendations ? (
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Home className="h-6 w-6 text-primary-600" aria-hidden="true" />
            <h3 className="text-xl font-bold text-ink">توصيات المنزل من المعالج</h3>
          </div>
          <Alert tone="info" title="آخر توصيات المعالج">
            {latestSession.nextRecommendations}
          </Alert>
          <p className="text-sm text-neutral-500 mt-3">
            صدرت هذه التوصيات بعد آخر جلسة بتاريخ {formatDate(latestSession.date)}
          </p>
        </Card>
      ) : (
        <Card className="mb-6">
          <EmptyState
            icon={<Home className="h-12 w-12" aria-hidden="true" />}
            title="لا توجد توصيات منزلية بعد"
            description="بعد أول جلسة، سيضع المعالج توصيات بسيطة لمساعدتك في المنزل."
          />
        </Card>
      )}

      {/* Alerts (unread notifications for family role) */}
      {familyAlerts.length > 0 && (
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-6 w-6 text-warning-600" aria-hidden="true" />
            <h3 className="text-xl font-bold text-ink">تنبيهات جديدة</h3>
            <Badge tone="warning">{familyAlerts.length}</Badge>
          </div>
          <div className="space-y-3">
            {familyAlerts.map((notif) => (
              <Alert key={notif.id} tone="info" title={notif.title}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p>{notif.message}</p>
                    <p className="text-sm text-neutral-500 mt-1">{formatRelative(notif.createdAt)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
                    onClick={() => handleReadAlert(notif.id)}
                  >
                    تعليم كمقروء
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/family/appointments">
          <Button variant="primary" size="lg" fullWidth leftIcon={<CalendarDays className="h-6 w-6" aria-hidden="true" />}>
            المواعيد
          </Button>
        </Link>
        <Link to="/family/progress">
          <Button variant="primary" size="lg" fullWidth leftIcon={<TrendingUp className="h-6 w-6" aria-hidden="true" />}>
            التقدم
          </Button>
        </Link>
        <Link to="/family/messages">
          <Button variant="primary" size="lg" fullWidth leftIcon={<MessageCircle className="h-6 w-6" aria-hidden="true" />}>
            الرسائل
          </Button>
        </Link>
        <Link to="/family/reports">
          <Button variant="primary" size="lg" fullWidth leftIcon={<Sparkles className="h-6 w-6" aria-hidden="true" />}>
            التقارير
          </Button>
        </Link>
      </div>

      {/* Video hint */}
      {nextAppointment?.channel === "video" && (
        <Card className="mt-6 bg-accent-50 border-accent-200">
          <div className="flex items-start gap-3">
            <Video className="h-6 w-6 text-accent-600 shrink-0" aria-hidden="true" />
            <p className="text-base text-neutral-700 leading-relaxed">
              الموعد القادم عن بُعد. يمكنك الذهاب إلى صفحة المواعيد والضغط على زر الانضمام عند وقت الموعد.
            </p>
          </div>
        </Card>
      )}
    </PageContainer>
  );
}
