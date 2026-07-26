import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PatientProgressIndicator } from "@/components/manager/PatientProgressIndicator";
import { AttendanceChart } from "@/components/charts/AttendanceChart";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  ArrowRight,
  Calendar,
  Phone,
  Mail,
  Users,
  Activity,
  Stethoscope,
  ClipboardList,
  CalendarPlus,
  FileText,
  Bot,
} from "lucide-react";

type TabKey = "summary" | "plans" | "sessions" | "appointments" | "documents";

export function TherapistPatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useDemoData();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  useDocumentTitle("ملخص المستفيد");
  const [activeTab, setActiveTab] = useState<TabKey>("summary");

  const patient = useMemo(() => data.patients.find((p) => p.id === id), [data.patients, id]);

  const specialists = useMemo(
    () => data.employees.filter((e) => data.treatmentPlans.some((tp) => tp.patientId === id && tp.employeeId === e.id)),
    [data.employees, data.treatmentPlans, id],
  );

  const plans = useMemo(
    () => data.treatmentPlans.filter((tp) => tp.patientId === id),
    [data.treatmentPlans, id],
  );

  const sessions = useMemo(
    () => data.sessions.filter((s) => s.patientId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [data.sessions, id],
  );

  const appointments = useMemo(
    () => data.appointments.filter((a) => a.patientId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [data.appointments, id],
  );

  const documents = useMemo(() => data.documents.filter((d) => d.patientId === id), [data.documents, id]);

  const attendanceData = useMemo(() => {
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
    return days.map((day, i) => {
      const daySessions = sessions.filter((s) => {
        const d = new Date(s.date);
        return d.getDay() === (i === 6 ? 0 : i + 1);
      });
      return {
        day,
        attended: daySessions.filter((s) => s.attendance === "attended").length,
        missed: daySessions.filter((s) => s.attendance === "missed").length,
      };
    });
  }, [sessions]);

  if (!patient) {
    return (
      <PageContainer maxWidth="max-w-3xl" className="py-8">
        <Alert tone="error" title="المستفيد غير موجود">
          لم يتم العثور على هذا المستفيد. <Link to="/therapist/patients" className="font-semibold underline">العودة للقائمة</Link>
        </Alert>
      </PageContainer>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "summary", label: "البيانات الشخصية" },
    { key: "plans", label: "الخطط العلاجية" },
    { key: "sessions", label: "سجل الجلسات" },
    { key: "appointments", label: "المواعيد" },
    { key: "documents", label: "المستندات" },
  ];

  return (
    <PageContainer maxWidth="max-w-4xl" className="py-8">
      <div className="mb-4">
        <Link to="/therapist/patients" className="inline-flex items-center gap-1 text-base font-semibold text-primary-700 hover:underline">
          <ArrowRight className="h-5 w-5" aria-hidden="true" /> العودة لقائمة المستفيدين
        </Link>
      </div>

      <PageHeader title={patient.fullName} subtitle={`رقم الملف: ${patient.fileNumber}`} />
      <h2 ref={headingRef} className="sr-only">ملخص المستفيد</h2>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge tone={patient.status === "active" ? "success" : "neutral"}>
          {patient.status === "active" ? "نشط" : "غير نشط"}
        </Badge>
        <Badge tone="primary">التقدم: {patient.progress}%</Badge>
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Link to="/therapist/sessions/new">
          <Button variant="primary" leftIcon={<Stethoscope className="h-5 w-5" aria-hidden="true" />}>توثيق جلسة</Button>
        </Link>
        {plans.length > 0 && (
          <Link to={`/therapist/plans/${plans[0].id}`}>
            <Button variant="secondary" leftIcon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}>تعديل الخطة</Button>
          </Link>
        )}
        <Link to="/therapist/appointments">
          <Button variant="secondary" leftIcon={<CalendarPlus className="h-5 w-5" aria-hidden="true" />}>جدولة موعد</Button>
        </Link>
        <Link to={`/therapist/ai?patientId=${patient.id}`}>
          <Button variant="secondary" leftIcon={<Bot className="h-5 w-5" aria-hidden="true" />}>فتح المساعد الذكي</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-neutral-200">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={
                "px-4 py-3 text-base font-semibold transition-colors min-h-[48px] border-b-2 -mb-px " +
                (activeTab === tab.key
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-neutral-600 hover:text-primary-700 hover:border-neutral-300")
              }
              aria-current={activeTab === tab.key ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary tab */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-xl font-bold text-ink mb-4">البيانات الشخصية</h3>
            <dl className="space-y-3">
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">تاريخ الميلاد</dt>
                <dd className="text-ink"><Calendar className="inline h-5 w-5 ms-1" aria-hidden="true" />{patient.birthDate}</dd>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">الجنس</dt>
                <dd className="text-ink">{patient.gender === "male" ? "ذكر" : patient.gender === "female" ? "أنثى" : "—"}</dd>
              </div>
              {patient.phone && (
                <div className="flex justify-between border-b border-neutral-100 pb-2">
                  <dt className="font-semibold text-neutral-600">الهاتف</dt>
                  <dd className="text-ink"><Phone className="inline h-5 w-5 ms-1" aria-hidden="true" />{patient.phone}</dd>
                </div>
              )}
              {patient.email && (
                <div className="flex justify-between border-b border-neutral-100 pb-2">
                  <dt className="font-semibold text-neutral-600">البريد الإلكتروني</dt>
                  <dd className="text-ink"><Mail className="inline h-5 w-5 ms-1" aria-hidden="true" />{patient.email}</dd>
                </div>
              )}
              {patient.caregiverName && (
                <div className="flex justify-between border-b border-neutral-100 pb-2">
                  <dt className="font-semibold text-neutral-600">مقدم الرعاية</dt>
                  <dd className="text-ink"><Users className="inline h-5 w-5 ms-1" aria-hidden="true" />{patient.caregiverName} ({patient.caregiverRelation})</dd>
                </div>
              )}
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">آخر جلسة</dt>
                <dd className="text-ink">{patient.lastSessionDate ? formatDate(patient.lastSessionDate) : "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">الموعد القادم</dt>
                <dd className="text-ink">{patient.nextAppointmentDate ? formatDate(patient.nextAppointmentDate) : "—"}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-ink mb-4">الأخصائيون المسندون</h3>
            {specialists.length === 0 ? (
              <p className="text-base text-neutral-500 text-center py-4">لا يوجد أخصائيون مسندون</p>
            ) : (
              <ul className="space-y-3">
                {specialists.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                      <span className="text-base font-semibold text-ink">{s.fullName}</span>
                    </div>
                    <span className="text-sm text-neutral-600">{s.specialty}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-ink mb-4">مستوى التقدم</h3>
            <PatientProgressIndicator value={patient.progress} />
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-ink mb-4">رسم بياني للحضور</h3>
            <AttendanceChart data={attendanceData} />
          </Card>
        </div>
      )}

      {/* Plans tab */}
      {activeTab === "plans" && (
        <Card>
          <h3 className="text-xl font-bold text-ink mb-4">الخطط العلاجية</h3>
          {plans.length === 0 ? (
            <p className="text-base text-neutral-500 text-center py-4">لا توجد خطط علاجية مسجلة</p>
          ) : (
            <ul className="space-y-4">
              {plans.map((tp) => (
                <li key={tp.id} className="py-3 border-b border-neutral-100 last:border-0">
                  <Link to={`/therapist/plans/${tp.id}`} className="text-lg font-bold text-ink hover:underline">
                    {tp.title}
                  </Link>
                  <p className="text-sm text-neutral-500 mt-1">
                    من {formatDate(tp.startDate)} {tp.endDate ? `إلى ${formatDate(tp.endDate)}` : ""}
                    {tp.reviewDate ? ` | مراجعة: ${formatDate(tp.reviewDate)}` : ""}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge tone={tp.status === "active" ? "success" : tp.status === "completed" ? "primary" : tp.status === "paused" ? "warning" : "neutral"}>
                      {tp.status === "active" ? "نشطة" : tp.status === "completed" ? "مكتملة" : tp.status === "paused" ? "متوقفة" : "مسودة"}
                    </Badge>
                    <span className="text-sm text-neutral-600">التقدم: {tp.progress}%</span>
                  </div>
                  <div className="mt-2"><PatientProgressIndicator value={tp.progress} /></div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Sessions tab */}
      {activeTab === "sessions" && (
        <Card>
          <h3 className="text-xl font-bold text-ink mb-4">سجل الجلسات</h3>
          {sessions.length === 0 ? (
            <p className="text-base text-neutral-500 text-center py-4">لا توجد جلسات مسجلة</p>
          ) : (
            <ul className="space-y-3">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-start gap-3 py-2 border-b border-neutral-100 last:border-0">
                  <Activity className="h-5 w-5 text-neutral-400 shrink-0 mt-1" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-base text-ink">
                      <span className="font-semibold">{s.type}</span> — {formatDate(s.date)} ({s.durationMin} دقيقة)
                    </p>
                    <p className="text-sm text-neutral-500">{s.notes}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge tone={s.attendance === "attended" ? "success" : s.attendance === "missed" ? "error" : "warning"}>
                        {s.attendance === "attended" ? "حضر" : s.attendance === "missed" ? "غاب" : "تأخر"}
                      </Badge>
                      <Badge tone={s.status === "completed" ? "primary" : "neutral"}>
                        {s.status === "completed" ? "مكتملة" : "مسودة"}
                      </Badge>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Appointments tab */}
      {activeTab === "appointments" && (
        <Card>
          <h3 className="text-xl font-bold text-ink mb-4">المواعيد</h3>
          {appointments.length === 0 ? (
            <p className="text-base text-neutral-500 text-center py-4">لا توجد مواعيد مسجلة</p>
          ) : (
            <ul className="space-y-3">
              {appointments.map((a) => {
                const emp = data.employees.find((e) => e.id === a.employeeId);
                return (
                  <li key={a.id} className="flex items-start gap-3 py-2 border-b border-neutral-100 last:border-0">
                    <Calendar className="h-5 w-5 text-neutral-400 shrink-0 mt-1" aria-hidden="true" />
                    <div className="flex-1">
                      <p className="text-base text-ink">
                        <span className="font-semibold">{formatDate(a.date)}</span> — {a.time} ({a.durationMin} دقيقة)
                      </p>
                      <p className="text-sm text-neutral-600">
                        {a.type} — {a.channel === "video" ? "فيديو" : "حضوري"} — {emp?.fullName ?? ""}
                      </p>
                      <div className="mt-1">
                        <Badge tone={a.status === "completed" ? "success" : a.status === "missed" ? "error" : a.status === "cancelled" ? "neutral" : "primary"}>
                          {a.status === "completed" ? "مكتمل" : a.status === "missed" ? "غاب" : a.status === "cancelled" ? "ملغى" : "مجدول"}
                        </Badge>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {/* Documents tab */}
      {activeTab === "documents" && (
        <Card>
          <h3 className="text-xl font-bold text-ink mb-4">المستندات</h3>
          {documents.length === 0 ? (
            <p className="text-base text-neutral-500 text-center py-4">لا توجد مستندات مسجلة</p>
          ) : (
            <ul className="space-y-3">
              {documents.map((d) => (
                <li key={d.id} className="flex items-start gap-3 py-2 border-b border-neutral-100 last:border-0">
                  <FileText className="h-5 w-5 text-neutral-400 shrink-0 mt-1" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-base font-semibold text-ink">{d.title}</p>
                    <p className="text-sm text-neutral-500">
                      {d.uploadedAt ? formatDateTime(d.uploadedAt) : "لم يُرفع بعد"}
                      {d.notes ? ` — ${d.notes}` : ""}
                    </p>
                    <div className="mt-1">
                      <Badge tone={d.status === "received" ? "success" : d.status === "reviewed" ? "primary" : "warning"}>
                        {d.status === "received" ? "مستلم" : d.status === "reviewed" ? "تمت المراجعة" : "ناقص"}
                      </Badge>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-sm text-neutral-400">هذه مستندات تجريبية لأغراض العرض.</p>
        </Card>
      )}
    </PageContainer>
  );
}
