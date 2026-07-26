import { NavLink } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { cn } from "@/lib/cn";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RoleKey } from "@/config/roles";
import { useMemo } from "react";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV_CONFIG: Record<RoleKey, NavItem[]> = {
  manager: [
    { to: "/manager", label: "نظرة عامة", icon: "LayoutDashboard" },
    { to: "/manager/requests", label: "طلبات التفعيل", icon: "UserPlus" },
    { to: "/manager/patients", label: "المستفيدون", icon: "Users" },
    { to: "/manager/employees", label: "الموظفون", icon: "Briefcase" },
    { to: "/manager/reports", label: "التقارير", icon: "BarChart3" },
    { to: "/manager/ai", label: "الملخص الذكي", icon: "Sparkles" },
    { to: "/manager/notifications", label: "التنبيهات", icon: "Bell" },
  ],
  doctor: [
    { to: "/therapist", label: "نظرة عامة", icon: "LayoutDashboard" },
    { to: "/therapist/patients", label: "مرضاي", icon: "Users" },
    { to: "/therapist/plans", label: "الخطط العلاجية", icon: "ClipboardList" },
    { to: "/therapist/appointments", label: "المواعيد", icon: "CalendarDays" },
    { to: "/therapist/ai", label: "المساعد الذكي", icon: "Bot" },
    { to: "/therapist/notifications", label: "التنبيهات", icon: "Bell" },
  ],
  admin: [
    { to: "/admin", label: "نظرة عامة", icon: "LayoutDashboard" },
    { to: "/admin/registrations", label: "التسجيلات", icon: "UserPlus" },
    { to: "/admin/appointments", label: "المواعيد", icon: "CalendarDays" },
    { to: "/admin/documents", label: "المستندات", icon: "FileText" },
    { to: "/admin/notifications", label: "التنبيهات", icon: "Bell" },
  ],
  parent: [
    { to: "/family", label: "نظرة عامة", icon: "TrendingUp" },
    { to: "/family/progress", label: "التقدم", icon: "Activity" },
    { to: "/family/appointments", label: "المواعيد", icon: "CalendarDays" },
    { to: "/family/messages", label: "التواصل", icon: "MessageSquare" },
    { to: "/family/reports", label: "التقارير", icon: "FileText" },
    { to: "/family/ai-summary", label: "الملخص الذكي", icon: "Sparkles" },
  ],
  patient: [
    { to: "/patient", label: "برنامجي", icon: "HeartPulse" },
    { to: "/patient/appointments", label: "مواعيدي", icon: "CalendarDays" },
    { to: "/patient/exercises", label: "تماريني", icon: "Dumbbell" },
    { to: "/patient/companion", label: "المرافق الذكي", icon: "MessageCircle" },
  ],
};

const HOME_ROUTES = ["/manager", "/therapist", "/admin", "/patient", "/family"];

export function RoleNav({ role }: { role: RoleKey }) {
  const { data } = useDemoData();

  const unreadNotifCount = useMemo(
    () => data.notifications.filter((n) => !n.read && (!n.targetRole || n.targetRole === role)).length,
    [data.notifications, role],
  );

  const items = NAV_CONFIG[role] ?? [];

  function getBadge(item: NavItem): number | undefined {
    if (role === "manager" && item.to === "/manager/requests") {
      return data.requests.filter((r) => r.status === "pending").length;
    }
    if (item.to.includes("notifications")) return unreadNotifCount;
    return undefined;
  }

  return (
    <nav aria-label="القائمة الرئيسية" className="border-b border-neutral-100 bg-white">
      <ul className="mx-auto max-w-5xl px-4 sm:px-6 flex gap-1 overflow-x-auto py-2">
        {items.map((item) => {
          const Icon = (Icons as unknown as Record<string, LucideIcon>)[item.icon] ?? Icons.Circle;
          const badge = getBadge(item);
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={HOME_ROUTES.includes(item.to)}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-base font-semibold text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors min-h-[48px] whitespace-nowrap",
                    isActive && "bg-primary-50 text-primary-700 underline underline-offset-4 decoration-2",
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
                {badge !== undefined && badge > 0 && (
                  <span
                    className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-accent-500 text-white text-sm font-bold"
                    aria-label={`${badge} تنبيهات غير مقروءة`}
                  >
                    {badge}
                  </span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
