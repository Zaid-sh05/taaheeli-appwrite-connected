import { Checkbox } from "@/components/ui/Checkbox";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import type { RegistrationForm } from "@/types/registration";

interface Props {
  form: RegistrationForm;
  update: (patch: Partial<RegistrationForm>) => void;
  errors: Record<string, string>;
}

export function CaregiverStep({ form, update, errors }: Props) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="text-xl font-bold text-ink mb-4">مرافق التسجيل</legend>
      <div className="mb-4">
        <Checkbox id="reg-has-caregiver" checked={form.hasCaregiver} onChange={(e) => update({ hasCaregiver: e.target.checked })} label="هل يتم تسجيل المريض بمساعدة ولي أمر أو مقدم رعاية؟" />
      </div>
      {form.hasCaregiver && (
        <>
          <Field label="اسم مقدم الرعاية" htmlFor="reg-cg-name" required={form.hasCaregiver} error={errors.caregiverName}>
            <Input id="reg-cg-name" value={form.caregiverName} onChange={(e) => update({ caregiverName: e.target.value })} hasError={!!errors.caregiverName} />
          </Field>
          <Field label="صلة القرابة" htmlFor="reg-cg-rel" required={form.hasCaregiver} error={errors.caregiverRelation} hint="مثال: الأب، الأم، الأخ، مقدم رعاية">
            <Input id="reg-cg-rel" value={form.caregiverRelation} onChange={(e) => update({ caregiverRelation: e.target.value })} hasError={!!errors.caregiverRelation} />
          </Field>
        </>
      )}
    </fieldset>
  );
}
