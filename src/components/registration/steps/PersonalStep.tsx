import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { RegistrationForm } from "@/types/registration";

interface Props {
  form: RegistrationForm;
  update: (patch: Partial<RegistrationForm>) => void;
  errors: Record<string, string>;
}

export function PersonalStep({ form, update, errors }: Props) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="text-xl font-bold text-ink mb-4">البيانات الشخصية</legend>
      <Field label="الاسم الكامل" htmlFor="reg-name" required error={errors.fullName}>
        <Input id="reg-name" value={form.fullName} onChange={(e) => update({ fullName: e.target.value })} hasError={!!errors.fullName} autoComplete="name" />
      </Field>
      <Field label="تاريخ الميلاد" htmlFor="reg-dob" required error={errors.birthDate}>
        <Input id="reg-dob" type="date" value={form.birthDate} onChange={(e) => update({ birthDate: e.target.value })} hasError={!!errors.birthDate} />
      </Field>
      <Field label="الجنس (اختياري)" htmlFor="reg-gender">
        <Select id="reg-gender" value={form.gender} onChange={(e) => update({ gender: e.target.value as RegistrationForm["gender"] })}>
          <option value="">— اختر —</option>
          <option value="male">ذكر</option>
          <option value="female">أنثى</option>
        </Select>
      </Field>
    </fieldset>
  );
}
