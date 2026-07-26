import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { ArrowRight, Save, CircleCheck as CheckCircle } from "lucide-react";

interface SessionForm {
  patientId: string;
  appointmentId: string;
  type: string;
  durationMin: string;
  attendance: "attended" | "missed" | "late";
  observations: string;
  completedExerciseIds: string[];
  goalProgress: Record<string, number>;
  clinicalNotes: string;
  nextRecommendations: string;
  followUpDate: string;
}

const emptyForm: SessionForm = {
  patientId: "",
  appointmentId: "",
  type: "",
  durationMin: "45",
  attendance: "attended",
  observations: "",
  completedExerciseIds: [],
  goalProgress: {},
  clinicalNotes: "",
  nextRecommendations: "",
  followUpDate: "",
};

export function TherapistNewSessionPage() {
  useDocumentTitle("توثيق جلسة جديدة");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const navigate = useNavigate();
  const { data, addSession } = useDemoData();
  const { session } = useSession();
  const { showToast } = useToast();

  const [form, setForm] = useState<SessionForm>(emptyForm);
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

  const myPatients = useMemo(
    () => data.patients.filter((p) => p.assignedTherapistId === therapistId),
    [data.patients, therapistId],
  );

  const today = new Date().toISOString().split("T")[0];

  const todayAppointments = useMemo(() => {
    if (!form.patientId) return [];
    return data.appointments.filter((a) => a.patientId === form.patientId && a.date === today);
  }, [data.appointments, form.patientId, today]);

  const patientExercises = useMemo(() => {
    if (!form.patientId) return [];
    return data.exercises.filter((ex) => ex.patientId === form.patientId);
  }, [data.exercises, form.patientId]);

  const activePlans = useMemo(() => {
    if (!form.patientId) return [];
    return data.treatmentPlans.filter((tp) => tp.patientId === form.patientId && tp.status === "active");
  }, [data.treatmentPlans, form.patientId]);

  const allGoals = useMemo(() => activePlans.flatMap((tp) => tp.goals.map((g) => ({ ...g, planId: tp.id, planTitle: tp.title }))), [activePlans]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.patientId) e.patientId = "يرجى اختيار المستفيد";
    if (!form.type.trim()) e.type = "يرجى إدخال نوع الجلسة";
    if (!form.durationMin || Number(form.durationMin) <= 0) e.durationMin = "يرجى إدخال مدة صحيحة";
    if (!form.observations.trim()) e.observations = "يرجى إدخال الملاحظات";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function buildSessionPayload(status: "draft" | "completed") {
    return {
      patientId: form.patientId,
      employeeId: therapistId,
      date: today,
      durationMin: Number(form.durationMin),
      type: form.type.trim(),
      attendance: form.attendance,
      notes: form.observations.trim(),
      completedExerciseIds: form.completedExerciseIds,
      goalProgressUpdates: Object.entries(form.goalProgress).map(([goalId, newProgress]) => ({ goalId, newProgress })),
      nextRecommendations: form.nextRecommendations.trim(),
      followUpDate: form.followUpDate || null,
      status,
    };
  }

  function handleSaveDraft() {
    if (!form.patientId) {
      showToast("يرجى اختيار المستفيد قبل الحفظ", "error");
      return;
    }
    addSession(buildSessionPayload("draft"));
    showToast("تم حفظ الجلسة كمسودة");
    navigate(`/therapist/patients/${form.patientId}`);
  }

  function handleComplete() {
    if (!validate()) {
      showToast("يرجى تصحيح الأخطاء في النموذج", "error");
      return;
    }
    addSession(buildSessionPayload("completed"));
    showToast("تم إكمال الجلسة وحفظها بنجاح");
    navigate(`/therapist/patients/${form.patientId}`);
  }

  function toggleExercise(exerciseId: string) {
    setForm((prev) => ({
      ...prev,
      completedExerciseIds: prev.completedExerciseIds.includes(exerciseId)
        ? prev.completedExerciseIds.filter((id) => id !== exerciseId)
        : [...prev.completedExerciseIds, exerciseId],
    }));
  }

  function updateGoalProgress(goalId: string, value: number) {
    setForm((prev) => ({
      ...prev,
      goalProgress: { ...prev.goalProgress, [goalId]: value },
    }));
  }

  return (
    <PageContainer maxWidth="max-w-3xl" className="py-8">
      <div className="mb-4">
        <Link to="/therapist" className="inline-flex items-center gap-1 text-base font-semibold text-primary-700 hover:underline">
          <ArrowRight className="h-5 w-5" aria-hidden="true" /> العودة للوحة الرئيسية
        </Link>
      </div>

      <PageHeader title="توثيق جلسة جديدة" subtitle="سجّل تفاصيل جلسة علاجية" />
      <h2 ref={headingRef} className="sr-only">نموذج توثيق جلسة جديدة</h2>

      <Card>
        <Field label="المستفيد" required error={errors.patientId}>
          <Select
            value={form.patientId}
            onChange={(e) => setForm((prev) => ({ ...prev, patientId: e.target.value, appointmentId: "" }))}
            hasError={!!errors.patientId}
          >
            <option value="">— اختر المستفيد —</option>
            {myPatients.map((p) => (
              <option key={p.id} value={p.id}>{p.fullName} ({p.fileNumber})</option>
            ))}
          </Select>
        </Field>

        {form.patientId && todayAppointments.length > 0 && (
          <Field label="الموعد المرتبط" hint="مواعيد اليوم المسجلة لهذا المستفيد">
            <Select
              value={form.appointmentId}
              onChange={(e) => {
                const appt = todayAppointments.find((a) => a.id === e.target.value);
                setForm((prev) => ({
                  ...prev,
                  appointmentId: e.target.value,
                  type: appt ? appt.type : prev.type,
                  durationMin: appt ? String(appt.durationMin) : prev.durationMin,
                }));
              }}
            >
              <option value="">— بدون موعد مرتبط —</option>
              {todayAppointments.map((a) => (
                <option key={a.id} value={a.id}>{a.time} — {a.type} ({a.durationMin} دقيقة)</option>
              ))}
            </Select>
          </Field>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="نوع الجلسة" required error={errors.type}>
            <Input
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              hasError={!!errors.type}
              placeholder="مثال: علاج طبيعي"
            />
          </Field>
          <Field label="المدة (بالدقائق)" required error={errors.durationMin}>
            <Input
              type="number"
              min="1"
              value={form.durationMin}
              onChange={(e) => setForm((prev) => ({ ...prev, durationMin: e.target.value }))}
              hasError={!!errors.durationMin}
            />
          </Field>
        </div>

        <Field label="الحضور">
          <Select
            value={form.attendance}
            onChange={(e) => setForm((prev) => ({ ...prev, attendance: e.target.value as SessionForm["attendance"] }))}
          >
            <option value="attended">حضر</option>
            <option value="late">تأخر</option>
            <option value="missed">غاب</option>
          </Select>
        </Field>

        <Field label="الملاحظات والمشاهدات" required error={errors.observations}>
          <Textarea
            value={form.observations}
            onChange={(e) => setForm((prev) => ({ ...prev, observations: e.target.value }))}
            hasError={!!errors.observations}
            placeholder="سجّل ملاحظاتك حول أداء المستفيد خلال الجلسة"
          />
        </Field>

        {/* Completed exercises */}
        {patientExercises.length > 0 && (
          <div className="mb-4">
            <p className="text-base font-semibold text-ink mb-2">التمارين المنجزة</p>
            <div className="space-y-2">
              {patientExercises.map((ex) => (
                <label key={ex.id} className="flex items-start gap-3 p-3 rounded-lg border-2 border-neutral-200 hover:border-neutral-300 cursor-pointer min-h-[48px]">
                  <input
                    type="checkbox"
                    checked={form.completedExerciseIds.includes(ex.id)}
                    onChange={() => toggleExercise(ex.id)}
                    className="mt-1 h-5 w-5"
                  />
                  <div className="flex-1">
                    <p className="text-base font-semibold text-ink">{ex.title}</p>
                    <p className="text-sm text-neutral-600">{ex.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Goal progress updates */}
        {allGoals.length > 0 && (
          <div className="mb-4">
            <p className="text-base font-semibold text-ink mb-2">تحديث تقدم الأهداف</p>
            <div className="space-y-4">
              {allGoals.map((g) => {
                const currentVal = form.goalProgress[g.id] ?? g.progress;
                return (
                  <div key={g.id} className="p-3 rounded-lg border-2 border-neutral-200">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-base text-ink">{g.text}</p>
                      <span className="text-base font-bold text-primary-700">{currentVal}%</span>
                    </div>
                    <p className="text-sm text-neutral-500 mb-2">الخطة: {g.planTitle}</p>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={currentVal}
                      onChange={(e) => updateGoalProgress(g.id, Number(e.target.value))}
                      className="w-full min-h-[48px]"
                      aria-label={`تقدم الهدف: ${g.text}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI-assisted summary label */}
        <Alert tone="info" title="ملخص تجريبي مساعد — لا يغني عن التقييم الطبي">
          الملاحظات السريرية أدناه قد تتضمن ملخصاً تجريبياً مساعداً. هذا الملخص لأغراض العرض فقط ولا يغني عن التقييم الطبي المهني.
        </Alert>

        <Field label="الملاحظات السريرية">
          <Textarea
            value={form.clinicalNotes}
            onChange={(e) => setForm((prev) => ({ ...prev, clinicalNotes: e.target.value }))}
            placeholder="سجّل الملاحظات السريرية التفصيلية"
          />
        </Field>

        <Field label="التوصيات للجلسة القادمة">
          <Textarea
            value={form.nextRecommendations}
            onChange={(e) => setForm((prev) => ({ ...prev, nextRecommendations: e.target.value }))}
            placeholder="توصيات للمتابعة والجلسة القادمة"
          />
        </Field>

        <Field label="تاريخ المتابعة">
          <Input
            type="date"
            value={form.followUpDate}
            onChange={(e) => setForm((prev) => ({ ...prev, followUpDate: e.target.value }))}
          />
        </Field>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-neutral-100">
          <Button variant="secondary" leftIcon={<Save className="h-5 w-5" aria-hidden="true" />} onClick={handleSaveDraft}>
            حفظ كمسودة
          </Button>
          <Button variant="primary" leftIcon={<CheckCircle className="h-5 w-5" aria-hidden="true" />} onClick={handleComplete}>
            إكمال الجلسة
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}
