import { useMemo, useState } from "react";
import { useDemoData } from "@/context/DemoDataContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { SearchInput } from "@/components/manager/SearchInput";
import { StatusFilter } from "@/components/manager/StatusFilter";
import { ConfirmDialog } from "@/components/manager/ConfirmDialog";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatDate } from "@/lib/format";
import { CalendarDays, Plus, CreditCard as Edit3, Check, Clock, CalendarX, Video } from "lucide-react";
import type { Appointment, AppointmentChannel } from "@/types/demo";

const statusLabels: Record<Appointment["status"], string> = {
  scheduled: "مجدول",
  completed: "مكتمل",
  missed: "غاب",
  cancelled: "ملغى",
};

function statusTone(
  status: Appointment["status"],
): "primary" | "success" | "error" | "neutral" {
  if (status === "completed") return "success";
  if (status === "missed") return "error";
  if (status === "cancelled") return "neutral";
  return "primary";
}

interface ApptForm {
  patientId: string;
  employeeId: string;
  date: string;
  time: string;
  durationMin: string;
  type: string;
  channel: AppointmentChannel;
  notes: string;
}

const emptyApptForm: ApptForm = {
  patientId: "",
  employeeId: "",
  date: new Date().toISOString().split("T")[0],
  time: "09:00",
  durationMin: "45",
  type: "",
  channel: "in-person",
  notes: "",
};

export function AdminAppointmentsPage() {
  useDocumentTitle("المواعيد");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const {
    data,
    addAppointment,
    updateAppointment,
    cancelAppointment,
    confirmAttendance,
    markNoShow,
  } = useDemoData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [therapistFilter, setTherapistFilter] = useState("all");
  const [patientFilter, setPatientFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [noShowTarget, setNoShowTarget] = useState<string | null>(null);
  const [apptForm, setApptForm] = useState<ApptForm>(emptyApptForm);
  const [rescheduleForm, setRescheduleForm] = useState<{
    date: string;
    time: string;
  }>({ date: "", time: "" });
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = new Date().toISOString().split("T")[0];

  const therapists = useMemo(
    () =>
      data.employees.filter(
        (e) => e.role === "doctor" || e.role === "therapist",
      ),
    [data.employees],
  );

  const typeOptions = useMemo(() => {
    const types = new Set(data.appointments.map((a) => a.type));
    return [
      { value: "all", label: "كل الأنواع" },
      ...Array.from(types).map((t) => ({ value: t, label: t })),
    ];
  }, [data.appointments]);

  const filtered = useMemo(() => {
    let list = [...data.appointments];
    if (dateFilter === "today") list = list.filter((a) => a.date === today);
    else if (dateFilter === "upcoming")
      list = list.filter((a) => a.date >= today);
    else if (dateFilter === "past") list = list.filter((a) => a.date < today);
    if (therapistFilter !== "all")
      list = list.filter((a) => a.employeeId === therapistFilter);
    if (patientFilter !== "all")
      list = list.filter((a) => a.patientId === patientFilter);
    if (typeFilter !== "all") list = list.filter((a) => a.type === typeFilter);
    if (statusFilter !== "all")
      list = list.filter((a) => a.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((a) => {
        const patient = data.patients.find((p) => p.id === a.patientId);
        const employee = data.employees.find((e) => e.id === a.employeeId);
        return (
          patient?.fullName.toLowerCase().includes(q) ||
          employee?.fullName.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q)
        );
      });
    }
    return list.sort((a, b) => {
      const dateCmp = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCmp !== 0) return dateCmp;
      return a.time.localeCompare(b.time);
    });
  }, [
    data.appointments,
    data.patients,
    data.employees,
    search,
    dateFilter,
    therapistFilter,
    patientFilter,
    typeFilter,
    statusFilter,
    today,
  ]);

  // Conflict detection for create form
  const createConflict = useMemo(() => {
    if (!apptForm.employeeId || !apptForm.date || !apptForm.time) return null;
    const newStart = parseTimeToMinutes(apptForm.time);
    const newDuration = Number(apptForm.durationMin) || 0;
    if (newDuration <= 0) return null;
    const newEnd = newStart + newDuration;
    return (
      data.appointments.find((a) => {
        if (a.employeeId !== apptForm.employeeId) return false;
        if (a.date !== apptForm.date) return false;
        if (a.status === "cancelled") return false;
        const existStart = parseTimeToMinutes(a.time);
        const existEnd = existStart + a.durationMin;
        return newStart < existEnd && newEnd > existStart;
      }) ?? null
    );
  }, [apptForm, data.appointments]);

  // Conflict detection for reschedule form
  const rescheduleConflict = useMemo(() => {
    if (!rescheduleId || !rescheduleForm.date || !rescheduleForm.time)
      return null;
    const appt = data.appointments.find((a) => a.id === rescheduleId);
    if (!appt) return null;
    const newStart = parseTimeToMinutes(rescheduleForm.time);
    const newDuration = appt.durationMin;
    const newEnd = newStart + newDuration;
    return (
      data.appointments.find((a) => {
        if (a.id === rescheduleId) return false;
        if (a.employeeId !== appt.employeeId) return false;
        if (a.date !== rescheduleForm.date) return false;
        if (a.status === "cancelled") return false;
        const existStart = parseTimeToMinutes(a.time);
        const existEnd = existStart + a.durationMin;
        return newStart < existEnd && newEnd > existStart;
      }) ?? null
    );
  }, [rescheduleId, rescheduleForm, data.appointments]);

  function parseTimeToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  function validateAppt(): boolean {
    const e: Record<string, string> = {};
    if (!apptForm.patientId) e.patientId = "يرجى اختيار المستفيد";
    if (!apptForm.employeeId) e.employeeId = "يرجى اختيار المعالج";
    if (!apptForm.date) e.date = "يرجى إدخال التاريخ";
    if (!apptForm.time) e.time = "يرجى إدخال الوقت";
    if (!apptForm.durationMin || Number(apptForm.durationMin) <= 0)
      e.durationMin = "يرجى إدخال مدة صحيحة";
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
      employeeId: apptForm.employeeId,
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
    updateAppointment(rescheduleId, {
      date: rescheduleForm.date,
      time: rescheduleForm.time,
      status: "scheduled",
    });
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

  function handleConfirmAttendance() {
    if (!confirmTarget) return;
    confirmAttendance(confirmTarget);
    showToast("تم تأكيد حضور المستفيد");
    setConfirmTarget(null);
  }

  function handleMarkNoShow() {
    if (!noShowTarget) return;
    markNoShow(noShowTarget);
    showToast("تم تسجيل غياب المستفيد");
    setNoShowTarget(null);
  }

  return (
    <PageContainer maxWidth="max-w-6xl" className="py-8">
      <PageHeader
        title="المواعيد"
        subtitle="إدارة مواعيد المستفيدين والمعالجين"
        actions={
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <Button
              variant="primary"
              leftIcon={<Plus className="h-5 w-5" aria-hidden="true" />}
              onClick={() => setCreateOpen(true)}
            >
              إضافة موعد
            </Button>
          </div>
        }
      />
      <h2 ref={headingRef} className="sr-only">
        قائمة المواعيد
      </h2>

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="ابحث باسم المستفيد أو المعالج"
          />
          <StatusFilter
            value={dateFilter}
            onChange={setDateFilter}
            label="تصفية حسب التاريخ"
            options={[
              { value: "all", label: "كل التواريخ" },
              { value: "today", label: "اليوم" },
              { value: "upcoming", label: "القادمة" },
              { value: "past", label: "السابقة" },
            ]}
          />
          <StatusFilter
            value={therapistFilter}
            onChange={setTherapistFilter}
            label="تصفية حسب المعالج"
            options={[
              { value: "all", label: "كل المعالجين" },
              ...therapists.map((t) => ({
                value: t.id,
                label: t.fullName,
              })),
            ]}
          />
          <StatusFilter
            value={patientFilter}
            onChange={setPatientFilter}
            label="تصفية حسب المستفيد"
            options={[
              { value: "all", label: "كل المستفيدين" },
              ...data.patients.map((p) => ({
                value: p.id,
                label: p.fullName,
              })),
            ]}
          />
          <StatusFilter
            value={typeFilter}
            onChange={setTypeFilter}
            label="تصفية حسب النوع"
            options={typeOptions}
          />
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
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-12 w-12" aria-hidden="true" />}
            title="لا توجد مواعيد"
            description="لا توجد مواعيد تطابق المعايير الحالية."
            action={
              <Button
                variant="primary"
                leftIcon={<Plus className="h-5 w-5" aria-hidden="true" />}
                onClick={() => setCreateOpen(true)}
              >
                إضافة موعد
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th
                    scope="col"
                    className="py-3 px-2 text-start font-semibold text-neutral-600"
                  >
                    المستفيد
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-2 text-start font-semibold text-neutral-600"
                  >
                    المعالج
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-2 text-start font-semibold text-neutral-600"
                  >
                    التاريخ
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-2 text-start font-semibold text-neutral-600"
                  >
                    الوقت
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-2 text-start font-semibold text-neutral-600"
                  >
                    المدة
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-2 text-start font-semibold text-neutral-600"
                  >
                    النوع
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-2 text-start font-semibold text-neutral-600"
                  >
                    القناة
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-2 text-start font-semibold text-neutral-600"
                  >
                    الحالة
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-2 text-start font-semibold text-neutral-600"
                  >
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const patient = data.patients.find((p) => p.id === a.patientId);
                  const employee = data.employees.find((e) => e.id === a.employeeId);
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-neutral-100 hover:bg-neutral-50"
                    >
                      <td className="py-3 px-2 font-semibold text-ink">
                        {patient?.fullName ?? "—"}
                      </td>
                      <td className="py-3 px-2 text-sm text-neutral-600">
                        {employee?.fullName ?? "—"}
                      </td>
                      <td className="py-3 px-2 text-sm text-neutral-600">
                        {formatDate(a.date)}
                      </td>
                      <td className="py-3 px-2 text-sm text-neutral-600">
                        {a.time}
                      </td>
                      <td className="py-3 px-2 text-sm text-neutral-600">
                        {a.durationMin} دقيقة
                      </td>
                      <td className="py-3 px-2 text-sm text-neutral-600">
                        {a.type}
                      </td>
                      <td className="py-3 px-2">
                        <Badge tone={a.channel === "video" ? "accent" : "neutral"}>
                          {a.channel === "video" ? (
                            <span className="inline-flex items-center gap-1">
                              <Video
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                              فيديو
                            </span>
                          ) : (
                            "حضوري"
                          )}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge tone={statusTone(a.status)}>
                          {statusLabels[a.status]}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex flex-wrap items-center gap-1">
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
                                onClick={() => setConfirmTarget(a.id)}
                                className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-success-600 hover:bg-success-50 min-h-[48px] min-w-[48px]"
                                aria-label="تأكيد الحضور"
                                title="تأكيد الحضور"
                              >
                                <Check className="h-5 w-5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setNoShowTarget(a.id)}
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
                                <CalendarX
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
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
            <Button variant="ghost" onClick={closeCreate}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleCreateAppt}>
              حفظ الموعد
            </Button>
          </>
        }
      >
        <Field label="المستفيد" required error={errors.patientId}>
          <Select
            value={apptForm.patientId}
            onChange={(e) =>
              setApptForm((prev) => ({ ...prev, patientId: e.target.value }))
            }
            hasError={!!errors.patientId}
          >
            <option value="">— اختر المستفيد —</option>
            {data.patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.fileNumber})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="المعالج" required error={errors.employeeId}>
          <Select
            value={apptForm.employeeId}
            onChange={(e) =>
              setApptForm((prev) => ({ ...prev, employeeId: e.target.value }))
            }
            hasError={!!errors.employeeId}
          >
            <option value="">— اختر المعالج —</option>
            {therapists.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName} ({t.specialty})
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="التاريخ" required error={errors.date}>
            <Input
              type="date"
              value={apptForm.date}
              onChange={(e) =>
                setApptForm((prev) => ({ ...prev, date: e.target.value }))
              }
              hasError={!!errors.date}
            />
          </Field>
          <Field label="الوقت" required error={errors.time}>
            <Input
              type="time"
              value={apptForm.time}
              onChange={(e) =>
                setApptForm((prev) => ({ ...prev, time: e.target.value }))
              }
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
              onChange={(e) =>
                setApptForm((prev) => ({
                  ...prev,
                  durationMin: e.target.value,
                }))
              }
              hasError={!!errors.durationMin}
            />
          </Field>
          <Field label="نوع الموعد" required error={errors.type}>
            <Input
              value={apptForm.type}
              onChange={(e) =>
                setApptForm((prev) => ({ ...prev, type: e.target.value }))
              }
              hasError={!!errors.type}
              placeholder="مثال: علاج طبيعي"
            />
          </Field>
        </div>

        <Field label="القناة">
          <Select
            value={apptForm.channel}
            onChange={(e) =>
              setApptForm((prev) => ({
                ...prev,
                channel: e.target.value as AppointmentChannel,
              }))
            }
          >
            <option value="in-person">حضوري</option>
            <option value="video">فيديو</option>
          </Select>
        </Field>

        <Field label="ملاحظات">
          <Textarea
            value={apptForm.notes}
            onChange={(e) =>
              setApptForm((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="ملاحظات إضافية"
          />
        </Field>

        {createConflict && (
          <Alert tone="warning" title="تنبيه: تعارض في المواعيد">
            يوجد موعد آخر لنفس المعالج في هذا الوقت. الموعد المتعارض:{" "}
            {data.patients.find((p) => p.id === createConflict.patientId)
              ?.fullName ?? "—"}{" "}
            في {createConflict.time} لمدة {createConflict.durationMin} دقيقة.
          </Alert>
        )}
      </Modal>

      {/* Reschedule modal */}
      <Modal
        open={rescheduleOpen}
        onClose={closeReschedule}
        title="إعادة جدولة الموعد"
        footer={
          <>
            <Button variant="ghost" onClick={closeReschedule}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleReschedule}>
              حفظ التغييرات
            </Button>
          </>
        }
      >
        <Field label="التاريخ الجديد" required>
          <Input
            type="date"
            value={rescheduleForm.date}
            onChange={(e) =>
              setRescheduleForm((prev) => ({ ...prev, date: e.target.value }))
            }
          />
        </Field>
        <Field label="الوقت الجديد" required>
          <Input
            type="time"
            value={rescheduleForm.time}
            onChange={(e) =>
              setRescheduleForm((prev) => ({ ...prev, time: e.target.value }))
            }
          />
        </Field>

        {rescheduleConflict && (
          <Alert tone="warning" title="تنبيه: تعارض في المواعيد">
            يوجد موعد آخر لنفس المعالج في هذا الوقت. الموعد المتعارض:{" "}
            {data.patients.find((p) => p.id === rescheduleConflict.patientId)
              ?.fullName ?? "—"}{" "}
            في {rescheduleConflict.time} لمدة {rescheduleConflict.durationMin}{" "}
            دقيقة.
          </Alert>
        )}
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

      {/* Confirm attendance confirm */}
      <ConfirmDialog
        open={!!confirmTarget}
        title="تأكيد الحضور"
        message="هل أنت متأكد من تأكيد حضور المستفيد لهذا الموعد؟ سيتم تسجيل الموعد كمكتمل."
        confirmLabel="نعم، تأكيد"
        onConfirm={handleConfirmAttendance}
        onCancel={() => setConfirmTarget(null)}
      />

      {/* No-show confirm */}
      <ConfirmDialog
        open={!!noShowTarget}
        title="تسجيل غياب"
        message="هل أنت متأكد من تسجيل غياب المستفيد عن هذا الموعد؟"
        confirmLabel="نعم، تسجيل غياب"
        onConfirm={handleMarkNoShow}
        onCancel={() => setNoShowTarget(null)}
      />
    </PageContainer>
  );
}
