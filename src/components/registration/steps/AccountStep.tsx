import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import type { RegistrationForm } from "@/types/registration";

interface Props {
  form: RegistrationForm;
  update: (patch: Partial<RegistrationForm>) => void;
  errors: Record<string, string>;
}

export function AccountStep({ form, update, errors }: Props) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="text-xl font-bold text-ink mb-4">بيانات الحساب</legend>
      <Field label="اسم المستخدم" htmlFor="reg-username" required error={errors.username} hint="سيستخدم لتسجيل الدخول لاحقاً">
        <Input id="reg-username" value={form.username} onChange={(e) => update({ username: e.target.value })} hasError={!!errors.username} autoComplete="username" />
      </Field>
      <Field label="كلمة المرور" htmlFor="reg-password" required error={errors.password} hint="٨ أحرف على الأقل">
        <Input id="reg-password" type="password" value={form.password} onChange={(e) => update({ password: e.target.value })} hasError={!!errors.password} autoComplete="new-password" />
      </Field>
      <Field label="تأكيد كلمة المرور" htmlFor="reg-confirm" required error={errors.confirmPassword}>
        <Input id="reg-confirm" type="password" value={form.confirmPassword} onChange={(e) => update({ confirmPassword: e.target.value })} hasError={!!errors.confirmPassword} autoComplete="new-password" />
      </Field>
    </fieldset>
  );
}
