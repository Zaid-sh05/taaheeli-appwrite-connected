import { Checkbox } from "@/components/ui/Checkbox";
import { Card } from "@/components/ui/Card";
import type { RegistrationForm } from "@/types/registration";

interface Props {
  form: RegistrationForm;
  update: (patch: Partial<RegistrationForm>) => void;
  errors: Record<string, string>;
}

export function ConsentStep({ form, update, errors }: Props) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="text-xl font-bold text-ink mb-4">الموافقة على الخصوصية واستخدام البيانات</legend>
      <Card className="bg-neutral-50 border-neutral-100 mb-4">
        <p className="text-base text-neutral-700 leading-relaxed">
          يلتزم مركز تأهيلي بحماية خصوصيتك. تُستخدم البيانات المُدخَلة في هذا النموذج لإنشاء حسابك ومتابعة برنامج التأهيل فقط، ولن تُشارك مع أي طرف ثالث دون موافقتك. لن يُطلب منك أي معلومة طبية في هذا النموذج — تُضاف لاحقاً من قِبل فريق المركز بعد تفعيل حسابك وبموافقتك.
        </p>
      </Card>
      <Checkbox id="reg-consent" checked={form.consent} onChange={(e) => update({ consent: e.target.checked })} label="أوافق على سياسة الخصوصية واستخدام بياناتي لأغراض التأهيل ضمن المركز." />
      {errors.consent && <p role="alert" className="mt-2 text-sm font-semibold text-error-700">{errors.consent}</p>}
    </fieldset>
  );
}
