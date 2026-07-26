import { useNavigate, useLocation } from "react-router-dom";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROLE_LIST } from "@/config/roles";
import type { RoleKey } from "@/config/roles";
import { useSession } from "@/context/SessionContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";

const accentClasses: Record<string, string> = {
  primary: "border-primary-200 hover:border-primary-500 hover:bg-primary-50",
  secondary: "border-secondary-200 hover:border-secondary-500 hover:bg-secondary-50",
  accent: "border-accent-200 hover:border-accent-500 hover:bg-accent-50",
  success: "border-success-200 hover:border-success-500 hover:bg-success-50",
  warning: "border-warning-200 hover:border-warning-500 hover:bg-warning-50",
};

const iconColor: Record<string, string> = {
  primary: "text-primary-600",
  secondary: "text-secondary-600",
  accent: "text-accent-600",
  success: "text-success-600",
  warning: "text-warning-600",
};

export function RoleSelectionPage() {
  useDocumentTitle("اختيار الدور");
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedRole } = useSession();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();

  const message = (location.state as { message?: string } | null)?.message;

  function selectRole(key: RoleKey) {
    setSelectedRole(key);
    navigate("/login");
  }

  return (
    <PageContainer className="py-10">
      <PageHeader
        title="مرحباً بك في تأهيلي"
        subtitle="اختر دورك للمتابعة. هذا نموذج تجريبي للواجهة فقط."
      />
      <h2 ref={headingRef} className="sr-only">
        اختيار الدور
      </h2>

      {message && (
        <Alert tone="warning" className="mb-6">
          {message}
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {ROLE_LIST.map((role) => {
          const Icon = (Icons as unknown as Record<string, LucideIcon>)[role.icon] ?? Icons.Circle;
          return (
            <button
              key={role.key}
              type="button"
              onClick={() => selectRole(role.key)}
              className={cn(
                "text-start rounded-xl border-2 bg-white p-5 transition-all min-h-[120px]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
                accentClasses[role.accent],
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={cn("inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white", iconColor[role.accent])}>
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <span className="text-lg font-bold text-ink">{role.label}</span>
              </div>
              <p className="text-base text-neutral-600 leading-relaxed">{role.description}</p>
            </button>
          );
        })}
      </div>
    </PageContainer>
  );
}
