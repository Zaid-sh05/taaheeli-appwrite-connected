import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { useSession } from "@/context/SessionContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { KpiCard } from "@/components/manager/KpiCard";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatRelative, formatDate } from "@/lib/format";
import {
  Users,
  CalendarDays,
  ClipboardList,
  Clock,
  Bell,
  TrendingUp,
  Stethoscope,
} from "lucide-react";

export function TherapistOverviewPage() {
  useDocumentTitle("نظرة عامة");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data } = useDemoData();
  const { session } = useSession();

  // Identify the current therapist by matching session.username to an employee with role "doctor" or "therapist".
  // Fallback to employee "e2" (منيرة العنزي) who has the most assigned patients in the demo.
  const therapist = useMemo(() => {
    if (session?.username) {
      const match = data.employees.find(
        (e) =>
          (e.role === "doctor" || e.role === "therapist") &&
          (e.fullName === session.username || e.id === session.username),
      );
      if (match) return match;
    }
    return data.employees.find((e) => e.id === "e2") ?? data.employees.find((e) => e.role === "doctor" || e.role === "therapist");
  }, [data.employees, session]);

  const therapistId = therapist?.id ?? "e2";

  const myPatients = useMemo(
    () => data.patients.filter((p) => p.assignedTherapistId === therapistId),
    [data.patients, therapistId],
  );

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const myAppointments = data.appointments.filter((a) => a.employeeId === therapistId);
    const todayAppts = myAppointments.filter((a) => a.date === today);
    const mySessions = data.sessions.filter((s) => s.employeeId === therapistId);
    const awaitingDoc = mySessions.filter((s) => s.status === "draft").length;
    const myPlans = data.treatmentPlans.filter((tp) => tp.employeeId === therapistId);
    const activePlans = myPlans.filter((tp) => tp.status === "active").length;
    const plansAwaitingReview = myPlans.filter(
      (tp) => tp.status === "active" && tp.reviewDate && new Date(tp.reviewDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ).length;

    return {
      patientCount: myPatients.length,
      todayApptCount: todayAppts.length,
      awaitingDoc,
      activePlans,
      plansAwaitingReview,
    };
  }, [data.appointments, data.sessions, data.treatmentPlans, therapistId, myPatients]);

  const todayAppts = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return data.appointments
      .filter((a) => a.employeeId === therapistId && a.date === today)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [data.appointments, therapistId]);

  const followUpAlerts = useMemo(() => {
    return data.notifications
      .filter(
        (n) =>
          !n.read &&
          (n.targetRole === "doctor" || n.targetRole === undefined) &&
          (n.type === "patient-followup" || n.type === "plan-review" || n.type === "missed-appointment"),
      )
      .slice(0, 4);
  }, [data.notifications, myPatients]);

  const recentProgress = useMemo(() => {
    return myPatients
      .filter((p) => p.lastSessionDate)
      .sort((a, b) => new Date(b.lastSessionDate!).getTime() - new Date(a.lastSessionDate!).getTime())
      .slice(0, 5);
  }, [myPatients]);

  return (
    <PageContainer maxWidth="max-w-5xl" className="py-8">
      <PageHeader
        title={`مرحباً، ${therapist?.fullName ?? "أخصائي العلاج"}`}
        subtitle="لوحة تحكم الأخصائي العلاجي"
        actions={<DemoDataBadge />}
      />
      <h2 ref={headingRef} className="sr-only">
        لوحة تحكم الأخصائي العلاجي
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KpiCard label="المستفيدون المسندون" value={stats.patientCount} icon="Users" tone="primary" linkTo="/therapist/patients" />
        <KpiCard label="مواعيد اليوم" value={stats.todayApptCount} icon="CalendarDays" tone="accent" linkTo="/therapist/appointments" />
        <KpiCard label="جلسات بانتظار التوثيق" value={stats.awaitingDoc} icon="FileText" tone="warning" linkTo="/therapist/sessions/new" />
        <KpiCard label="الخطط النشطة" value={stats.activePlans} icon="ClipboardList" tone="success" linkTo="/therapist/plans" />
        <KpiCard label="خطط بانتظار المراجعة" value={stats.plansAwaitingReview} icon="ClipboardPlus" tone="secondary" linkTo="/therapist/plans" />
        <KpiCard label="إجمالي جلساتي" value={data.sessions.filter((s) => s.employeeId === therapistId).length} icon="Activity" tone="primary" linkTo="/therapist/patients" />
      </div>

      {/* Follow-up alerts */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-ink">تنبيهات المتابعة</h3>
          <Link to="/therapist/notifications" className="text-base font-semibold text-primary-700 hover:underline">
            عرض الكل
          </Link>
        </div>
        {followUpAlerts.length === 0 ? (
          <EmptyState icon={<Bell className="h-12 w-12" aria-hidden="true" />} title="لا توجد تنبيهات" description="لا توجد تنبيهات متابعة غير مقروءة حالياً." />
        ) : (
          <ul className="space-y-3">
            {followUpAlerts.map((n) => (
              <li key={n.id} className="flex items-start gap-3 py-2 border-b border-neutral-100 last:border-0">
                <Bell className="h-5 w-5 text-warning-600 shrink-0 mt-1" aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-base font-semibold text-ink">{n.title}</p>
                  <p className="text-sm text-neutral-600">{n.message}</p>
                  <p className="text-sm text-neutral-400 mt-1">{formatRelative(n.createdAt)}</p>
                </div>
                {n.link && (
                  <Link to={n.link} className="text-base font-semibold text-primary-700 hover:underline min-h-[48px] inline-flex items-center">
                    عرض
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Today's appointment timeline */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-ink">مواعيد اليوم</h3>
            <Link to="/therapist/appointments" className="text-base font-semibold text-primary-700 hover:underline">
              عرض الكل
            </Link>
          </div>
          {todayAppts.length === 0 ? (
            <EmptyState icon={<CalendarDays className="h-12 w-12" aria-hidden="true" />} title="لا توجد مواعيد اليوم" description="لا توجد مواعيد مجدولة لهذا اليوم." />
          ) : (
            <ul className="space-y-3">
              {todayAppts.map((a) => {
                const patient = data.patients.find((p) => p.id === a.patientId);
                return (
                  <li key={a.id} className="flex items-start gap-3 py-2 border-b border-neutral-100 last:border-0">
                    <div className="flex flex-col items-center shrink-0">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                        <Clock className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-base font-semibold text-ink">{patient?.fullName ?? "—"}</p>
                        <Badge tone={a.status === "completed" ? "success" : a.status === "missed" ? "error" : a.status === "cancelled" ? "neutral" : "primary"}>
                          {a.status === "completed" ? "مكتمل" : a.status === "missed" ? "غاب" : a.status === "cancelled" ? "ملغى" : "مجدول"}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-600">
                        {a.time} — {a.type} ({a.durationMin} دقيقة) — {a.channel === "video" ? "فيديو" : "حضوري"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Recent patient progress */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-ink">تقدم المستفيدين الأخير</h3>
            <Link to="/therapist/patients" className="text-base font-semibold text-primary-700 hover:underline">
              عرض الكل
            </Link>
          </div>
          {recentProgress.length === 0 ? (
            <EmptyState icon={<Users className="h-12 w-12" aria-hidden="true" />} title="لا توجد جلسات حديثة" description="لم يتم توثيق جلسات لمستفيديك بعد." />
          ) : (
            <ul className="space-y-3">
              {recentProgress.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 py-2 border-b border-neutral-100 last:border-0">
                  <Link to={`/therapist/patients/${p.id}`} className="flex items-center gap-2 hover:underline">
                    <TrendingUp className="h-5 w-5 text-neutral-400 shrink-0" aria-hidden="true" />
                    <span className="text-base font-semibold text-ink">{p.fullName}</span>
                  </Link>
                  <div className="text-sm text-neutral-500 text-end">
                    <span className="block">التقدم: {p.progress}%</span>
                    <span>آخر جلسة: {p.lastSessionDate ? formatDate(p.lastSessionDate) : "—"}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <h3 className="text-xl font-bold text-ink mb-4">إجراءات سريعة</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/therapist/patients">
            <Button variant="secondary" leftIcon={<Users className="h-5 w-5" aria-hidden="true" />}>المستفيدون</Button>
          </Link>
          <Link to="/therapist/plans">
            <Button variant="secondary" leftIcon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}>الخطط العلاجية</Button>
          </Link>
          <Link to="/therapist/appointments">
            <Button variant="secondary" leftIcon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}>المواعيد</Button>
          </Link>
          <Link to="/therapist/sessions/new">
            <Button variant="primary" leftIcon={<Stethoscope className="h-5 w-5" aria-hidden="true" />}>توثيق جلسة جديدة</Button>
          </Link>
          <Link to="/therapist/notifications">
            <Button variant="secondary" leftIcon={<Bell className="h-5 w-5" aria-hidden="true" />}>التنبيهات</Button>
          </Link>
        </div>
      </Card>
    </PageContainer>
  );
}
