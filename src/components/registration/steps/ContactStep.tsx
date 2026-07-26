import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import type { RegistrationForm } from "@/types/registration";

interface Props {
  form: RegistrationForm;
  update: (patch: Partial<RegistrationForm>) => void;
  errors: Record<string, string>;
}

export function ContactStep({ form, update, errors }: Props) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="text-xl font-bold text-ink mb-4">بيانات التواصل (اختياري)</legend>
      <Field label="رقم الهاتف" htmlFor="reg-phone" error={errors.phone} hint="اختياري — يُستخدم للتواصل بخصوص المواعيد">
        <Input id="reg-phone" type="tel" value={form.phone} onChange={(e) => update({ phone: e.target.value })} hasError={!!errors.phone} autoComplete="tel" inputMode="tel" />
      </Field>
      <Field label="البريد الإلكتروني" htmlFor="reg-email" error={errors.email} hint="اختياري">
        <Input id="reg-email" type="email" value={form.email} onChange={(e) => update({ email: e.target.value })} hasError={!!errors.email} autoComplete="email" inputMode="email" />
      </Field>
    </fieldset>
  );
}
