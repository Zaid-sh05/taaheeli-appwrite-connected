import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { SearchInput } from "@/components/manager/SearchInput";
import { StatusFilter } from "@/components/manager/StatusFilter";
import { ConfirmDialog } from "@/components/manager/ConfirmDialog";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatDate } from "@/lib/format";
import { CalendarDays, Plus, Video, Check, Clock, CalendarX, CreditCard as Edit3 } from "lucide-react";
import type { Appointment, AppointmentChannel } from "@/types/demo";

type TabKey = "today" | "upcoming" | "previous";

const statusLabels: Record<Appointment["status"], string> = {
  scheduled: "مجدول",
  completed: "مكتمل",
  missed: "غاب",
  cancelled: "ملغى",
};

function statusTone(status: Appointment["status"]): "primary" | "success" | "error" | "neutral" {
  if (status === "completed") return "success";
  if (status === "missed") return "error";
  if (status === "cancelled") return "neutral";
  return "primary";
}

interface ApptForm {
  patientId: string;
  date: string;
  time: string;
  durationMin: string;
  type: string;
  channel: AppointmentChannel;
  notes: string;
}

const emptyApptForm: ApptForm = {
  patientId: "",
  date: new Date().toISOString().split("T")[0],
  time: "09:00",
  durationMin: "45",
  type: "",
  channel: "in-person",
  notes: "",
};

export function TherapistAppointmentsPage() {
  useDocumentTitle("المواعيد");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data, addAppointment, updateAppointment, cancelAppointment, confirmAttendance, markNoShow } = useDemoData();
  const { session } = useSession();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>("today");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [apptForm, setApptForm] = useState<ApptForm>(emptyApptForm);
  const [rescheduleForm, setRescheduleForm] = useState<{ date: string; time: string }>({ date: "", time: "" });
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Identify the current therapist. Fallback to employee "e2".
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

  const myAppointments = useMemo(
    () => data.appointments.filter((a) => a.employeeId === therapistId),
    [data.appointments, therapistId],
  );

  const myPatients = useMemo(
    () => data.patients.filter((p) => p.assignedTherapistId === therapistId),
    [data.patients, therapistId],
  );

  const today = new Date().toISOString().split("T")[0];

  const tabbedAppointments = useMemo(() => {
    let list = [...myAppointments];
    if (activeTab === "today") list = list.filter((a) => a.date === today);
    else if (activeTab === "upcoming") list = list.filter((a) => a.date > today && a.status === "scheduled");
    else if (activeTab === "previous") list = list.filter((a) => a.date < today || a.status !== "scheduled");

    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    if (typeFilter !== "all") list = list.filter((a) => a.type === typeFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((a) => {
        const patient = data.patients.find((p) => p.id === a.patientId);
        return patient?.fullName.toLowerCase().includes(q) ?? false;
      });
    }
    return list.sort((a, b) => {
      if (activeTab === "previous") return new Date(b.date).getTime() - new Date(a.date).getTime();
      return a.time.localeCompare(b.time);
    });
  }, [myAppointments, activeTab, today, statusFilter, typeFilter, search, data.patients]);

  const typeOptions = useMemo(() => {
    const types = new Set(myAppointments.map((a) => a.type));
    return [{ value: "all", label: "كل الأنواع" }, ...Array.from(types).map((t) => ({ value: t, label: t }))];
  }, [myAppointments]);

  function validateAppt(): boolean {
    const e: Record<string, string> = {};
    if (!apptForm.patientId) e.patientId = "يرجى اختيار المستفيد";
    if (!apptForm.date) e.date = "يرجى إدخال التاريخ";
    if (!apptForm.time) e.time = "يرجى إدخال الوقت";
    if (!apptForm.durationMin || Number(apptForm.durationMin) <= 0) e.durationMin = "يرجى إدخال مدة صحيحة";
    if (!apptForm.type.trim()) e.type = "يرجى إدخال نوع الموعد";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleCreateAppt() {
    if (!validateAppt()) {
      showToast("يرجى تصحيح الأخطاء في النموذج", "error");
      return;
    }
    addAppointment({
      patientId: apptForm.patientId,
      employeeId: therapistId,
      date: apptForm.date,
      time: apptForm.time,
      durationMin: Number(apptForm.durationMin),
      type: apptForm.type.trim(),
      channel: apptForm.channel,
      notes: apptForm.notes.trim() || undefined,
    });
    showToast("تم إنشاء الموعد بنجاح");
    setApptForm(emptyApptForm);
    setErrors({});
    setCreateOpen(false);
  }

  function closeCreate() {
    setCreateOpen(false);
    setApptForm(emptyApptForm);
    setErrors({});
  }

  function openReschedule(appt: Appointment) {
    setRescheduleId(appt.id);
    setRescheduleForm({ date: appt.date, time: appt.time });
    setRescheduleOpen(true);
  }

  function handleReschedule() {
    if (!rescheduleId) return;
    if (!rescheduleForm.date || !rescheduleForm.time) {
      showToast("يرجى إدخال التاريخ والوقت", "error");
      return;
    }
    updateAppointment(rescheduleId, { date: rescheduleForm.date, time: rescheduleForm.time, status: "scheduled" });
    showToast("تمت إعادة جدولة الموعد بنجاح");
    setRescheduleOpen(false);
    setRescheduleId(null);
  }

  function closeReschedule() {
    setRescheduleOpen(false);
    setRescheduleId(null);
  }

  function handleCancelAppt() {
    if (!cancelTarget) return;
    cancelAppointment(cancelTarget);
    showToast("تم إلغاء الموعد");
    setCancelTarget(null);
  }

  function handleConfirmAttendance(id: string) {
    confirmAttendance(id);
    showToast("تم تأكيد حضور المستفيد");
  }

  function handleMarkNoShow(id: string) {
    markNoShow(id);
    showToast("تم تسجيل غياب المستفيد");
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "today", label: "مواعيد اليوم" },
    { key: "upcoming", label: "المواعيد القادمة" },
    { key: "previous", label: "المواعيد السابقة" },
  ];

  return (
    <PageContainer maxWidth="max-w-5xl" className="py-8">
      <PageHeader
        title="المواعيد"
        subtitle="إدارة مواعيد المستفيدين"
        actions={
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <Button variant="primary" leftIcon={<Plus className="h-5 w-5" aria-hidden="true" />} onClick={() => setCreateOpen(true)}>
              إضافة موعد
            </Button>
          </div>
        }
      />
      <h2 ref={headingRef} className="sr-only">قائمة المواعيد</h2>

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

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="ابحث باسم المستفيد" />
          <StatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
            label="تصفية حسب الحالة"
            options={[
              { value: "all", label: "كل الحالات" },
              { value: "scheduled", label: "مجدول" },
              { value: "completed", label: "مكتمل" },
              { value: "missed", label: "غاب" },
              { value: "cancelled", label: "ملغى" },
            ]}
          />
          <StatusFilter
            value={typeFilter}
            onChange={setTypeFilter}
            label="تصفية حسب النوع"
            options={typeOptions}
          />
        </div>

        {tabbedAppointments.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-12 w-12" aria-hidden="true" />}
            title="لا توجد مواعيد"
            description="لا توجد مواعيد تطابق المعايير الحالية."
            action={
              <Button variant="primary" leftIcon={<Plus className="h-5 w-5" aria-hidden="true" />} onClick={() => setCreateOpen(true)}>
                إضافة موعد
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">المستفيد</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">التاريخ</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">الوقت</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">المدة</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">النوع</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">القناة</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">الحالة</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {tabbedAppointments.map((a) => {
                  const patient = data.patients.find((p) => p.id === a.patientId);
                  return (
                    <tr key={a.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-2">
                        <Link to={`/therapist/patients/${a.patientId}`} className="font-semibold text-ink hover:underline">
                          {patient?.fullName ?? "—"}
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-sm text-neutral-600">{formatDate(a.date)}</td>
                      <td className="py-3 px-2 text-sm text-neutral-600">{a.time}</td>
                      <td className="py-3 px-2 text-sm text-neutral-600">{a.durationMin} دقيقة</td>
                      <td className="py-3 px-2 text-sm text-neutral-600">{a.type}</td>
                      <td className="py-3 px-2">
                        <Badge tone={a.channel === "video" ? "accent" : "neutral"}>
                          {a.channel === "video" ? "فيديو" : "حضوري"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge tone={statusTone(a.status)}>{statusLabels[a.status]}</Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex flex-wrap items-center gap-1">
                          {a.channel === "video" && a.status === "scheduled" && (
                            <button
                              type="button"
                              onClick={() => setVideoModalOpen(true)}
                              className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-accent-600 hover:bg-accent-50 min-h-[48px] min-w-[48px]"
                              aria-label="مكالمة فيديو"
                              title="مكالمة فيديو"
                            >
                              <Video className="h-5 w-5" aria-hidden="true" />
                            </button>
                          )}
                          {a.status === "scheduled" && (
                            <>
                              <button
                                type="button"
                                onClick={() => openReschedule(a)}
                                className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-primary-600 hover:bg-primary-50 min-h-[48px] min-w-[48px]"
                                aria-label="إعادة جدولة"
                                title="إعادة جدولة"
                              >
                                <Edit3 className="h-5 w-5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmAttendance(a.id)}
                                className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-success-600 hover:bg-success-50 min-h-[48px] min-w-[48px]"
                                aria-label="تأكيد الحضور"
                                title="تأكيد الحضور"
                              >
                                <Check className="h-5 w-5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMarkNoShow(a.id)}
                                className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-warning-600 hover:bg-warning-50 min-h-[48px] min-w-[48px]"
                                aria-label="تسجيل غياب"
                                title="تسجيل غياب"
                              >
                                <Clock className="h-5 w-5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setCancelTarget(a.id)}
                                className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-error-600 hover:bg-error-50 min-h-[48px] min-w-[48px]"
                                aria-label="إلغاء الموعد"
                                title="إلغاء الموعد"
                              >
                                <CalendarX className="h-5 w-5" aria-hidden="true" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create appointment modal */}
      <Modal
        open={createOpen}
        onClose={closeCreate}
        title="إضافة موعد جديد"
        footer={
          <>
            <Button variant="ghost" onClick={closeCreate}>إلغاء</Button>
            <Button variant="primary" onClick={handleCreateAppt}>حفظ الموعد</Button>
          </>
        }
      >
        <Field label="المستفيد" required error={errors.patientId}>
          <Select
            value={apptForm.patientId}
            onChange={(e) => setApptForm((prev) => ({ ...prev, patientId: e.target.value }))}
            hasError={!!errors.patientId}
          >
            <option value="">— اختر المستفيد —</option>
            {myPatients.map((p) => (
              <option key={p.id} value={p.id}>{p.fullName} ({p.fileNumber})</option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="التاريخ" required error={errors.date}>
            <Input
              type="date"
              value={apptForm.date}
              onChange={(e) => setApptForm((prev) => ({ ...prev, date: e.target.value }))}
              hasError={!!errors.date}
            />
          </Field>
          <Field label="الوقت" required error={errors.time}>
            <Input
              type="time"
              value={apptForm.time}
              onChange={(e) => setApptForm((prev) => ({ ...prev, time: e.target.value }))}
              hasError={!!errors.time}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="المدة (بالدقائق)" required error={errors.durationMin}>
            <Input
              type="number"
              min="1"
              value={apptForm.durationMin}
              onChange={(e) => setApptForm((prev) => ({ ...prev, durationMin: e.target.value }))}
              hasError={!!errors.durationMin}
            />
          </Field>
          <Field label="نوع الموعد" required error={errors.type}>
            <Input
              value={apptForm.type}
              onChange={(e) => setApptForm((prev) => ({ ...prev, type: e.target.value }))}
              hasError={!!errors.type}
              placeholder="مثال: علاج طبيعي"
            />
          </Field>
        </div>

        <Field label="القناة">
          <Select
            value={apptForm.channel}
            onChange={(e) => setApptForm((prev) => ({ ...prev, channel: e.target.value as AppointmentChannel }))}
          >
            <option value="in-person">حضوري</option>
            <option value="video">فيديو</option>
          </Select>
        </Field>

        <Field label="ملاحظات">
          <Textarea
            value={apptForm.notes}
            onChange={(e) => setApptForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="ملاحظات إضافية"
          />
        </Field>
      </Modal>

      {/* Reschedule modal */}
      <Modal
        open={rescheduleOpen}
        onClose={closeReschedule}
        title="إعادة جدولة الموعد"
        footer={
          <>
            <Button variant="ghost" onClick={closeReschedule}>إلغاء</Button>
            <Button variant="primary" onClick={handleReschedule}>حفظ التغييرات</Button>
          </>
        }
      >
        <Field label="التاريخ الجديد" required>
          <Input
            type="date"
            value={rescheduleForm.date}
            onChange={(e) => setRescheduleForm((prev) => ({ ...prev, date: e.target.value }))}
          />
        </Field>
        <Field label="الوقت الجديد" required>
          <Input
            type="time"
            value={rescheduleForm.time}
            onChange={(e) => setRescheduleForm((prev) => ({ ...prev, time: e.target.value }))}
          />
        </Field>
      </Modal>

      {/* Cancel confirm */}
      <ConfirmDialog
        open={!!cancelTarget}
        title="إلغاء الموعد"
        message="هل أنت متأكد من إلغاء هذا الموعد؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="نعم، إلغاء"
        onConfirm={handleCancelAppt}
        onCancel={() => setCancelTarget(null)}
      />

      {/* Video demo modal */}
      <Modal
        open={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        title="مكالمة فيديو"
        footer={<Button variant="primary" onClick={() => setVideoModalOpen(false)}>حسناً</Button>}
      >
        <div className="flex items-start gap-3">
          <Video className="h-8 w-8 text-accent-600 shrink-0" aria-hidden="true" />
          <p className="text-base text-ink leading-relaxed">
            هذه ميزة تجريبية — لا تتصل بفيديو حقيقي. مكالمات الفيديو غير متاحة في النسخة التجريبية.
          </p>
        </div>
      </Modal>
    </PageContainer>
  );
}
