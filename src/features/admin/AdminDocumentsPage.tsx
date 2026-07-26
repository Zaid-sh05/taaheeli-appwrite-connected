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
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatDate } from "@/lib/format";
import {
  FileText,
  Plus,
  Check,
  Eye,
  ClipboardCheck,
} from "lucide-react";
import type { DocumentCategory, DocumentStatus, DemoDocument } from "@/types/demo";

const categoryLabels: Record<DocumentCategory, string> = {
  identity: "هوية",
  consent: "موافقة",
  "medical-report": "تقرير طبي",
  referral: "إحالة",
  administrative: "إداري",
};

const statusLabels: Record<DocumentStatus, string> = {
  missing: "مفقود",
  received: "مستلم",
  reviewed: "تمت المراجعة",
};

function statusTone(
  status: DocumentStatus,
): "error" | "success" | "primary" {
  if (status === "missing") return "error";
  if (status === "received") return "success";
  return "primary";
}

interface DocForm {
  patientId: string;
  title: string;
  category: DocumentCategory;
  notes: string;
}

const emptyDocForm: DocForm = {
  patientId: "",
  title: "",
  category: "identity",
  notes: "",
};

const statusOrder: DocumentStatus[] = ["missing", "received", "reviewed"];

function nextStatus(current: DocumentStatus): DocumentStatus | null {
  const idx = statusOrder.indexOf(current);
  if (idx < 0 || idx >= statusOrder.length - 1) return null;
  return statusOrder[idx + 1];
}

function nextStatusLabel(current: DocumentStatus): string {
  const next = nextStatus(current);
  if (next === "received") return "تسجيل كـ مستلم";
  if (next === "reviewed") return "تسجيل كـ تمت المراجعة";
  return "";
}

export function AdminDocumentsPage() {
  useDocumentTitle("سجل المستندات");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data, addDocument, updateDocument } = useDemoData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<DemoDocument | null>(null);
  const [docForm, setDocForm] = useState<DocForm>(emptyDocForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    let list = [...data.documents];
    if (categoryFilter !== "all")
      list = list.filter((d) => d.category === categoryFilter);
    if (statusFilter !== "all")
      list = list.filter((d) => d.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((d) => {
        const patient = data.patients.find((p) => p.id === d.patientId);
        return (
          d.title.toLowerCase().includes(q) ||
          patient?.fullName.toLowerCase().includes(q)
        );
      });
    }
    return list.sort((a, b) => {
      const aDate = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
      const bDate = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
      return bDate - aDate;
    });
  }, [data.documents, data.patients, search, categoryFilter, statusFilter]);

  const missingCount = useMemo(
    () => data.documents.filter((d) => d.status === "missing").length,
    [data.documents],
  );

  function validateDoc(): boolean {
    const e: Record<string, string> = {};
    if (!docForm.patientId) e.patientId = "يرجى اختيار المستفيد";
    if (!docForm.title.trim()) e.title = "يرجى إدخال عنوان المستند";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleCreateDoc() {
    if (!validateDoc()) {
      showToast("يرجى تصحيح الأخطاء في النموذج", "error");
      return;
    }
    addDocument({
      patientId: docForm.patientId,
      title: docForm.title.trim(),
      category: docForm.category,
      notes: docForm.notes.trim(),
    });
    showToast("تمت إضافة المستند بنجاح");
    setDocForm(emptyDocForm);
    setErrors({});
    setCreateOpen(false);
  }

  function closeCreate() {
    setCreateOpen(false);
    setDocForm(emptyDocForm);
    setErrors({});
  }

  function handleAdvanceStatus(doc: DemoDocument) {
    const next = nextStatus(doc.status);
    if (!next) return;
    updateDocument(doc.id, {
      status: next,
      uploadedAt: next === "received" && !doc.uploadedAt
        ? new Date().toISOString()
        : doc.uploadedAt,
    });
    showToast(`تم تحديث حالة المستند إلى: ${statusLabels[next]}`);
  }

  return (
    <PageContainer maxWidth="max-w-5xl" className="py-8">
      <PageHeader
        title="سجل المستندات"
        subtitle={`${missingCount} مستند مفقود بحاجة للمتابعة`}
        actions={
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            <Button
              variant="primary"
              leftIcon={<Plus className="h-5 w-5" aria-hidden="true" />}
              onClick={() => setCreateOpen(true)}
            >
              إضافة مستند
            </Button>
          </div>
        }
      />
      <h2 ref={headingRef} className="sr-only">
        سجل المستندات الإداري
      </h2>

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="ابحث باسم المستفيد أو عنوان المستند"
          />
          <StatusFilter
            value={categoryFilter}
            onChange={setCategoryFilter}
            label="تصفية حسب الفئة"
            options={[
              { value: "all", label: "كل الفئات" },
              { value: "identity", label: "هوية" },
              { value: "consent", label: "موافقة" },
              { value: "medical-report", label: "تقرير طبي" },
              { value: "referral", label: "إحالة" },
              { value: "administrative", label: "إداري" },
            ]}
          />
          <StatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
            label="تصفية حسب الحالة"
            options={[
              { value: "all", label: "كل الحالات" },
              { value: "missing", label: "مفقود" },
              { value: "received", label: "مستلم" },
              { value: "reviewed", label: "تمت المراجعة" },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-12 w-12" aria-hidden="true" />}
            title="لا توجد مستندات"
            description="لا توجد مستندات تطابق معايير البحث الحالية."
            action={
              <Button
                variant="primary"
                leftIcon={<Plus className="h-5 w-5" aria-hidden="true" />}
                onClick={() => setCreateOpen(true)}
              >
                إضافة مستند
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
                    العنوان
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-2 text-start font-semibold text-neutral-600"
                  >
                    الفئة
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
                    تاريخ الرفع
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
                {filtered.map((d) => {
                  const patient = data.patients.find(
                    (p) => p.id === d.patientId,
                  );
                  const next = nextStatus(d.status);
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-neutral-100 hover:bg-neutral-50"
                    >
                      <td className="py-3 px-2 font-semibold text-ink">
                        {patient?.fullName ?? "—"}
                      </td>
                      <td className="py-3 px-2 text-sm text-neutral-600">
                        {d.title}
                      </td>
                      <td className="py-3 px-2">
                        <Badge tone="neutral">
                          {categoryLabels[d.category]}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge tone={statusTone(d.status)}>
                          {statusLabels[d.status]}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-sm text-neutral-600">
                        {d.uploadedAt ? formatDate(d.uploadedAt) : "—"}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewTarget(d)}
                            className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-primary-600 hover:bg-primary-50 min-h-[48px] min-w-[48px]"
                            aria-label="عرض التفاصيل"
                            title="عرض التفاصيل"
                          >
                            <Eye className="h-5 w-5" aria-hidden="true" />
                          </button>
                          {next && (
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={
                                next === "reviewed" ? (
                                  <ClipboardCheck
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <Check
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                )
                              }
                              onClick={() => handleAdvanceStatus(d)}
                            >
                              {nextStatusLabel(d.status)}
                            </Button>
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

      {/* Create document modal */}
      <Modal
        open={createOpen}
        onClose={closeCreate}
        title="إضافة مستند جديد"
        footer={
          <>
            <Button variant="ghost" onClick={closeCreate}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleCreateDoc}>
              حفظ المستند
            </Button>
          </>
        }
      >
        <Alert tone="info" title="ملاحظة">
          يتم تسجيل بيانات المستند (البيانات الوصفية) فقط في النسخة التجريبية.
          لا يتم رفع ملفات فعلية.
        </Alert>

        <Field label="المستفيد" required error={errors.patientId}>
          <Select
            value={docForm.patientId}
            onChange={(e) =>
              setDocForm((prev) => ({ ...prev, patientId: e.target.value }))
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

        <Field label="عنوان المستند" required error={errors.title}>
          <Input
            value={docForm.title}
            onChange={(e) =>
              setDocForm((prev) => ({ ...prev, title: e.target.value }))
            }
            hasError={!!errors.title}
            placeholder="مثال: صورة الهوية"
          />
        </Field>

        <Field label="الفئة" required>
          <Select
            value={docForm.category}
            onChange={(e) =>
              setDocForm((prev) => ({
                ...prev,
                category: e.target.value as DocumentCategory,
              }))
            }
          >
            <option value="identity">هوية</option>
            <option value="consent">موافقة</option>
            <option value="medical-report">تقرير طبي</option>
            <option value="referral">إحالة</option>
            <option value="administrative">إداري</option>
          </Select>
        </Field>

        <Field label="ملاحظات">
          <Textarea
            value={docForm.notes}
            onChange={(e) =>
              setDocForm((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="ملاحظات إضافية حول المستند"
          />
        </Field>
      </Modal>

      {/* View document details modal */}
      <Modal
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="تفاصيل المستند"
        footer={
          <Button variant="primary" onClick={() => setViewTarget(null)}>
            إغلاق
          </Button>
        }
      >
        {viewTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge tone={statusTone(viewTarget.status)}>
                {statusLabels[viewTarget.status]}
              </Badge>
              <Badge tone="neutral">
                {categoryLabels[viewTarget.category]}
              </Badge>
            </div>

            <dl className="space-y-3">
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">
                  المستفيد
                </dt>
                <dd className="text-ink">
                  {data.patients.find((p) => p.id === viewTarget.patientId)
                    ?.fullName ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">العنوان</dt>
                <dd className="text-ink">{viewTarget.title}</dd>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">الفئة</dt>
                <dd className="text-ink">
                  {categoryLabels[viewTarget.category]}
                </dd>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">الحالة</dt>
                <dd className="text-ink">
                  {statusLabels[viewTarget.status]}
                </dd>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">
                  تاريخ الرفع
                </dt>
                <dd className="text-ink">
                  {viewTarget.uploadedAt
                    ? formatDate(viewTarget.uploadedAt)
                    : "—"}
                </dd>
              </div>
              {viewTarget.notes && (
                <div className="border-b border-neutral-100 pb-2">
                  <dt className="font-semibold text-neutral-600 mb-1">
                    ملاحظات
                  </dt>
                  <dd className="text-ink leading-relaxed">
                    {viewTarget.notes}
                  </dd>
                </div>
              )}
            </dl>

            {viewTarget.status === "missing" && (
              <Alert tone="warning" title="مستند مفقود">
                هذا المستند مفقود ويحتاج للمتابعة. يمكن تسجيله كمستلم عند
                استلامه.
              </Alert>
            )}

            {nextStatus(viewTarget.status) && (
              <Button
                variant="primary"
                fullWidth
                leftIcon={
                  nextStatus(viewTarget.status) === "reviewed" ? (
                    <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  )
                }
                onClick={() => {
                  handleAdvanceStatus(viewTarget);
                  setViewTarget(null);
                }}
              >
                {nextStatusLabel(viewTarget.status)}
              </Button>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
