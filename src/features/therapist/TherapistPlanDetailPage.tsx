import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/manager/ConfirmDialog";
import { PatientProgressIndicator } from "@/components/manager/PatientProgressIndicator";
import { formatDate } from "@/lib/format";
import { printReport } from "@/lib/print";
import { ArrowRight, Plus, Printer, Activity, Dumbbell } from "lucide-react";
import type { PlanStatus } from "@/types/demo";

const statusLabels: Record<PlanStatus, string> = {
  active: "نشطة",
  completed: "مكتملة",
  paused: "متوقفة",
  draft: "مسودة",
};

function statusTone(status: PlanStatus): "success" | "primary" | "warning" | "neutral" {
  if (status === "active") return "success";
  if (status === "completed") return "primary";
  if (status === "paused") return "warning";
  return "neutral";
}

export function TherapistPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, addPlanGoal, updatePlanGoal, changePlanStatus } = useDemoData();
  const { showToast } = useToast();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  useDocumentTitle("تفاصيل الخطة العلاجية");

  const [newGoalText, setNewGoalText] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<PlanStatus | null>(null);
  const [goalInputs, setGoalInputs] = useState<Record<string, number>>({});

  const plan = useMemo(() => data.treatmentPlans.find((tp) => tp.id === id), [data.treatmentPlans, id]);
  const patient = useMemo(() => data.patients.find((p) => p.id === plan?.patientId), [data.patients, plan]);
  const sessions = useMemo(
    () => data.sessions.filter((s) => s.patientId === plan?.patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [data.sessions, plan],
  );
  const exercises = useMemo(() => data.exercises.filter((ex) => ex.patientId === plan?.patientId), [data.exercises, plan]);

  if (!plan) {
    return (
      <PageContainer maxWidth="max-w-3xl" className="py-8">
        <Alert tone="error" title="الخطة غير موجودة">
          لم يتم العثور على هذه الخطة. <Link to="/therapist/plans" className="font-semibold underline">العودة للقائمة</Link>
        </Alert>
      </PageContainer>
    );
  }

  function handleAddGoal() {
    if (!newGoalText.trim()) {
      showToast("يرجى إدخال نص الهدف", "error");
      return;
    }
    addPlanGoal(plan!.id, newGoalText.trim());
    setNewGoalText("");
    showToast("تمت إضافة الهدف بنجاح");
  }

  function handleGoalProgressChange(goalId: string, value: number) {
    setGoalInputs((prev) => ({ ...prev, [goalId]: value }));
  }

  function handleSaveGoalProgress(goalId: string) {
    const value = goalInputs[goalId];
    if (value === undefined) return;
    updatePlanGoal(plan!.id, goalId, value);
    showToast("تم تحديث تقدم الهدف");
  }

  function requestStatusChange(status: PlanStatus) {
    setPendingStatus(status);
    setStatusDialogOpen(true);
  }

  function confirmStatusChange() {
    if (pendingStatus) {
      changePlanStatus(plan!.id, pendingStatus);
      showToast(`تم تغيير حالة الخطة إلى: ${statusLabels[pendingStatus]}`);
    }
    setStatusDialogOpen(false);
    setPendingStatus(null);
  }

  function cancelStatusChange() {
    setStatusDialogOpen(false);
    setPendingStatus(null);
  }

  function handlePrint() {
    if (!plan) return;
    const goalsHTML = plan.goals
      .map((g) => `<tr><td>${g.text}</td><td>${g.progress}%</td></tr>`)
      .join("");
    const sessionsHTML = sessions
      .slice(0, 10)
      .map((s) => `<tr><td>${formatDate(s.date)}</td><td>${s.type}</td><td>${s.attendance === "attended" ? "حضر" : s.attendance === "missed" ? "غاب" : "تأخر"}</td><td>${s.notes}</td></tr>`)
      .join("");
    const bodyHTML = `
      <div class="summary-grid">
        <div class="summary-card"><div class="label">المستفيد</div><div class="value">${patient?.fullName ?? "—"}</div></div>
        <div class="summary-card"><div class="label">تقدم الخطة</div><div class="value">${plan.progress}%</div></div>
        <div class="summary-card"><div class="label">الحالة</div><div class="value">${statusLabels[plan.status]}</div></div>
      </div>
      <div class="section-title">معلومات الخطة</div>
      <table>
        <tr><th>العنوان</th><td>${plan.title}</td></tr>
        <tr><th>تاريخ البداية</th><td>${formatDate(plan.startDate)}</td></tr>
        <tr><th>تاريخ النهاية</th><td>${plan.endDate ? formatDate(plan.endDate) : "—"}</td></tr>
        <tr><th>تاريخ المراجعة</th><td>${plan.reviewDate ? formatDate(plan.reviewDate) : "—"}</td></tr>
        <tr><th>تكرار الجلسات</th><td>${plan.sessionFrequency}</td></tr>
        <tr><th>ملاحظات</th><td>${plan.notes || "—"}</td></tr>
      </table>
      <div class="section-title">الأهداف</div>
      <table><thead><tr><th>الهدف</th><th>التقدم</th></tr></thead><tbody>${goalsHTML}</tbody></table>
      <div class="section-title">سجل الجلسات</div>
      <table><thead><tr><th>التاريخ</th><th>النوع</th><th>الحضور</th><th>ملاحظات</th></tr></thead><tbody>${sessionsHTML}</tbody></table>
    `;
    printReport({ title: `خطة علاجية: ${plan.title}`, bodyHTML });
  }

  return (
    <PageContainer maxWidth="max-w-4xl" className="py-8">
      <div className="mb-4">
        <Link to="/therapist/plans" className="inline-flex items-center gap-1 text-base font-semibold text-primary-700 hover:underline">
          <ArrowRight className="h-5 w-5" aria-hidden="true" /> العودة لقائمة الخطط
        </Link>
      </div>

      <PageHeader title={plan.title} subtitle={`المستفيد: ${patient?.fullName ?? "—"}`} />
      <h2 ref={headingRef} className="sr-only">تفاصيل الخطة العلاجية</h2>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge tone={statusTone(plan.status)}>{statusLabels[plan.status]}</Badge>
        <Badge tone="primary">التقدم: {plan.progress}%</Badge>
        {plan.reviewDate && <Badge tone="warning">مراجعة: {formatDate(plan.reviewDate)}</Badge>}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Button variant="secondary" leftIcon={<Printer className="h-5 w-5" aria-hidden="true" />} onClick={handlePrint}>
          طباعة الخطة
        </Button>
        <Link to={`/therapist/patients/${plan.patientId}`}>
          <Button variant="secondary">ملف المستفيد</Button>
        </Link>
      </div>

      {/* Plan details */}
      <Card className="mb-6">
        <h3 className="text-xl font-bold text-ink mb-4">تفاصيل الخطة</h3>
        <dl className="space-y-3">
          <div className="flex justify-between border-b border-neutral-100 pb-2">
            <dt className="font-semibold text-neutral-600">تاريخ البداية</dt>
            <dd className="text-ink">{formatDate(plan.startDate)}</dd>
          </div>
          <div className="flex justify-between border-b border-neutral-100 pb-2">
            <dt className="font-semibold text-neutral-600">تاريخ النهاية</dt>
            <dd className="text-ink">{plan.endDate ? formatDate(plan.endDate) : "—"}</dd>
          </div>
          <div className="flex justify-between border-b border-neutral-100 pb-2">
            <dt className="font-semibold text-neutral-600">تاريخ المراجعة</dt>
            <dd className="text-ink">{plan.reviewDate ? formatDate(plan.reviewDate) : "—"}</dd>
          </div>
          <div className="flex justify-between border-b border-neutral-100 pb-2">
            <dt className="font-semibold text-neutral-600">تكرار الجلسات</dt>
            <dd className="text-ink">{plan.sessionFrequency}</dd>
          </div>
          {plan.notes && (
            <div className="border-b border-neutral-100 pb-2">
              <dt className="font-semibold text-neutral-600 mb-1">ملاحظات</dt>
              <dd className="text-ink">{plan.notes}</dd>
            </div>
          )}
          <div className="pt-2">
            <PatientProgressIndicator value={plan.progress} />
          </div>
        </dl>
      </Card>

      {/* Goals */}
      <Card className="mb-6">
        <h3 className="text-xl font-bold text-ink mb-4">الأهداف وتقدمها</h3>
        {plan.goals.length === 0 ? (
          <p className="text-base text-neutral-500 text-center py-4">لا توجد أهداف مسجلة</p>
        ) : (
          <ul className="space-y-4">
            {plan.goals.map((g) => {
              const currentVal = goalInputs[g.id] ?? g.progress;
              return (
                <li key={g.id} className="py-2 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-base font-semibold text-ink">{g.text}</p>
                    <span className="text-base font-bold text-primary-700">{currentVal}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={currentVal}
                      onChange={(e) => handleGoalProgressChange(g.id, Number(e.target.value))}
                      className="flex-1 min-h-[48px]"
                      aria-label={`تقدم الهدف: ${g.text}`}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSaveGoalProgress(g.id)}
                      disabled={goalInputs[g.id] === undefined || goalInputs[g.id] === g.progress}
                    >
                      حفظ
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Add new goal */}
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            <Input
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              placeholder="أدخل نص الهدف الجديد"
            />
            <Button variant="primary" leftIcon={<Plus className="h-5 w-5" aria-hidden="true" />} onClick={handleAddGoal}>
              إضافة هدف
            </Button>
          </div>
        </div>
      </Card>

      {/* Assigned exercises */}
      <Card className="mb-6">
        <h3 className="text-xl font-bold text-ink mb-4">التمارين المسندة</h3>
        {exercises.length === 0 ? (
          <p className="text-base text-neutral-500 text-center py-4">لا توجد تمارين مسندة</p>
        ) : (
          <ul className="space-y-3">
            {exercises.map((ex) => (
              <li key={ex.id} className="flex items-start gap-3 py-2 border-b border-neutral-100 last:border-0">
                <Dumbbell className="h-5 w-5 text-neutral-400 shrink-0 mt-1" aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-base font-semibold text-ink">{ex.title}</p>
                  <p className="text-sm text-neutral-600">{ex.description}</p>
                  <p className="text-sm text-neutral-500">التكرار: {ex.frequency}</p>
                  {ex.safetyNote && <p className="text-sm text-warning-700">تنبيه: {ex.safetyNote}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Session history */}
      <Card className="mb-6">
        <h3 className="text-xl font-bold text-ink mb-4">سجل الجلسات</h3>
        {sessions.length === 0 ? (
          <p className="text-base text-neutral-500 text-center py-4">لا توجد جلسات مسجلة</p>
        ) : (
          <ul className="space-y-3">
            {sessions.slice(0, 10).map((s) => (
              <li key={s.id} className="flex items-start gap-3 py-2 border-b border-neutral-100 last:border-0">
                <Activity className="h-5 w-5 text-neutral-400 shrink-0 mt-1" aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-base text-ink">
                    <span className="font-semibold">{s.type}</span> — {formatDate(s.date)} ({s.durationMin} دقيقة)
                  </p>
                  <p className="text-sm text-neutral-500">{s.notes}</p>
                  <Badge tone={s.attendance === "attended" ? "success" : s.attendance === "missed" ? "error" : "warning"}>
                    {s.attendance === "attended" ? "حضر" : s.attendance === "missed" ? "غاب" : "تأخر"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Change status */}
      <Card>
        <h3 className="text-xl font-bold text-ink mb-4">تغيير حالة الخطة</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={pendingStatus ?? ""}
            onChange={(e) => setPendingStatus(e.target.value as PlanStatus)}
            className="max-w-xs"
          >
            <option value="">— اختر الحالة الجديدة —</option>
            <option value="active">نشطة</option>
            <option value="completed">مكتملة</option>
            <option value="paused">متوقفة</option>
            <option value="draft">مسودة</option>
          </Select>
          <Button
            variant="primary"
            onClick={() => pendingStatus && requestStatusChange(pendingStatus)}
            disabled={!pendingStatus || pendingStatus === plan.status}
          >
            تطبيق
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={statusDialogOpen}
        title="تأكيد تغيير حالة الخطة"
        message={`هل أنت متأكد من تغيير حالة الخطة إلى "${pendingStatus ? statusLabels[pendingStatus] : ""}"؟`}
        confirmLabel="تأكيد التغيير"
        onConfirm={confirmStatusChange}
        onCancel={cancelStatusChange}
      />
    </PageContainer>
  );
}
