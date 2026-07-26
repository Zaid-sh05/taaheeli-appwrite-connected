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
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatRelative } from "@/lib/format";
import {
  UserPlus,
  CalendarDays,
  CalendarClock,
  Bell,
  Activity,
  ClipboardList,
  FileText,
} from "lucide-react";

export function AdminOverviewPage() {
  useDocumentTitle("نظرة عامة إدارية");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data } = useDemoData();

  const today = new Date().toISOString().split("T")[0];

  const stats = useMemo(() => {
    const newRegistrations = data.requests.filter(
      (r) => r.status === "pending",
    ).length;
    const todayAppointments = data.appointments.filter(
      (a) => a.date === today && a.status === "scheduled",
    ).length;
    const unconfirmedAppointments = data.appointments.filter(
      (a) => a.status === "scheduled",
    ).length;
    const missingDocuments = data.documents.filter(
      (d) => d.status === "missing",
    ).length;
    const recentCancellations = data.appointments.filter(
      (a) => a.status === "cancelled",
    ).length;

    return {
      newRegistrations,
      todayAppointments,
      unconfirmedAppointments,
      missingDocuments,
      recentCancellations,
    };
  }, [data, today]);

  const recentActivity = useMemo(() => {
    const activities: {
      id: string;
      icon: React.ReactNode;
      title: string;
      subtitle: string;
      timestamp: string;
    }[] = [];

    const recentRequests = [...data.requests]
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      )
      .slice(0, 3);
    recentRequests.forEach((r) => {
      activities.push({
        id: r.id,
        icon: <UserPlus className="h-5 w-5 text-primary-600" aria-hidden="true" />,
        title: `طلب تسجيل جديد: ${r.fullName}`,
        subtitle: r.hasCaregiver
          ? `بمساعدة مرافق (${r.caregiverRelation})`
          : "تسجيل مباشر",
        timestamp: r.submittedAt,
      });
    });

    const recentAppts = [...data.appointments]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
    recentAppts.forEach((a) => {
      const patient = data.patients.find((p) => p.id === a.patientId);
      const employee = data.employees.find((e) => e.id === a.employeeId);
      activities.push({
        id: a.id,
        icon: (
          <CalendarClock
            className="h-5 w-5 text-accent-600"
            aria-hidden="true"
          />
        ),
        title: `موعد: ${patient?.fullName ?? "—"}`,
        subtitle: `${employee?.fullName ?? ""} — ${a.type}`,
        timestamp: a.date,
      });
    });

    const recentDocs = [...data.documents]
      .filter((d) => d.uploadedAt)
      .sort(
        (a, b) =>
          new Date(b.uploadedAt!).getTime() - new Date(a.uploadedAt!).getTime(),
      )
      .slice(0, 2);
    recentDocs.forEach((d) => {
      const patient = data.patients.find((p) => p.id === d.patientId);
      activities.push({
        id: d.id,
        icon: <FileText className="h-5 w-5 text-secondary-600" aria-hidden="true" />,
        title: `مستند: ${d.title}`,
        subtitle: patient?.fullName ?? "—",
        timestamp: d.uploadedAt!,
      });
    });

    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 8);
  }, [data]);

  const unreadNotifs = useMemo(
    () =>
      data.notifications.filter(
        (n) => !n.read && (n.targetRole === "admin" || !n.targetRole),
      ).length,
    [data.notifications],
  );

  const quickActions = useMemo(
    () => [
      {
        to: "/admin/registrations",
        label: "طلبات التسجيل",
        icon: <UserPlus className="h-5 w-5" aria-hidden="true" />,
      },
      {
        to: "/admin/appointments",
        label: "المواعيد",
        icon: <CalendarDays className="h-5 w-5" aria-hidden="true" />,
      },
      {
        to: "/admin/documents",
        label: "المستندات",
        icon: <ClipboardList className="h-5 w-5" aria-hidden="true" />,
      },
      {
        to: "/admin/notifications",
        label: "التنبيهات",
        icon: <Bell className="h-5 w-5" aria-hidden="true" />,
      },
    ],
    [],
  );

  return (
    <PageContainer maxWidth="max-w-5xl" className="py-8">
      <PageHeader
        title="اللوحة الإدارية"
        subtitle="نظرة عامة على المهام الإدارية والمتابعات"
        actions={<DemoDataBadge />}
      />
      <h2 ref={headingRef} className="sr-only">
        لوحة تحكم الموظف الإداري
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KpiCard
          label="طلبات تسجيل جديدة"
          value={stats.newRegistrations}
          icon="UserPlus"
          tone="warning"
          linkTo="/admin/registrations"
          subtitle="بانتظار المراجعة"
        />
        <KpiCard
          label="مواعيد اليوم"
          value={stats.todayAppointments}
          icon="CalendarDays"
          tone="primary"
          linkTo="/admin/appointments"
          subtitle="مجدولة لليوم"
        />
        <KpiCard
          label="مواعيد غير مؤكدة"
          value={stats.unconfirmedAppointments}
          icon="CalendarClock"
          tone="accent"
          linkTo="/admin/appointments"
          subtitle="بإنتظار التأكيد"
        />
        <KpiCard
          label="مستندات مفقودة"
          value={stats.missingDocuments}
          icon="FileWarning"
          tone="error"
          linkTo="/admin/documents"
          subtitle="تحتاج متابعة"
        />
        <KpiCard
          label="إلغاءات حديثة"
          value={stats.recentCancellations}
          icon="CalendarX"
          tone="warning"
          linkTo="/admin/appointments"
          subtitle="مواعيد ملغاة"
        />
        <KpiCard
          label="تنبيهات غير مقروءة"
          value={unreadNotifs}
          icon="Bell"
          tone="primary"
          linkTo="/admin/notifications"
          subtitle="تحتاج انتباهك"
        />
      </div>

      {/* Recent Activity */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-ink">النشاط الأخير</h3>
          <Activity className="h-5 w-5 text-neutral-400" aria-hidden="true" />
        </div>
        {recentActivity.length === 0 ? (
          <EmptyState
            icon={<Activity className="h-12 w-12" aria-hidden="true" />}
            title="لا يوجد نشاط حديث"
            description="لم يُسجل أي نشاط إداري بعد."
          />
        ) : (
          <ul className="space-y-3">
            {recentActivity.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 py-2 border-b border-neutral-100 last:border-0"
              >
                <span className="shrink-0 mt-1">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-ink">
                    {item.title}
                  </p>
                  <p className="text-sm text-neutral-600">{item.subtitle}</p>
                </div>
                <span className="text-sm text-neutral-500 shrink-0">
                  {formatRelative(item.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-xl font-bold text-ink mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to}>
              <Button
                variant="secondary"
                fullWidth
                leftIcon={action.icon}
              >
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}
