import { Alert } from "@/components/ui/Alert";

export function AISkeletonNotice() {
  return (
    <Alert tone="warning" title="وضع الهيكل التجريبي" className="mb-6">
      لا يتم إرسال أي بيانات إلى مزود خارجي. النتائج الحالية يولدها Mock Provider
      من البيانات الوهمية داخل المتصفح، ولا تمثل تحليلاً أو توصية طبية.
    </Alert>
  );
}
