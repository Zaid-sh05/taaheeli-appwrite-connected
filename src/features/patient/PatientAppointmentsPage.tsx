import { useMemo, useState } from "react";
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
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatDate } from "@/lib/format";
import { CalendarDays, Video, Check, CreditCard as Edit3, Plus, Stethoscope, User, CalendarClock } from "lucide-react";
import type { Appointment, AppointmentChannel } from "@/types/demo";

type TabKey = "upcoming" | "previous";

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

const appointmentTypes = [
  "علاج طبيعي",
  "علاج وظيفي",
  "علاج نطق وتخاطب",
  "متابعة",
  "تقييم",
];

interface RescheduleForm {
  date: string;
  time: string;
  notes: string;
}

interface BookForm {
  type: string;
  preferredDate: string;
  channel: AppointmentChannel;
  notes: string;
}

const emptyReschedule: RescheduleForm = { date: "", time: "", notes: "" };

const emptyBook: BookForm = {
  type: "",
  preferredDate: new Date().toISOString().split("T")[0],
  channel: "in-person",
  notes: "",
};

export function PatientAppointmentsPage() {
  useDocumentTitle("مواعيدي");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data, updateAppointment, confirmAttendance, addNotification } = useDemoData();
  const { session } = useSession();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<string | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState<RescheduleForm>(emptyReschedule);
  const [bookOpen, setBookOpen] = useState(false);
  const [bookForm, setBookForm] = useState<BookForm>(emptyBook);
  const [videoOpen, setVideoOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Identify the current patient. Fallback to first active patient (p1, محمد العتيبي).
  const patient = useMemo(() => {
    if (session?.username) {
      const match = data.patients.find(
        (p) => p.username === session.username && p.status === "active",
      );
      if (match) return match;
    }
    return data.patients.find((p) => p.status === "active") ?? data.patients[0];
  }, [data.patients, session]);

  const today = new Date().toISOString().split("T")[0];

  const myAppointments = useMemo(
    () => data.appointments.filter((a) => a.patientId === patient.id),
    [data.appointments, patient.id],
  );

  const tabbedAppointments = useMemo(() => {
    let list = [...myAppointments];
    if (activeTab === "upcoming") {
      list = list.filter((a) => a.status === "scheduled" && a.date >= today);
      list.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    } else {
      list = list.filter((a) => a.status !== "scheduled" || a.date < today);
      list.sort((a, b) => new Date(b.date + "T" + b.time).getTime() - new Date(a.date + "T" + a.time).getTime());
    }
    return list;
  }, [myAppointments, activeTab, today]);

  function openReschedule(appt: Appointment) {
    setRescheduleTarget(appt.id);
    setRescheduleForm({ date: appt.date, time: appt.time, notes: "" });
    setRescheduleOpen(true);
  }

  function closeReschedule() {
    setRescheduleOpen(false);
    setRescheduleTarget(null);
    setRescheduleForm(emptyReschedule);
    setErrors({});
  }

  function handleReschedule() {
    if (!rescheduleTarget) return;
    const e: Record<string, string> = {};
    if (!rescheduleForm.date) e.date = "يرجى إدخال التاريخ";
    if (!rescheduleForm.time) e.time = "يرجى إدخال الوقت";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      showToast("يرجى إدخال التاريخ والوقت", "error");
      return;
    }

    const appt = data.appointments.find((a) => a.id === rescheduleTarget);
    updateAppointment(rescheduleTarget, {
      date: rescheduleForm.date,
      time: rescheduleForm.time,
      status: "scheduled",
    });

    // Create a notification for the therapist/coordinator
    addNotification({
      type: "appointment-change",
      title: "طلب إعادة جدولة موعد",
      message: `طلب ${patient.fullName} إعادة جدولة موعد ${appt?.type ?? ""} إلى ${formatDate(rescheduleForm.date)} الساعة ${rescheduleForm.time}`,
      targetRole: "doctor",
    });

    showToast("تم إرسال طلب إعادة الجدولة بنجاح");
    closeReschedule();
  }

  function handleConfirmAttendance(id: string) {
    confirmAttendance(id);
    showToast("تم تأكيد حضورك للموعد");
  }

  function closeBook() {
    setBookOpen(false);
    setBookForm(emptyBook);
    setErrors({});
  }

  function handleBook() {
    const e: Record<string, string> = {};
    if (!bookForm.type) e.type = "يرجى اختيار نوع الموعد";
    if (!bookForm.preferredDate) e.preferredDate = "يرجى إدخال التاريخ المفضل";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      showToast("يرجى إكمال البيانات المطلوبة", "error");
      return;
    }

    addNotification({
      type: "appointment-request",
      title: "طلب موعد جديد",
      message: `طلب ${patient.fullName} حجز موعد ${bookForm.type} بتاريخ ${formatDate(bookForm.preferredDate)} (${bookForm.channel === "video" ? "عن بُعد" : "حضوري"})`,
      targetRole: "doctor",
    });

    showToast("تم إرسال طلب الموعد. سيتم التواصل معك قريباً");
    closeBook();
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "upcoming", label: "المواعيد القادمة" },
    { key: "previous", label: "المواعيد السابقة" },
  ];

  return (
    <PageContainer maxWidth="max-w-3xl" className="py-8">
      <PageHeader
        title="مواعيدي"
        subtitle="تابع مواعيدك العلاجية وأكدها بسهولة"
        actions={
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <Button
              variant="primary"
              leftIcon={<Plus className="h-5 w-5" aria-hidden="true" />}
              onClick={() => setBookOpen(true)}
            >
              طلب موعد
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
                "px-4 py-3 text-base font-semibold transition-colors min-h-[56px] border-b-2 -mb-px " +
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

      {tabbedAppointments.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarDays className="h-12 w-12" aria-hidden="true" />}
            title={activeTab === "upcoming" ? "لا توجد مواعيد قادمة" : "لا توجد مواعيد سابقة"}
            description={
              activeTab === "upcoming"
                ? "ليس لديك مواعيد مجدولة حالياً. يمكنك طلب موعد جديد بالضغط على زر طلب موعد."
                : "ستظهر هنا مواعيدك السابقة بعد حضورها."
            }
            action={
              activeTab === "upcoming" ? (
                <Button
                  variant="primary"
                  leftIcon={<Plus className="h-5 w-5" aria-hidden="true" />}
                  onClick={() => setBookOpen(true)}
                >
                  طلب موعد
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {tabbedAppointments.map((appt) => {
            const emp = data.employees.find((e) => e.id === appt.employeeId);
            return (
              <Card key={appt.id}>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary-100 p-2 shrink-0">
                      <CalendarDays className="h-6 w-6 text-primary-700" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-ink">{appt.type}</p>
                      <p className="text-sm text-neutral-500">{formatDate(appt.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={appt.channel === "video" ? "accent" : "neutral"}>
                      {appt.channel === "video" ? "عن بُعد (فيديو)" : "حضوري"}
                    </Badge>
                    <Badge tone={statusTone(appt.status)}>
                      {statusLabels[appt.status]}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-base text-neutral-700 mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                    <span>الساعة {appt.time} — المدة {appt.durationMin} دقيقة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                    <span>النوع: {appt.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                    <span>المعالج: {emp?.fullName ?? "غير محدد"}</span>
                  </div>
                </div>

                {appt.status === "scheduled" && (
                  <div className="flex flex-wrap gap-2">
                    {appt.channel === "video" && (
                      <Button
                        variant="secondary"
                        size="md"
                        leftIcon={<Video className="h-5 w-5" aria-hidden="true" />}
                        onClick={() => setVideoOpen(true)}
                      >
                        الانضمام للفيديو
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="md"
                      leftIcon={<Edit3 className="h-5 w-5" aria-hidden="true" />}
                      onClick={() => openReschedule(appt)}
                    >
                      طلب إعادة الجدولة
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      leftIcon={<Check className="h-5 w-5" aria-hidden="true" />}
                      onClick={() => handleConfirmAttendance(appt.id)}
                    >
                      تأكيد الحضور
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Reschedule modal */}
      <Modal
        open={rescheduleOpen}
        onClose={closeReschedule}
        title="طلب إعادة جدولة الموعد"
        footer={
          <>
            <Button variant="ghost" onClick={closeReschedule}>إلغاء</Button>
            <Button variant="primary" onClick={handleReschedule}>إرسال الطلب</Button>
          </>
        }
      >
        <p className="text-base text-neutral-600 mb-4 leading-relaxed">
          سيتم إرسال طلبك لإعادة الجدولة إلى المركز، وسيتم التواصل معك لتأكيد الموعد الجديد.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="التاريخ المفضل" required error={errors.date}>
            <Input
              type="date"
              value={rescheduleForm.date}
              onChange={(e) => setRescheduleForm((prev) => ({ ...prev, date: e.target.value }))}
              hasError={!!errors.date}
            />
          </Field>
          <Field label="الوقت المفضل" required error={errors.time}>
            <Input
              type="time"
              value={rescheduleForm.time}
              onChange={(e) => setRescheduleForm((prev) => ({ ...prev, time: e.target.value }))}
              hasError={!!errors.time}
            />
          </Field>
        </div>
        <Field label="ملاحظات (اختياري)">
          <Textarea
            value={rescheduleForm.notes}
            onChange={(e) => setRescheduleForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="أي ملاحظة تود إضافتها"
          />
        </Field>
      </Modal>

      {/* Book appointment modal */}
      <Modal
        open={bookOpen}
        onClose={closeBook}
        title="طلب موعد جديد"
        footer={
          <>
            <Button variant="ghost" onClick={closeBook}>إلغاء</Button>
            <Button variant="primary" onClick={handleBook}>إرسال الطلب</Button>
          </>
        }
      >
        <p className="text-base text-neutral-600 mb-4 leading-relaxed">
          املأ البيانات التالية لإرسال طلب حجز موعد. سيتم التواصل معك لتأكيد الموعد.
        </p>
        <Field label="نوع الموعد" required error={errors.type}>
          <Select
            value={bookForm.type}
            onChange={(e) => setBookForm((prev) => ({ ...prev, type: e.target.value }))}
            hasError={!!errors.type}
          >
            <option value="">— اختر نوع الموعد —</option>
            {appointmentTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="التاريخ المفضل" required error={errors.preferredDate}>
          <Input
            type="date"
            value={bookForm.preferredDate}
            onChange={(e) => setBookForm((prev) => ({ ...prev, preferredDate: e.target.value }))}
            hasError={!!errors.preferredDate}
          />
        </Field>
        <Field label="طريقة اللقاء">
          <Select
            value={bookForm.channel}
            onChange={(e) => setBookForm((prev) => ({ ...prev, channel: e.target.value as AppointmentChannel }))}
          >
            <option value="in-person">حضوري في المركز</option>
            <option value="video">عن بُعد (فيديو)</option>
          </Select>
        </Field>
        <Field label="ملاحظات (اختياري)">
          <Textarea
            value={bookForm.notes}
            onChange={(e) => setBookForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="أي ملاحظة تود إضافتها"
          />
        </Field>
      </Modal>

      {/* Video demo modal */}
      <Modal
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        title="مكالمة فيديو"
        footer={<Button variant="primary" onClick={() => setVideoOpen(false)}>حسناً</Button>}
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
