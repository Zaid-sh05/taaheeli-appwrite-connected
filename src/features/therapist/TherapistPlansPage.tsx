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
import { PatientProgressIndicator } from "@/components/manager/PatientProgressIndicator";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatDate } from "@/lib/format";
import { ClipboardList, Plus, Trash2, Eye } from "lucide-react";
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

interface FormState {
  patientId: string;
  title: string;
  startDate: string;
  endDate: string;
  reviewDate: string;
  sessionFrequency: string;
  notes: string;
  status: PlanStatus;
  goals: string[];
}

const emptyForm: FormState = {
  patientId: "",
  title: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  reviewDate: "",
  sessionFrequency: "",
  notes: "",
  status: "active",
  goals: [""],
};

export function TherapistPlansPage() {
  useDocumentTitle("الخطط العلاجية");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data, addPlan } = useDemoData();
  const { session } = useSession();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
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

  const myPlans = useMemo(
    () => data.treatmentPlans.filter((tp) => tp.employeeId === therapistId),
    [data.treatmentPlans, therapistId],
  );

  const myPatients = useMemo(
    () => data.patients.filter((p) => p.assignedTherapistId === therapistId),
    [data.patients, therapistId],
  );

  const filtered = useMemo(() => {
    let list = [...myPlans];
    if (statusFilter !== "all") list = list.filter((tp) => tp.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((tp) => {
        const patient = data.patients.find((p) => p.id === tp.patientId);
        return tp.title.toLowerCase().includes(q) || (patient?.fullName.toLowerCase().includes(q) ?? false);
      });
    }
    return list;
  }, [myPlans, data.patients, search, statusFilter]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.patientId) e.patientId = "يرجى اختيار المستفيد";
    if (!form.title.trim()) e.title = "يرجى إدخال عنوان الخطة";
    if (!form.startDate) e.startDate = "يرجى إدخال تاريخ البداية";
    if (!form.sessionFrequency.trim()) e.sessionFrequency = "يرجى إدخال تكرار الجلسات";
    const validGoals = form.goals.filter((g) => g.trim());
    if (validGoals.length === 0) e.goals = "يرجى إضافة هدف واحد على الأقل";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) {
      showToast("يرجى تصحيح الأخطاء في النموذج", "error");
      return;
    }
    const validGoals = form.goals.filter((g) => g.trim()).map((g) => ({ text: g.trim() }));
    addPlan({
      patientId: form.patientId,
      employeeId: therapistId,
      title: form.title.trim(),
      startDate: form.startDate,
      endDate: form.endDate || null,
      reviewDate: form.reviewDate || null,
      goals: validGoals,
      sessionFrequency: form.sessionFrequency.trim(),
      notes: form.notes.trim(),
      status: form.status,
    });
    showToast("تم إنشاء الخطة العلاجية بنجاح");
    setForm(emptyForm);
    setErrors({});
    setModalOpen(false);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(emptyForm);
    setErrors({});
  }

  function addGoalField() {
    setForm((prev) => ({ ...prev, goals: [...prev.goals, ""] }));
  }

  function removeGoalField(index: number) {
    setForm((prev) => ({ ...prev, goals: prev.goals.filter((_, i) => i !== index) }));
  }

  function updateGoalField(index: number, value: string) {
    setForm((prev) => ({ ...prev, goals: prev.goals.map((g, i) => (i === index ? value : g)) }));
  }

  return (
    <PageContainer maxWidth="max-w-5xl" className="py-8">
      <PageHeader
        title="الخطط العلاجية"
        subtitle={`${myPlans.length} خطة مسندة إليك`}
        actions={
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <Button variant="primary" leftIcon={<Plus className="h-5 w-5" aria-hidden="true" />} onClick={() => setModalOpen(true)}>
              إنشاء خطة
            </Button>
          </div>
        }
      />
      <h2 ref={headingRef} className="sr-only">قائمة الخطط العلاجية</h2>

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="ابحث بعنوان الخطة أو اسم المستفيد" />
          <StatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
            label="تصفية حسب حالة الخطة"
            options={[
              { value: "all", label: "كل الحالات" },
              { value: "active", label: "نشطة" },
              { value: "completed", label: "مكتملة" },
              { value: "paused", label: "متوقفة" },
              { value: "draft", label: "مسودة" },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-12 w-12" aria-hidden="true" />}
            title="لا توجد خطط"
            description="لا توجد خطط علاجية تطابق معايير البحث الحالية."
            action={
              <Button variant="primary" leftIcon={<Plus className="h-5 w-5" aria-hidden="true" />} onClick={() => setModalOpen(true)}>
                إنشاء خطة جديدة
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">العنوان</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">المستفيد</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">الحالة</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">التقدم</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">تاريخ البداية</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">تاريخ المراجعة</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tp) => {
                  const patient = data.patients.find((p) => p.id === tp.patientId);
                  return (
                    <tr key={tp.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-2 font-semibold text-ink">{tp.title}</td>
                      <td className="py-3 px-2 text-neutral-600">{patient?.fullName ?? "—"}</td>
                      <td className="py-3 px-2">
                        <Badge tone={statusTone(tp.status)}>{statusLabels[tp.status]}</Badge>
                      </td>
                      <td className="py-3 px-2 min-w-[120px]"><PatientProgressIndicator value={tp.progress} /></td>
                      <td className="py-3 px-2 text-sm text-neutral-600">{formatDate(tp.startDate)}</td>
                      <td className="py-3 px-2 text-sm text-neutral-600">{tp.reviewDate ? formatDate(tp.reviewDate) : "—"}</td>
                      <td className="py-3 px-2">
                        <Link to={`/therapist/plans/${tp.id}`} className="inline-flex items-center gap-1 text-base font-semibold text-primary-700 hover:underline min-h-[48px]">
                          <Eye className="h-5 w-5" aria-hidden="true" /> تفاصيل
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create plan modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="إنشاء خطة علاجية جديدة"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>إلغاء</Button>
            <Button variant="primary" onClick={handleSubmit}>حفظ الخطة</Button>
          </>
        }
      >
        <Field label="المستفيد" required error={errors.patientId}>
          <Select
            value={form.patientId}
            onChange={(e) => setForm((prev) => ({ ...prev, patientId: e.target.value }))}
            hasError={!!errors.patientId}
          >
            <option value="">— اختر المستفيد —</option>
            {myPatients.map((p) => (
              <option key={p.id} value={p.id}>{p.fullName} ({p.fileNumber})</option>
            ))}
          </Select>
        </Field>

        <Field label="عنوان الخطة" required error={errors.title}>
          <Input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            hasError={!!errors.title}
            placeholder="مثال: خطة علاج طبيعي - المرحلة الأولى"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="تاريخ البداية" required error={errors.startDate}>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
              hasError={!!errors.startDate}
            />
          </Field>
          <Field label="تاريخ النهاية">
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
            />
          </Field>
          <Field label="تاريخ المراجعة">
            <Input
              type="date"
              value={form.reviewDate}
              onChange={(e) => setForm((prev) => ({ ...prev, reviewDate: e.target.value }))}
            />
          </Field>
        </div>

        <Field label="تكرار الجلسات" required error={errors.sessionFrequency}>
          <Input
            value={form.sessionFrequency}
            onChange={(e) => setForm((prev) => ({ ...prev, sessionFrequency: e.target.value }))}
            hasError={!!errors.sessionFrequency}
            placeholder="مثال: ٣ جلسات أسبوعياً"
          />
        </Field>

        <Field label="حالة الخطة">
          <Select
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as PlanStatus }))}
          >
            <option value="active">نشطة</option>
            <option value="draft">مسودة</option>
            <option value="paused">متوقفة</option>
            <option value="completed">مكتملة</option>
          </Select>
        </Field>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-semibold text-ink">الأهداف</span>
            <Button variant="ghost" size="sm" leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={addGoalField}>
              إضافة هدف
            </Button>
          </div>
          {errors.goals && <p className="text-sm font-semibold text-error-700 mb-2">{errors.goals}</p>}
          <div className="space-y-2">
            {form.goals.map((goal, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={goal}
                  onChange={(e) => updateGoalField(i, e.target.value)}
                  placeholder={`الهدف ${i + 1}`}
                />
                {form.goals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGoalField(i)}
                    className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-error-600 hover:bg-error-50 min-h-[48px] min-w-[48px] shrink-0"
                    aria-label="حذف الهدف"
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Field label="ملاحظات">
          <Textarea
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="ملاحظات إضافية حول الخطة"
          />
        </Field>
      </Modal>
    </PageContainer>
  );
}
