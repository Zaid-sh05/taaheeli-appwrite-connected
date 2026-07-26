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
import { Bell, UserPlus, CalendarX, FileWarning, ClipboardCheck, TrendingDown, CheckCheck, CalendarClock, ClipboardList, UserCheck, CircleHelp as HelpCircle, FileText } from "lucide-react";
import type { NotificationType } from "@/types/demo";

const typeConfig: Record<NotificationType, { icon: React.ReactNode; label: string; iconClass: string }> = {
  registration: { icon: <UserPlus className="h-5 w-5" />, label: "تسجيل جديد", iconClass: "bg-primary-50 text-primary-600" },
  "missed-appointment": { icon: <CalendarX className="h-5 w-5" />, label: "موعد فائت", iconClass: "bg-error-50 text-error-600" },
  "report-review": { icon: <ClipboardCheck className="h-5 w-5" />, label: "تقرير للمراجعة", iconClass: "bg-secondary-50 text-secondary-600" },
  "incomplete-file": { icon: <FileWarning className="h-5 w-5" />, label: "ملف غير مكتمل", iconClass: "bg-warning-50 text-warning-600" },
  "attendance-change": { icon: <TrendingDown className="h-5 w-5" />, label: "تغير في الحضور", iconClass: "bg-accent-50 text-accent-600" },
  "appointment-change": { icon: <CalendarClock className="h-5 w-5" />, label: "تغيير موعد", iconClass: "bg-primary-50 text-primary-600" },
  "plan-review": { icon: <ClipboardList className="h-5 w-5" />, label: "مراجعة خطة", iconClass: "bg-secondary-50 text-secondary-600" },
  "patient-followup": { icon: <UserCheck className="h-5 w-5" />, label: "متابعة مريض", iconClass: "bg-warning-50 text-warning-600" },
  "manager-assignment": { icon: <UserPlus className="h-5 w-5" />, label: "تكليف جديد", iconClass: "bg-primary-50 text-primary-600" },
  "missing-info": { icon: <HelpCircle className="h-5 w-5" />, label: "معلومات ناقصة", iconClass: "bg-warning-50 text-warning-600" },
  "document-reminder": { icon: <FileText className="h-5 w-5" />, label: "تذكير مستند", iconClass: "bg-secondary-50 text-secondary-600" },
  "appointment-request": { icon: <CalendarClock className="h-5 w-5" />, label: "طلب موعد", iconClass: "bg-accent-50 text-accent-600" },
};

export function ManagerNotificationsPage() {
  useDocumentTitle("التنبيهات");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const navigate = useNavigate();
  const { data, markNotificationRead, markAllNotificationsRead } = useDemoData();
  const { showToast } = useToast();

  const sorted = useMemo(() =>
    [...data.notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  [data.notifications]);

  const unreadCount = useMemo(() => data.notifications.filter((n) => !n.read).length, [data.notifications]);

  function handleMarkAllRead() {
    markAllNotificationsRead();
    showToast("تم تعليم جميع التنبيهات كمقروءة");
  }

  function handleClick(n: typeof sorted[number]) {
    if (!n.read) markNotificationRead(n.id);
    if (n.link) navigate(n.link);
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
        <Card><EmptyState icon={<Bell className="h-12 w-12" aria-hidden="true" />} title="لا توجد تنبيهات" description="لم تصلك أي تنبيهات بعد." /></Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((n) => {
            const cfg = typeConfig[n.type];
            return (
              <Card key={n.id} className={n.read ? "opacity-70" : ""}>
                <div className="flex items-start gap-3">
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${cfg.iconClass}`}>
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
                        <button type="button" onClick={() => handleClick(n)} className="text-base font-semibold text-primary-700 hover:underline min-h-[48px]">
                          عرض التفاصيل
                        </button>
                      )}
                      {!n.read && !n.link && (
                        <button type="button" onClick={() => markNotificationRead(n.id)} className="text-base font-semibold text-primary-700 hover:underline min-h-[48px]">
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
