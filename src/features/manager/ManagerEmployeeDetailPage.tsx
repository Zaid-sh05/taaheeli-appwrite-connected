import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import { ArrowRight, Phone, Mail, Calendar, Briefcase, Users } from "lucide-react";
import type { EmployeeRole } from "@/types/demo";

const roleLabels: Record<EmployeeRole, string> = {
  doctor: "طبيب",
  therapist: "أخصائي علاج",
  admin: "إداري",
  nurse: "ممرض",
  coordinator: "منسق",
};

export function ManagerEmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useDemoData();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  useDocumentTitle("تفاصيل الموظف");

  const employee = useMemo(() => data.employees.find((e) => e.id === id), [data.employees, id]);
  const assignedPatients = useMemo(() => data.patients.filter((p) => p.assignedTherapistId === id), [data.patients, id]);
  const todayAppts = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return data.appointments.filter((a) => a.employeeId === id && a.date === today).sort((a, b) => a.time.localeCompare(b.time));
  }, [data.appointments, id]);
  const recentSessions = useMemo(() => data.sessions.filter((s) => s.employeeId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5), [data.sessions, id]);

  if (!employee) {
    return (
      <PageContainer maxWidth="max-w-3xl" className="py-8">
        <Alert tone="error" title="الموظف غير موجود">
          لم يتم العثور على هذا الموظف. <Link to="/manager/employees" className="font-semibold underline">العودة للقائمة</Link>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="max-w-3xl" className="py-8">
      <div className="mb-4">
        <Link to="/manager/employees" className="inline-flex items-center gap-1 text-base font-semibold text-primary-700 hover:underline">
          <ArrowRight className="h-5 w-5" aria-hidden="true" /> العودة لقائمة الموظفين
        </Link>
      </div>

      <PageHeader title={employee.fullName} subtitle={roleLabels[employee.role]} />
      <h2 ref={headingRef} className="sr-only">تفاصيل الموظف</h2>

      <div className="mb-4 flex items-center gap-2">
        <Badge tone={employee.employmentStatus === "active" ? "success" : "warning"}>{employee.employmentStatus === "active" ? "نشط" : "في إجازة"}</Badge>
        <Badge tone="primary">{employee.specialty}</Badge>
      </div>

      <Card className="mb-6">
        <h3 className="text-xl font-bold text-ink mb-4">المعلومات المهنية</h3>
        <dl className="space-y-3">
          <div className="flex justify-between border-b border-neutral-100 pb-2"><dt className="font-semibold text-neutral-600">الدور</dt><dd className="text-ink">{roleLabels[employee.role]}</dd></div>
          <div className="flex justify-between border-b border-neutral-100 pb-2"><dt className="font-semibold text-neutral-600">التخصص</dt><dd className="text-ink">{employee.specialty}</dd></div>
          <div className="flex justify-between border-b border-neutral-100 pb-2"><dt className="font-semibold text-neutral-600">تاريخ التعيين</dt><dd className="text-ink"><Calendar className="inline h-4 w-4 ms-1" aria-hidden="true" />{formatDate(employee.hireDate)}</dd></div>
          {employee.phone && <div className="flex justify-between border-b border-neutral-100 pb-2"><dt className="font-semibold text-neutral-600">الهاتف</dt><dd className="text-ink"><Phone className="inline h-4 w-4 ms-1" aria-hidden="true" />{employee.phone}</dd></div>}
          {employee.email && <div className="flex justify-between border-b border-neutral-100 pb-2"><dt className="font-semibold text-neutral-600">البريد الإلكتروني</dt><dd className="text-ink"><Mail className="inline h-4 w-4 ms-1" aria-hidden="true" />{employee.email}</dd></div>}
        </dl>
      </Card>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-xl font-bold text-ink mb-4 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary-600" aria-hidden="true" /> عبء العمل</h3>
          <dl className="space-y-3">
            <div className="flex justify-between"><dt className="font-semibold text-neutral-600">الحالات المسندة</dt><dd className="text-2xl font-bold text-ink">{employee.assignedCaseCount}</dd></div>
            <div className="flex justify-between"><dt className="font-semibold text-neutral-600">مواعيد اليوم</dt><dd className="text-2xl font-bold text-ink">{employee.todayAppointmentCount}</dd></div>
          </dl>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-ink mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-primary-600" aria-hidden="true" /> المستفيدون المسندون</h3>
          {assignedPatients.length === 0 ? <p className="text-base text-neutral-500 text-center py-4">لا يوجد مستفيدون مسندون</p> : (
            <ul className="space-y-2">
              {assignedPatients.map((p) => (
                <li key={p.id}><Link to={`/manager/patients/${p.id}`} className="text-base font-semibold text-primary-700 hover:underline">{p.fullName}</Link> <span className="text-sm text-neutral-500">— {p.fileNumber}</span></li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mb-6">
        <h3 className="text-xl font-bold text-ink mb-4">مواعيد اليوم</h3>
        {todayAppts.length === 0 ? <p className="text-base text-neutral-500 text-center py-4">لا توجد مواعيد اليوم</p> : (
          <ul className="space-y-2">
            {todayAppts.map((a) => {
              const patient = data.patients.find((p) => p.id === a.patientId);
              return <li key={a.id} className="flex justify-between py-2 border-b border-neutral-100 last:border-0"><span className="font-semibold text-ink">{a.time}</span><span className="text-neutral-600">{patient?.fullName ?? "—"} — {a.type}</span></li>;
            })}
          </ul>
        )}
      </Card>

      {recentSessions.length > 0 && (
        <Card>
          <h3 className="text-xl font-bold text-ink mb-4">الجلسات الأخيرة</h3>
          <ul className="space-y-3">
            {recentSessions.map((s) => {
              const patient = data.patients.find((p) => p.id === s.patientId);
              return <li key={s.id} className="py-2 border-b border-neutral-100 last:border-0"><p className="text-base font-semibold text-ink">{patient?.fullName ?? "—"} — {s.type}</p><p className="text-sm text-neutral-500">{formatDate(s.date)} | {s.notes}</p></li>;
            })}
          </ul>
        </Card>
      )}
    </PageContainer>
  );
}
