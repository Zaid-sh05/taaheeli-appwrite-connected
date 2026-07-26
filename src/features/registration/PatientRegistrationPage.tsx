import { useReducer, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Send } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormErrorSummary } from "@/components/feedback/FormErrorSummary";
import { RegistrationStepper } from "@/components/registration/RegistrationStepper";
import { AccountStep } from "@/components/registration/steps/AccountStep";
import { PersonalStep } from "@/components/registration/steps/PersonalStep";
import { CaregiverStep } from "@/components/registration/steps/CaregiverStep";
import { ContactStep } from "@/components/registration/steps/ContactStep";
import { ConsentStep } from "@/components/registration/steps/ConsentStep";
import { ReviewStep } from "@/components/registration/steps/ReviewStep";
import { EMPTY_FORM, STEPS, type RegistrationForm } from "@/types/registration";
import { useDemoData } from "@/context/DemoDataContext";

type Action = { type: "patch"; patch: Partial<RegistrationForm> };
function reducer(state: RegistrationForm, action: Action): RegistrationForm {
  return { ...state, ...action.patch };
}

export function PatientRegistrationPage() {
  useDocumentTitle("تسجيل مريض جديد");
  const navigate = useNavigate();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { addRequest } = useDemoData();
  const [form, dispatch] = useReducer(reducer, EMPTY_FORM);
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = (patch: Partial<RegistrationForm>) => dispatch({ type: "patch", patch });

  function validateStep(): boolean {
    const e: Record<string, string> = {};
    if (stepIndex === 0) {
      if (!form.username.trim()) e.username = "اسم المستخدم مطلوب";
      if (form.password.length < 8) e.password = "كلمة المرور ٨ أحرف على الأقل";
      if (form.confirmPassword !== form.password) e.confirmPassword = "كلمتا المرور غير متطابقتين";
    }
    if (stepIndex === 1) {
      if (!form.fullName.trim()) e.fullName = "الاسم الكامل مطلوب";
      if (!form.birthDate) e.birthDate = "تاريخ الميلاد مطلوب";
    }
    if (stepIndex === 2 && form.hasCaregiver) {
      if (!form.caregiverName.trim()) e.caregiverName = "اسم مقدم الرعاية مطلوب";
      if (!form.caregiverRelation.trim()) e.caregiverRelation = "صلة القرابة مطلوبة";
    }
    if (stepIndex === 3) {
      if (form.phone && !/^[0-9+\-\s]{7,}$/.test(form.phone)) e.phone = "رقم هاتف غير صحيح";
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "بريد إلكتروني غير صحيح";
    }
    if (stepIndex === 4 && !form.consent) e.consent = "يجب الموافقة على سياسة الخصوصية للمتابعة";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validateStep()) return;
    setErrors({});
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function back() {
    setErrors({});
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function submit() {
    if (!validateStep()) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      await addRequest({
        fullName: form.fullName,
        username: form.username,
        birthDate: form.birthDate,
        gender: form.gender,
        hasCaregiver: form.hasCaregiver,
        caregiverName: form.caregiverName,
        caregiverRelation: form.caregiverRelation,
        phone: form.phone || undefined,
        email: form.email || undefined,
        consent: form.consent,
      });
      navigate("/pending-activation");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "تعذر إرسال طلب التسجيل. حاول مرة أخرى.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const isLast = stepIndex === STEPS.length - 1;

  let stepBody: ReactNode = null;
  switch (STEPS[stepIndex].key) {
    case "account": stepBody = <AccountStep form={form} update={update} errors={errors} />; break;
    case "personal": stepBody = <PersonalStep form={form} update={update} errors={errors} />; break;
    case "caregiver": stepBody = <CaregiverStep form={form} update={update} errors={errors} />; break;
    case "contact": stepBody = <ContactStep form={form} update={update} errors={errors} />; break;
    case "consent": stepBody = <ConsentStep form={form} update={update} errors={errors} />; break;
    case "review": stepBody = <ReviewStep form={form} />; break;
  }

  return (
    <PageContainer className="py-10">
      <PageHeader title="تسجيل مريض جديد" subtitle="لن يُطلب منك أي معلومة طبية في هذا النموذج" />
      <h2 ref={headingRef} className="sr-only">نموذج التسجيل</h2>

      <div className="mb-6"><RegistrationStepper currentIndex={stepIndex} /></div>

      <Card>
        {Object.values(errors).length > 0 && <FormErrorSummary errors={Object.values(errors)} className="mb-4" />}
        {submitError && (
          <FormErrorSummary errors={[submitError]} className="mb-4" />
        )}
        {stepBody}
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={back} disabled={stepIndex === 0 || submitting} leftIcon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>السابق</Button>
          {!isLast ? (
            <Button onClick={next} rightIcon={<ArrowLeft className="h-5 w-5" aria-hidden="true" />}>التالي</Button>
          ) : (
            <Button onClick={() => void submit()} loading={submitting} leftIcon={<Send className="h-5 w-5" aria-hidden="true" />}>إرسال الطلب</Button>
          )}
        </div>
      </Card>
    </PageContainer>
  );
}
