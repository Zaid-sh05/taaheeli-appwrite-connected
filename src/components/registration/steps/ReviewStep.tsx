import type { RegistrationForm } from "@/types/registration";

interface Props {
  form: RegistrationForm;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 py-2 border-b border-neutral-100 last:border-0">
      <dt className="font-semibold text-neutral-700">{label}</dt>
      <dd className="text-ink">{value || "—"}</dd>
    </div>
  );
}

export function ReviewStep({ form }: Props) {
  const genderLabel = form.gender === "male" ? "ذكر" : form.gender === "female" ? "أنثى" : "—";
  const consentLabel = form.consent ? "موافق" : "غير موافق";

  return (
    <div>
      <h3 className="text-xl font-bold text-ink mb-4">مراجعة البيانات قبل الإرسال</h3>
      <p className="text-base text-neutral-600 mb-4">يرجى التأكد من صحة البيانات التالية قبل إرسال الطلب.</p>
      <dl className="rounded-lg bg-white border border-neutral-100 px-4">
        <Row label="اسم المستخدم" value={form.username} />
        <Row label="الاسم الكامل" value={form.fullName} />
        <Row label="تاريخ الميلاد" value={form.birthDate} />
        <Row label="الجنس" value={genderLabel} />
        <Row label="بمساعدة مقدم رعاية" value={form.hasCaregiver ? "نعم" : "لا"} />
        {form.hasCaregiver && (
          <>
            <Row label="اسم مقدم الرعاية" value={form.caregiverName} />
            <Row label="صلة القرابة" value={form.caregiverRelation} />
          </>
        )}
        <Row label="الهاتف" value={form.phone} />
        <Row label="البريد الإلكتروني" value={form.email} />
        <Row label="الموافقة" value={consentLabel} />
      </dl>
    </div>
  );
}
