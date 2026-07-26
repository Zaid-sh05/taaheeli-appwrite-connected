import { useNavigate, Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export function PendingActivationPage() {
  useDocumentTitle("حساب قيد التفعيل");
  const navigate = useNavigate();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();

  return (
    <PageContainer className="py-10">
      <PageHeader title="حسابك قيد التفعيل" />
      <h2 ref={headingRef} className="sr-only">حالة تفعيل الحساب</h2>

      <Card>
        <Alert tone="pending" title="تم استلام طلبك بنجاح">
          شكراً لتسجيلك. سيقوم فريق المركز بمراجعة طلبك وتفعيل حسابك في أقرب وقت. ستتمكن من تسجيل الدخول بمجرد تفعيل الحساب.
        </Alert>

        <div className="mt-6 flex items-start gap-3 text-base text-neutral-700">
          <Clock className="h-5 w-5 mt-1 text-secondary-600 shrink-0" aria-hidden="true" />
          <p className="leading-relaxed">عادةً تستغرق عملية المراجعة من يوم إلى ثلاثة أيام عمل. إذا مرّت أكثر من خمسة أيام ولم يُفعَّل حسابك، يرجى التواصل مع المركز.</p>
        </div>

        <div className="mt-6 rounded-lg bg-neutral-50 border border-neutral-100 p-4">
          <p className="text-base font-semibold text-ink mb-1">للتواصل مع المركز</p>
          <p className="text-base text-neutral-700">الهاتف: ٩٢٠ ٠٠٠ ٠٠٠</p>
          <p className="text-base text-neutral-700">البريد: info@taaheeli.example</p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button variant="secondary" onClick={() => navigate("/login")} rightIcon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>العودة لتسجيل الدخول</Button>
          <Link to="/" className="text-center text-base font-semibold text-primary-700 hover:underline">العودة لاختيار الدور</Link>
        </div>
      </Card>
    </PageContainer>
  );
}
