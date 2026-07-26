export interface RegistrationForm {
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  birthDate: string;
  gender: "" | "male" | "female";
  hasCaregiver: boolean;
  caregiverName: string;
  caregiverRelation: string;
  phone: string;
  email: string;
  consent: boolean;
}

export const EMPTY_FORM: RegistrationForm = {
  username: "",
  password: "",
  confirmPassword: "",
  fullName: "",
  birthDate: "",
  gender: "",
  hasCaregiver: false,
  caregiverName: "",
  caregiverRelation: "",
  phone: "",
  email: "",
  consent: false,
};

export type StepKey = "account" | "personal" | "caregiver" | "contact" | "consent" | "review";

export interface StepDef {
  key: StepKey;
  label: string;
}

export const STEPS: StepDef[] = [
  { key: "account", label: "الحساب" },
  { key: "personal", label: "البيانات الشخصية" },
  { key: "caregiver", label: "مرافق التسجيل" },
  { key: "contact", label: "بيانات التواصل" },
  { key: "consent", label: "الموافقة" },
  { key: "review", label: "المراجعة" },
];
