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
import { PatientProgressIndicator } from "@/components/manager/PatientProgressIndicator";
import { formatDate } from "@/lib/format";
import { ArrowRight, Calendar, Phone, Mail, Users, Activity } from "lucide-react";

export function ManagerPatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useDemoData();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  useDocumentTitle("ملخص المستفيد");

  const patient = useMemo(() => data.patients.find((p) => p.id === id), [data.patients, id]);
  const therapist = useMemo(() => data.employees.find((e) => e.id === patient?.assignedTherapistId), [data.employees, patient]);
  const sessions = useMemo(() => data.sessions.filter((s) => s.patientId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [data.sessions, id]);
  const plans = useMemo(() => data.treatmentPlans.filter((tp) => tp.patientId === id), [data.treatmentPlans, id]);
  const exercises = useMemo(() => data.exercises.filter((ex) => ex.patientId === id), [data.exercises, id]);

  if (!patient) {
    return (
      <PageContainer maxWidth="max-w-3xl" className="py-8">
        <Alert tone="error" title="المستفيد غير موجود">
          لم يتم العثور على هذا المستفيد. <Link to="/manager/patients" className="font-semibold underline">العودة للقائمة</Link>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="max-w-3xl" className="py-8">
      <div className="mb-4">
        <Link to="/manager/patients" className="inline-flex items-center gap-1 text-base font-semibold text-primary-700 hover:underline">
          <ArrowRight className="h-5 w-5" aria-hidden="true" /> العودة لقائمة المستفيدين
        </Link>
      </div>

      <PageHeader title={patient.fullName} subtitle={`رقم الملف: ${patient.fileNumber}`} />
      <h2 ref={headingRef} className="sr-only">ملخص المستفيد</h2>

      <div className="mb-4 flex items-center gap-2">
        <Badge tone={patient.status === "active" ? "success" : "neutral"}>{patient.status === "active" ? "نشط" : "غير نشط"}</Badge>
      </div>

      <Card className="mb-6">
        <h3 className="text-xl font-bold text-ink mb-4">البيانات الشخصية</h3>
        <dl className="space-y-3">
          <div className="flex justify-between border-b border-neutral-100 pb-2">
            <dt className="font-semibold text-neutral-600">تاريخ الميلاد</dt>
            <dd className="text-ink"><Calendar className="inline h-4 w-4 ms-1" aria-hidden="true" />{patient.birthDate}</dd>
          </div>
          <div className="flex justify-between border-b border-neutral-100 pb-2">
            <dt className="font-semibold text-neutral-600">الجنس</dt>
            <dd className="text-ink">{patient.gender === "male" ? "ذكر" : patient.gender === "female" ? "أنثى" : "—"}</dd>
          </div>
          {patient.phone && <div className="flex justify-between border-b border-neutral-100 pb-2"><dt className="font-semibold text-neutral-600">الهاتف</dt><dd className="text-ink"><Phone className="inline h-4 w-4 ms-1" aria-hidden="true" />{patient.phone}</dd></div>}
          {patient.email && <div className="flex justify-between border-b border-neutral-100 pb-2"><dt className="font-semibold text-neutral-600">البريد الإلكتروني</dt><dd className="text-ink"><Mail className="inline h-4 w-4 ms-1" aria-hidden="true" />{patient.email}</dd></div>}
          <div className="flex justify-between border-b border-neutral-100 pb-2"><dt className="font-semibold text-neutral-600">المعالج المسؤول</dt><dd className="text-ink">{therapist?.fullName ?? "—"}</dd></div>
          {patient.caregiverName && <div className="flex justify-between border-b border-neutral-100 pb-2"><dt className="font-semibold text-neutral-600">مقدم الرعاية</dt><dd className="text-ink"><Users className="inline h-4 w-4 ms-1" aria-hidden="true" />{patient.caregiverName} ({patient.caregiverRelation})</dd></div>}
          <div className="flex justify-between border-b border-neutral-100 pb-2"><dt className="font-semibold text-neutral-600">آخر جلسة</dt><dd className="text-ink">{patient.lastSessionDate ? formatDate(patient.lastSessionDate) : "—"}</dd></div>
          <div className="flex justify-between border-b border-neutral-100 pb-2"><dt className="font-semibold text-neutral-600">الموعد القادم</dt><dd className="text-ink">{patient.nextAppointmentDate ? formatDate(patient.nextAppointmentDate) : "—"}</dd></div>
        </dl>
      </Card>

      <Card className="mb-6">
        <h3 className="text-xl font-bold text-ink mb-4">مستوى التقدم</h3>
        <PatientProgressIndicator value={patient.progress} />
      </Card>

      <Card className="mb-6">
        <h3 className="text-xl font-bold text-ink mb-4">الجلسات الأخيرة</h3>
        {sessions.length === 0 ? <p className="text-base text-neutral-500 text-center py-4">لا توجد جلسات مسجلة</p> : (
          <ul className="space-y-3">
            {sessions.slice(0, 5).map((s) => (
              <li key={s.id} className="flex items-start gap-3 py-2 border-b border-neutral-100 last:border-0">
                <Activity className="h-5 w-5 text-neutral-400 shrink-0 mt-1" aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-base text-ink"><span className="font-semibold">{s.type}</span> — {formatDate(s.date)}</p>
                  <p className="text-sm text-neutral-500">{s.notes} | {s.attendance === "attended" ? "حضر" : s.attendance === "missed" ? "غاب" : "تأخر"}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {plans.length > 0 && (
        <Card className="mb-6">
          <h3 className="text-xl font-bold text-ink mb-4">الخطط العلاجية</h3>
          <ul className="space-y-3">
            {plans.map((tp) => (
              <li key={tp.id} className="py-2 border-b border-neutral-100 last:border-0">
                <p className="text-base font-semibold text-ink">{tp.title}</p>
                <p className="text-sm text-neutral-500">من {formatDate(tp.startDate)} {tp.endDate ? `إلى ${formatDate(tp.endDate)}` : ""} | التقدم: {tp.progress}%</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {exercises.length > 0 && (
        <Card>
          <h3 className="text-xl font-bold text-ink mb-4">التمارين المسندة</h3>
          <ul className="space-y-3">
            {exercises.map((ex) => (
              <li key={ex.id} className="py-2 border-b border-neutral-100 last:border-0">
                <p className="text-base font-semibold text-ink">{ex.title}</p>
                <p className="text-sm text-neutral-600">{ex.description}</p>
                <p className="text-sm text-neutral-500">{ex.frequency}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </PageContainer>
  );
}
