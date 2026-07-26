import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Textarea } from "@/components/ui/Textarea";
import { RequestStatusBadge } from "@/components/manager/RequestStatusBadge";
import { ConfirmDialog } from "@/components/manager/ConfirmDialog";
import { formatDateTime } from "@/lib/format";
import { CircleCheck as CheckCircle2, Circle as XCircle, CircleAlert as AlertCircle, ArrowRight, Phone, Mail, Users, Calendar } from "lucide-react";

export function ManagerRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, approveRequest, rejectRequest, requestInfo } = useDemoData();
  const { showToast } = useToast();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  useDocumentTitle("تفاصيل الطلب");

  const request = useMemo(() => data.requests.find((r) => r.id === id), [data.requests, id]);

  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | "info" | null>(null);
  const [note, setNote] = useState("");

  if (!request) {
    return (
      <PageContainer maxWidth="max-w-3xl" className="py-8">
        <Alert tone="error" title="الطلب غير موجود">
          لم يتم العثور على هذا الطلب. <Link to="/manager/requests" className="font-semibold underline">العودة للقائمة</Link>
        </Alert>
      </PageContainer>
    );
  }

  const isFinal = request.status === "approved" || request.status === "rejected";

  async function handleConfirm() {
    if (!request) return;

    try {
      if (confirmAction === "approve") {
        await approveRequest(request.id);
        showToast("تم تحديث الطلب في قاعدة البيانات", "success");
      } else if (confirmAction === "reject") {
        await rejectRequest(request.id, note || undefined);
        showToast("تم رفض الطلب", "info");
      } else if (confirmAction === "info") {
        await requestInfo(request.id, note || undefined);
        showToast("تم طلب استكمال المعلومات من مقدم الطلب", "info");
      }
      setConfirmAction(null);
      setNote("");
    } catch {
      showToast("تعذر تحديث الطلب في قاعدة البيانات", "error");
    }
  }

  const confirmTitle = confirmAction === "approve" ? "تأكيد الموافقة" : confirmAction === "reject" ? "تأكيد الرفض" : "طلب استكمال معلومات";
  const confirmMessage = confirmAction === "approve"
    ? "سيتم قبول هذا الطلب وإضافة المريض إلى قائمة المستفيدين النشطين. هل أنت متأكد؟"
    : confirmAction === "reject"
    ? "سيتم رفض هذا الطلب. سيبقى الطلب في السجل لكنه لن يُفعَّل. هل أنت متأكد؟"
    : "سيتم طلب استكمال المعلومات من مقدم الطلب. هل أنت متأكد؟";

  return (
    <PageContainer maxWidth="max-w-3xl" className="py-8">
      <div className="mb-4">
        <Link to="/manager/requests" className="inline-flex items-center gap-1 text-base font-semibold text-primary-700 hover:underline">
          <ArrowRight className="h-5 w-5" aria-hidden="true" /> العودة لطلبات التفعيل
        </Link>
      </div>

      <PageHeader title={`طلب: ${request.fullName}`} subtitle={`أُرسل في ${formatDateTime(request.submittedAt)}`} />
      <h2 ref={headingRef} className="sr-only">تفاصيل طلب التفعيل</h2>

      <div className="mb-4"><RequestStatusBadge status={request.status} /></div>

      {isFinal && (
        <Alert tone={request.status === "approved" ? "success" : "error"} className="mb-4" title={request.status === "approved" ? "تمت الموافقة على هذا الطلب" : "تم رفض هذا الطلب"}>
          {request.reviewedAt && <span>تاريخ المراجعة: {formatDateTime(request.reviewedAt)}</span>}
          {request.reviewNote && <span> — {request.reviewNote}</span>}
        </Alert>
      )}

      <Card className="mb-6">
        <h3 className="text-xl font-bold text-ink mb-4">بيانات المتقدم</h3>
        <dl className="space-y-3">
          <div className="flex justify-between border-b border-neutral-100 pb-2">
            <dt className="font-semibold text-neutral-600">الاسم الكامل</dt>
            <dd className="text-ink">{request.fullName}</dd>
          </div>
          <div className="flex justify-between border-b border-neutral-100 pb-2">
            <dt className="font-semibold text-neutral-600">اسم المستخدم</dt>
            <dd className="text-ink">{request.username}</dd>
          </div>
          <div className="flex justify-between border-b border-neutral-100 pb-2">
            <dt className="font-semibold text-neutral-600">تاريخ الميلاد</dt>
            <dd className="text-ink"><Calendar className="inline h-4 w-4 ms-1" aria-hidden="true" />{request.birthDate}</dd>
          </div>
          <div className="flex justify-between border-b border-neutral-100 pb-2">
            <dt className="font-semibold text-neutral-600">الجنس</dt>
            <dd className="text-ink">{request.gender === "male" ? "ذكر" : request.gender === "female" ? "أنثى" : "—"}</dd>
          </div>
          {request.phone && (
            <div className="flex justify-between border-b border-neutral-100 pb-2">
              <dt className="font-semibold text-neutral-600">الهاتف</dt>
              <dd className="text-ink"><Phone className="inline h-4 w-4 ms-1" aria-hidden="true" />{request.phone}</dd>
            </div>
          )}
          {request.email && (
            <div className="flex justify-between border-b border-neutral-100 pb-2">
              <dt className="font-semibold text-neutral-600">البريد الإلكتروني</dt>
              <dd className="text-ink"><Mail className="inline h-4 w-4 ms-1" aria-hidden="true" />{request.email}</dd>
            </div>
          )}
          <div className="flex justify-between border-b border-neutral-100 pb-2">
            <dt className="font-semibold text-neutral-600">الموافقة على الخصوصية</dt>
            <dd className="text-ink">{request.consent ? "موافق" : "غير موافق"}</dd>
          </div>
        </dl>
      </Card>

      {request.hasCaregiver && (
        <Card className="mb-6">
          <h3 className="text-xl font-bold text-ink mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-primary-600" aria-hidden="true" /> مرافق التسجيل</h3>
          <dl className="space-y-3">
            <div className="flex justify-between border-b border-neutral-100 pb-2">
              <dt className="font-semibold text-neutral-600">اسم مقدم الرعاية</dt>
              <dd className="text-ink">{request.caregiverName}</dd>
            </div>
            <div className="flex justify-between border-b border-neutral-100 pb-2">
              <dt className="font-semibold text-neutral-600">صلة القرابة</dt>
              <dd className="text-ink">{request.caregiverRelation}</dd>
            </div>
          </dl>
        </Card>
      )}

      {!isFinal && (
        <Card>
          <h3 className="text-xl font-bold text-ink mb-4">إجراءات المراجعة</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => setConfirmAction("approve")} leftIcon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}>موافقة</Button>
            <Button variant="danger" onClick={() => setConfirmAction("reject")} leftIcon={<XCircle className="h-5 w-5" aria-hidden="true" />}>رفض</Button>
            <Button variant="secondary" onClick={() => setConfirmAction("info")} leftIcon={<AlertCircle className="h-5 w-5" aria-hidden="true" />}>طلب استكمال معلومات</Button>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={confirmAction !== null}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmAction === "approve" ? "موافقة" : confirmAction === "reject" ? "رفض" : "إرسال الطلب"}
        onConfirm={() => void handleConfirm()}
        onCancel={() => { setConfirmAction(null); setNote(""); }}
      />

      {confirmAction === "info" || confirmAction === "reject" ? (
        <div className="mt-4">
          <label htmlFor="review-note" className="block text-base font-semibold text-ink mb-1.5">ملاحظة (اختياري)</label>
          <Textarea id="review-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="أضف ملاحظة للمتقدم..." />
        </div>
      ) : null}
    </PageContainer>
  );
}
