import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { KpiCard } from "@/components/manager/KpiCard";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { ResetDemoDataButton } from "@/components/manager/ResetDemoDataButton";
import { RequestStatusBadge } from "@/components/manager/RequestStatusBadge";
import { AttendanceChart } from "@/components/charts/AttendanceChart";
import { MonthlySessionsChart } from "@/components/charts/MonthlySessionsChart";
import { formatRelative } from "@/lib/format";
import { UserPlus, Activity, Bell, Users, ClipboardList, TrendingUp, Clock } from "lucide-react";

export function ManagerOverviewPage() {
  useDocumentTitle("نظرة عامة");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data } = useDemoData();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const activePatients = data.patients.filter((p) => p.status === "active").length;
    const pendingRequests = data.requests.filter((r) => r.status === "pending").length;
    const todaySessions = data.sessions.filter((s) => s.date === today).length;
    const attendedSessions = data.sessions.filter((s) => s.attendance === "attended").length;
    const totalSessions = data.sessions.length;
    const attendanceRate = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;
    const avgProgress = data.patients.length > 0 ? Math.round(data.patients.reduce((sum, p) => sum + p.progress, 0) / data.patients.length) : 0;
    const unreadNotifs = data.notifications.filter((n) => !n.read).length;

    return { activePatients, pendingRequests, todaySessions, attendanceRate, avgProgress, totalPatients: data.patients.length, unreadNotifs };
  }, [data]);

  const recentRequests = useMemo(() =>
    [...data.requests].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).slice(0, 3),
  [data.requests]);

  const todayAppts = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return data.appointments.filter((a) => a.date === today).sort((a, b) => a.time.localeCompare(b.time));
  }, [data.appointments]);

  const attendanceData = useMemo(() => {
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
    return days.map((day, i) => {
      const daySessions = data.sessions.filter((s) => {
        const d = new Date(s.date);
        return d.getDay() === (i === 6 ? 0 : i + 1);
      });
      return {
        day,
        attended: daySessions.filter((s) => s.attendance === "attended").length,
        missed: daySessions.filter((s) => s.attendance === "missed").length,
      };
    });
  }, [data.sessions]);

  const monthlyData = useMemo(() => {
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"];
    return months.map((month, i) => ({
      month,
      count: Math.floor(20 + Math.random() * 30 + i * 5),
    }));
  }, []);

  const recentActivity = useMemo(() =>
    [...data.sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4),
  [data.sessions]);

  const alerts = useMemo(() => data.notifications.filter((n) => !n.read).slice(0, 3), [data.notifications]);

  return (
    <PageContainer maxWidth="max-w-5xl" className="py-8">
      <PageHeader
        title="نظرة عامة"
        subtitle="ملخص نشاط المركز"
        actions={<div className="flex items-center gap-2"><DemoDataBadge /><ResetDemoDataButton /></div>}
      />
      <h2 ref={headingRef} className="sr-only">لوحة تحكم مدير المركز</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KpiCard label="إجمالي المستفيدين" value={stats.totalPatients} icon="Users" tone="primary" linkTo="/manager/patients" />
        <KpiCard label="الحسابات النشطة" value={stats.activePatients} icon="UserCheck" tone="success" linkTo="/manager/patients" />
        <KpiCard label="طلبات بانتظار التفعيل" value={stats.pendingRequests} icon="UserPlus" tone="warning" linkTo="/manager/requests" />
        <KpiCard label="جلسات اليوم" value={stats.todaySessions} icon="CalendarDays" tone="accent" linkTo="/manager/reports" />
        <KpiCard label="معدل الحضور" value={`${stats.attendanceRate}%`} icon="TrendingUp" tone="success" linkTo="/manager/reports" />
        <KpiCard label="متوسط التقدم" value={`${stats.avgProgress}%`} icon="Activity" tone="primary" linkTo="/manager/patients" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Sessions today */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-ink">جلسات اليوم</h3>
            <Link to="/manager/reports" className="text-base font-semibold text-primary-700 hover:underline">عرض الكل</Link>
          </div>
          {todayAppts.length === 0 ? (
            <p className="text-base text-neutral-500 py-4 text-center">لا توجد جلسات اليوم</p>
          ) : (
            <ul className="space-y-2">
              {todayAppts.map((a) => {
                const patient = data.patients.find((p) => p.id === a.patientId);
                const employee = data.employees.find((e) => e.id === a.employeeId);
                return (
                  <li key={a.id} className="flex items-center justify-between gap-2 py-2 border-b border-neutral-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-neutral-400 shrink-0" aria-hidden="true" />
                      <span className="text-base font-semibold text-ink">{a.time}</span>
                      <span className="text-base text-neutral-600">{patient?.fullName ?? "—"}</span>
                    </div>
                    <div className="text-sm text-neutral-500 text-end">
                      <span>{a.type}</span>
                      <span className="block">{employee?.fullName ?? ""}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Recent requests */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-ink">طلبات التسجيل الأخيرة</h3>
            <Link to="/manager/requests" className="text-base font-semibold text-primary-700 hover:underline">عرض الكل</Link>
          </div>
          {recentRequests.length === 0 ? (
            <p className="text-base text-neutral-500 py-4 text-center">لا توجد طلبات</p>
          ) : (
            <ul className="space-y-3">
              {recentRequests.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 py-2 border-b border-neutral-100 last:border-0">
                  <Link to={`/manager/requests/${r.id}`} className="flex items-center gap-2 hover:underline">
                    <UserPlus className="h-5 w-5 text-neutral-400 shrink-0" aria-hidden="true" />
                    <span className="text-base font-semibold text-ink">{r.fullName}</span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-500">{formatRelative(r.submittedAt)}</span>
                    <RequestStatusBadge status={r.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Attendance chart */}
        <Card>
          <h3 className="text-xl font-bold text-ink mb-4">الحضور الأسبوعي</h3>
          <AttendanceChart data={attendanceData} />
        </Card>

        {/* Monthly sessions chart */}
        <Card>
          <h3 className="text-xl font-bold text-ink mb-4">الجلسات الشهرية</h3>
          <MonthlySessionsChart data={monthlyData} />
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Recent activity */}
        <Card>
          <h3 className="text-xl font-bold text-ink mb-4">النشاط الأخير</h3>
          <ul className="space-y-3">
            {recentActivity.map((s) => {
              const patient = data.patients.find((p) => p.id === s.patientId);
              const employee = data.employees.find((e) => e.id === s.employeeId);
              return (
                <li key={s.id} className="flex items-start gap-3 py-2 border-b border-neutral-100 last:border-0">
                  <Activity className="h-5 w-5 text-neutral-400 shrink-0 mt-1" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-base text-ink"><span className="font-semibold">{patient?.fullName ?? "—"}</span> — {s.type}</p>
                    <p className="text-sm text-neutral-500">{employee?.fullName ?? ""} | {formatRelative(s.date)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Alerts */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-ink">تنبيهات تتطلب انتباهك</h3>
            <Link to="/manager/notifications" className="text-base font-semibold text-primary-700 hover:underline">عرض الكل</Link>
          </div>
          {alerts.length === 0 ? (
            <p className="text-base text-neutral-500 py-4 text-center">لا توجد تنبيهات غير مقروءة</p>
          ) : (
            <ul className="space-y-3">
              {alerts.map((n) => (
                <li key={n.id} className="flex items-start gap-3 py-2 border-b border-neutral-100 last:border-0">
                  <Bell className="h-5 w-5 text-warning-600 shrink-0 mt-1" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-base font-semibold text-ink">{n.title}</p>
                    <p className="text-sm text-neutral-600">{n.message}</p>
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
          <Link to="/manager/requests"><Button variant="secondary" leftIcon={<UserPlus className="h-5 w-5" aria-hidden="true" />}>طلبات التفعيل</Button></Link>
          <Link to="/manager/patients"><Button variant="secondary" leftIcon={<Users className="h-5 w-5" aria-hidden="true" />}>المستفيدون</Button></Link>
          <Link to="/manager/employees"><Button variant="secondary" leftIcon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}>الموظفون</Button></Link>
          <Link to="/manager/reports"><Button variant="secondary" leftIcon={<TrendingUp className="h-5 w-5" aria-hidden="true" />}>التقارير</Button></Link>
        </div>
      </Card>
    </PageContainer>
  );
}
