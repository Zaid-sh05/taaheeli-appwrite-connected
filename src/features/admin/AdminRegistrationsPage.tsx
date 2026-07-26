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
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { SearchInput } from "@/components/manager/SearchInput";
import { StatusFilter } from "@/components/manager/StatusFilter";
import { ConfirmDialog } from "@/components/manager/ConfirmDialog";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatDateTime } from "@/lib/format";
import { UserPlus, Phone, Mail, Eye, Users, CreditCard as Edit3, CircleHelp as HelpCircle, Forward, Calendar } from "lucide-react";
import type { RegistrationRequest } from "@/types/demo";

const statusConfig: Record<
  RegistrationRequest["status"],
  { label: string; tone: "pending" | "success" | "error" | "warning" }
> = {
  pending: { label: "بانتظار", tone: "pending" },
  approved: { label: "مقبول", tone: "success" },
  rejected: { label: "مرفوض", tone: "error" },
  "info-requested": { label: "استكمال مطلوب", tone: "warning" },
};

export function AdminRegistrationsPage() {
  useDocumentTitle("طلبات التسجيل");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data, updateRequestContact, forwardToManager } = useDemoData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewTarget, setViewTarget] = useState<RegistrationRequest | null>(null);
  const [editTarget, setEditTarget] = useState<RegistrationRequest | null>(null);
  const [forwardTarget, setForwardTarget] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ phone: "", email: "" });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const pendingCount = useMemo(
    () => data.requests.filter((r) => r.status === "pending").length,
    [data.requests],
  );

  const filtered = useMemo(() => {
    let list = [...data.requests];
    if (statusFilter !== "all")
      list = list.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          r.username.toLowerCase().includes(q) ||
          (r.phone ?? "").includes(q) ||
          (r.email ?? "").toLowerCase().includes(q),
      );
    }
    return list.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  }, [data.requests, search, statusFilter]);

  function openEdit(req: RegistrationRequest) {
    setEditTarget(req);
    setEditForm({ phone: req.phone ?? "", email: req.email ?? "" });
    setEditErrors({});
  }

  function validateEdit(): boolean {
    const e: Record<string, string> = {};
    if (editForm.phone && editForm.phone.trim().length < 6)
      e.phone = "رقم الهاتف غير صحيح";
    if (
      editForm.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())
    )
      e.email = "البريد الإلكتروني غير صحيح";
    setEditErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSaveEdit() {
    if (!editTarget) return;
    if (!validateEdit()) {
      showToast("يرجى تصحيح الأخطاء في النموذج", "error");
      return;
    }
    updateRequestContact(editTarget.id, {
      phone: editForm.phone.trim() || undefined,
      email: editForm.email.trim() || undefined,
    });
    showToast("تم تحديث معلومات التواصل بنجاح");
    setEditTarget(null);
  }

  function handleRequestInfo(req: RegistrationRequest) {
    // Admin can update the review note to indicate info is needed
    updateRequestContact(req.id, {});
    showToast(
      "تم تسجيل طلب استكمال المعلومات — سيتم إشعار مقدم الطلب",
      "info",
    );
  }

  function handleForward() {
    if (!forwardTarget) return;
    forwardToManager(forwardTarget);
    showToast("تم تحويل الطلب إلى مدير المركز للمراجعة النهائية", "success");
    setForwardTarget(null);
  }

  const forwardReq = useMemo(
    () => data.requests.find((r) => r.id === forwardTarget) ?? null,
    [data.requests, forwardTarget],
  );

  return (
    <PageContainer maxWidth="max-w-5xl" className="py-8">
      <PageHeader
        title="طلبات التسجيل"
        subtitle={`${pendingCount} طلب بانتظار المراجعة`}
        actions={<DemoDataBadge />}
      />
      <h2 ref={headingRef} className="sr-only">
        قائمة طلبات التسجيل
      </h2>

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="ابحث بالاسم أو الهاتف أو البريد"
          />
          <StatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "كل الحالات" },
              { value: "pending", label: "بانتظار" },
              { value: "approved", label: "مقبول" },
              { value: "rejected", label: "مرفوض" },
              { value: "info-requested", label: "استكمال مطلوب" },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<UserPlus className="h-12 w-12" aria-hidden="true" />}
            title="لا توجد طلبات"
            description="لا توجد طلبات تطابق معايير البحث الحالية."
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
                    اسم المتقدم
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
                    الهاتف
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-2 text-start font-semibold text-neutral-600"
                  >
                    البريد
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-2 text-start font-semibold text-neutral-600"
                  >
                    مرافق
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
                {filtered.map((r) => {
                  const cfg = statusConfig[r.status];
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-neutral-100 hover:bg-neutral-50"
                    >
                      <td className="py-3 px-2 font-semibold text-ink">
                        {r.fullName}
                      </td>
                      <td className="py-3 px-2 text-sm text-neutral-600">
                        {formatDateTime(r.submittedAt)}
                      </td>
                      <td className="py-3 px-2 text-sm text-neutral-600">
                        {r.phone ? (
                          <span className="inline-flex items-center gap-1">
                            <Phone
                              className="h-4 w-4 text-neutral-400"
                              aria-hidden="true"
                            />
                            {r.phone}
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-sm text-neutral-600">
                        {r.email ? (
                          <span className="inline-flex items-center gap-1">
                            <Mail
                              className="h-4 w-4 text-neutral-400"
                              aria-hidden="true"
                            />
                            {r.email}
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {r.hasCaregiver ? (
                          <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
                            <Users
                              className="h-4 w-4 text-neutral-400"
                              aria-hidden="true"
                            />
                            {r.caregiverRelation}
                          </span>
                        ) : (
                          <span className="text-sm text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <Badge tone={cfg.tone}>{cfg.label}</Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewTarget(r)}
                            className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-primary-600 hover:bg-primary-50 min-h-[48px] min-w-[48px]"
                            aria-label="عرض التفاصيل"
                            title="عرض التفاصيل"
                          >
                            <Eye className="h-5 w-5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-accent-600 hover:bg-accent-50 min-h-[48px] min-w-[48px]"
                            aria-label="تعديل معلومات التواصل"
                            title="تعديل معلومات التواصل"
                          >
                            <Edit3 className="h-5 w-5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRequestInfo(r)}
                            className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-warning-600 hover:bg-warning-50 min-h-[48px] min-w-[48px]"
                            aria-label="طلب استكمال معلومات"
                            title="طلب استكمال معلومات"
                          >
                            <HelpCircle
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => setForwardTarget(r.id)}
                            className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-secondary-600 hover:bg-secondary-50 min-h-[48px] min-w-[48px]"
                            aria-label="تحويل لمدير المركز"
                            title="تحويل لمدير المركز"
                          >
                            <Forward className="h-5 w-5" aria-hidden="true" />
                          </button>
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

      {/* View Details Modal */}
      <Modal
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="تفاصيل طلب التسجيل"
        footer={
          <Button variant="primary" onClick={() => setViewTarget(null)}>
            إغلاق
          </Button>
        }
      >
        {viewTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge tone={statusConfig[viewTarget.status].tone}>
                {statusConfig[viewTarget.status].label}
              </Badge>
              {viewTarget.hasCaregiver && (
                <Badge tone="neutral">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  بمرافق
                </Badge>
              )}
            </div>

            {viewTarget.reviewNote && (
              <Alert
                tone={
                  viewTarget.status === "approved"
                    ? "success"
                    : viewTarget.status === "rejected"
                      ? "error"
                      : "info"
                }
                title="ملاحظة المراجعة"
              >
                {viewTarget.reviewNote}
              </Alert>
            )}

            <dl className="space-y-3">
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">الاسم الكامل</dt>
                <dd className="text-ink">{viewTarget.fullName}</dd>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">
                  اسم المستخدم
                </dt>
                <dd className="text-ink">{viewTarget.username}</dd>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">
                  تاريخ الميلاد
                </dt>
                <dd className="text-ink">
                  <Calendar
                    className="inline h-4 w-4 ms-1"
                    aria-hidden="true"
                  />
                  {viewTarget.birthDate}
                </dd>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">الجنس</dt>
                <dd className="text-ink">
                  {viewTarget.gender === "male"
                    ? "ذكر"
                    : viewTarget.gender === "female"
                      ? "أنثى"
                      : "—"}
                </dd>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">الهاتف</dt>
                <dd className="text-ink">
                  {viewTarget.phone ? (
                    <span className="inline-flex items-center gap-1">
                      <Phone
                        className="h-4 w-4 text-neutral-400"
                        aria-hidden="true"
                      />
                      {viewTarget.phone}
                    </span>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">
                  البريد الإلكتروني
                </dt>
                <dd className="text-ink">
                  {viewTarget.email ? (
                    <span className="inline-flex items-center gap-1">
                      <Mail
                        className="h-4 w-4 text-neutral-400"
                        aria-hidden="true"
                      />
                      {viewTarget.email}
                    </span>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">
                  الموافقة على الخصوصية
                </dt>
                <dd className="text-ink">
                  {viewTarget.consent ? "موافق" : "غير موافق"}
                </dd>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <dt className="font-semibold text-neutral-600">
                  تاريخ التقديم
                </dt>
                <dd className="text-ink">
                  {formatDateTime(viewTarget.submittedAt)}
                </dd>
              </div>
              {viewTarget.reviewedAt && (
                <div className="flex justify-between border-b border-neutral-100 pb-2">
                  <dt className="font-semibold text-neutral-600">
                    تاريخ المراجعة
                  </dt>
                  <dd className="text-ink">
                    {formatDateTime(viewTarget.reviewedAt)}
                  </dd>
                </div>
              )}
            </dl>

            {viewTarget.hasCaregiver && (
              <div className="pt-2">
                <h4 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
                  <Users
                    className="h-5 w-5 text-primary-600"
                    aria-hidden="true"
                  />
                  مرافق التسجيل
                </h4>
                <dl className="space-y-3">
                  <div className="flex justify-between border-b border-neutral-100 pb-2">
                    <dt className="font-semibold text-neutral-600">
                      اسم مقدم الرعاية
                    </dt>
                    <dd className="text-ink">
                      {viewTarget.caregiverName || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-neutral-100 pb-2">
                    <dt className="font-semibold text-neutral-600">
                      صلة القرابة
                    </dt>
                    <dd className="text-ink">
                      {viewTarget.caregiverRelation || "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <Alert tone="info" title="ملاحظة">
              الموافقة النهائية أو الرفض يتم من قبل مدير المركز. يمكن للموظف
              الإداري تعديل بيانات التواصل وطلب استكمال المعلومات والتحويل
              لمدير المركز.
            </Alert>
          </div>
        )}
      </Modal>

      {/* Edit Contact Modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="تعديل معلومات التواصل"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditTarget(null)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              حفظ التغييرات
            </Button>
          </>
        }
      >
        {editTarget && (
          <div>
            <p className="text-base text-neutral-600 mb-4">
              تعديل معلومات التواصل للطلب:{" "}
              <span className="font-semibold text-ink">
                {editTarget.fullName}
              </span>
            </p>
            <Field label="رقم الهاتف" error={editErrors.phone}>
              <Input
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="مثال: 05xxxxxxxx"
                hasError={!!editErrors.phone}
              />
            </Field>
            <Field label="البريد الإلكتروني" error={editErrors.email}>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="example@email.com"
                hasError={!!editErrors.email}
              />
            </Field>
          </div>
        )}
      </Modal>

      {/* Forward to Manager Confirm */}
      <ConfirmDialog
        open={!!forwardTarget}
        title="تحويل لمدير المركز"
        message={
          forwardReq
            ? `سيتم تحويل طلب "${forwardReq.fullName}" إلى مدير المركز للمراجعة النهائية والموافقة. هل أنت متأكد؟`
            : ""
        }
        confirmLabel="نعم، تحويل"
        onConfirm={handleForward}
        onCancel={() => setForwardTarget(null)}
      />
    </PageContainer>
  );
}
