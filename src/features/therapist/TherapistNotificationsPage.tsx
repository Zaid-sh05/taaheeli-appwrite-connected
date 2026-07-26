import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { formatRelative } from "@/lib/format";
import {
  Bell,
  UserPlus,
  CalendarX,
  ClipboardCheck,
  FileWarning,
  TrendingDown,
  CheckCheck,
  CalendarClock,
  Users,
  UserCheck,
} from "lucide-react";
import type { NotificationType } from "@/types/demo";

const typeConfig: Record<NotificationType, { icon: React.ReactNode; label: string; iconClass: string }> = {
  registration: { icon: <UserPlus className="h-5 w-5" />, label: "تسجيل جديد", iconClass: "bg-primary-50 text-primary-600" },
  "missed-appointment": { icon: <CalendarX className="h-5 w-5" />, label: "موعد فائت", iconClass: "bg-error-50 text-error-600" },
  "report-review": { icon: <ClipboardCheck className="h-5 w-5" />, label: "تقرير للمراجعة", iconClass: "bg-secondary-50 text-secondary-600" },
  "incomplete-file": { icon: <FileWarning className="h-5 w-5" />, label: "ملف غير مكتمل", iconClass: "bg-warning-50 text-warning-600" },
  "attendance-change": { icon: <TrendingDown className="h-5 w-5" />, label: "تغير في الحضور", iconClass: "bg-accent-50 text-accent-600" },
  "appointment-change": { icon: <CalendarClock className="h-5 w-5" />, label: "تغيير في موعد", iconClass: "bg-primary-50 text-primary-600" },
  "plan-review": { icon: <ClipboardCheck className="h-5 w-5" />, label: "تذكير مراجعة خطة", iconClass: "bg-secondary-50 text-secondary-600" },
  "patient-followup": { icon: <Users className="h-5 w-5" />, label: "تنبيه متابعة مستفيد", iconClass: "bg-warning-50 text-warning-600" },
  "manager-assignment": { icon: <UserCheck className="h-5 w-5" />, label: "إسناد من المدير", iconClass: "bg-primary-50 text-primary-600" },
  "missing-info": { icon: <FileWarning className="h-5 w-5" />, label: "معلومات ناقصة", iconClass: "bg-warning-50 text-warning-600" },
  "document-reminder": { icon: <FileWarning className="h-5 w-5" />, label: "تذكير مستند", iconClass: "bg-warning-50 text-warning-600" },
  "appointment-request": { icon: <CalendarClock className="h-5 w-5" />, label: "طلب موعد", iconClass: "bg-primary-50 text-primary-600" },
};

export function TherapistNotificationsPage() {
  useDocumentTitle("التنبيهات");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const navigate = useNavigate();
  const { data, markNotificationRead, markAllNotificationsRead } = useDemoData();
  const { showToast } = useToast();

  // Show notifications where targetRole is "doctor" or undefined (general notifications)
  const myNotifications = useMemo(
    () => data.notifications.filter((n) => n.targetRole === "doctor" || n.targetRole === undefined),
    [data.notifications],
  );

  const sorted = useMemo(
    () => [...myNotifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [myNotifications],
  );

  const unreadCount = useMemo(() => myNotifications.filter((n) => !n.read).length, [myNotifications]);

  function handleMarkAllRead() {
    markAllNotificationsRead("doctor");
    showToast("تم تعليم جميع التنبيهات كمقروءة");
  }

  function handleClick(n: typeof sorted[number]) {
    if (!n.read) markNotificationRead(n.id);
    if (n.link) navigate(n.link);
  }

  function handleMarkRead(n: typeof sorted[number]) {
    markNotificationRead(n.id);
    showToast("تم تعليم التنبيه كمقروء");
  }

  return (
    <PageContainer maxWidth="max-w-3xl" className="py-8">
      <PageHeader
        title="التنبيهات"
        subtitle={unreadCount > 0 ? `${unreadCount} تنبيه غير مقروء` : "كل التنبيهات مقروءة"}
        actions={
          <div className="flex items-center gap-2">
            <DemoDataBadge />
            {unreadCount > 0 && (
              <Button variant="secondary" size="sm" onClick={handleMarkAllRead} leftIcon={<CheckCheck className="h-4 w-4" aria-hidden="true" />}>
                تعليم الكل كمقروء
              </Button>
            )}
          </div>
        }
      />
      <h2 ref={headingRef} className="sr-only">قائمة التنبيهات</h2>

      {sorted.length === 0 ? (
        <Card>
          <EmptyState icon={<Bell className="h-12 w-12" aria-hidden="true" />} title="لا توجد تنبيهات" description="لم تصلك أي تنبيهات بعد." />
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((n) => {
            const cfg = typeConfig[n.type] ?? typeConfig["registration"];
            return (
              <Card key={n.id} className={n.read ? "opacity-70" : ""}>
                <div className="flex items-start gap-3">
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${cfg.iconClass}`} aria-hidden="true">
                    {cfg.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-ink">{n.title}</p>
                        {!n.read && <Badge tone="accent">جديد</Badge>}
                      </div>
                      <span className="text-sm text-neutral-500 shrink-0">{formatRelative(n.createdAt)}</span>
                    </div>
                    <p className="text-base text-neutral-600 leading-relaxed">{n.message}</p>
                    <div className="mt-3 flex items-center gap-3">
                      {n.link && (
                        <button
                          type="button"
                          onClick={() => handleClick(n)}
                          className="text-base font-semibold text-primary-700 hover:underline min-h-[48px] inline-flex items-center"
                        >
                          عرض التفاصيل
                        </button>
                      )}
                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(n)}
                          className="text-base font-semibold text-neutral-600 hover:underline min-h-[48px] inline-flex items-center"
                        >
                          تعليم كمقروء
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
