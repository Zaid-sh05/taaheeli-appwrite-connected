export type RoleKey = "manager" | "doctor" | "admin" | "parent" | "patient";

export type Audience = "staff" | "patient-family";

export interface RoleMeta {
  key: RoleKey;
  label: string;
  description: string;
  icon: string;
  accent: "primary" | "secondary" | "accent" | "success" | "warning";
  audience: Audience;
}

export const ROLES: Record<RoleKey, RoleMeta> = {
  manager: {
    key: "manager",
    label: "مدير المركز",
    description: "إدارة المركز والموظفين والعمليات",
    icon: "Building2",
    accent: "primary",
    audience: "staff",
  },
  doctor: {
    key: "doctor",
    label: "طبيب أو أخصائي علاج",
    description: "متابعة الحالات والخطط العلاجية",
    icon: "Stethoscope",
    accent: "success",
    audience: "staff",
  },
  admin: {
    key: "admin",
    label: "موظف إداري",
    description: "التسجيل والمواعيد والتنظيم",
    icon: "ClipboardList",
    accent: "secondary",
    audience: "staff",
  },
  parent: {
    key: "parent",
    label: "ولي أمر أو فرد من الأسرة",
    description: "متابعة تقدم المريض والتواصل",
    icon: "Users",
    accent: "accent",
    audience: "patient-family",
  },
  patient: {
    key: "patient",
    label: "مريض",
    description: "متابعة برنامج التأهيل الخاص بك",
    icon: "HeartPulse",
    accent: "warning",
    audience: "patient-family",
  },
};

export const ROLE_LIST: RoleMeta[] = Object.values(ROLES);

export function isStaff(role: RoleKey): boolean {
  return ROLES[role].audience === "staff";
}
