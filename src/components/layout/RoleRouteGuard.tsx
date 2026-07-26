import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSession, ROLE_HOME } from "@/context/SessionContext";
import type { RoleKey } from "@/config/roles";

interface RoleRouteGuardProps {
  allowedRole: RoleKey;
  children: ReactNode;
}

export function RoleRouteGuard({
  allowedRole,
  children,
}: RoleRouteGuardProps) {
  const { session, isLoading } = useSession();
  const location = useLocation();

  // انتظر حتى ينتهي Appwrite من فحص الجلسة
  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-lg font-semibold text-neutral-700">
          جارٍ التحقق من الجلسة...
        </p>
      </div>
    );
  }

  // المستخدم غير مسجل: إعادته إلى اختيار الدور
  if (!session?.isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
          message: "يجب تسجيل الدخول للوصول إلى هذه الصفحة",
        }}
      />
    );
  }

  // المستخدم مسجل، لكنه يحاول فتح صفحات دور آخر
  if (session.role !== allowedRole) {
    return <Navigate to={ROLE_HOME[session.role]} replace />;
  }

  return <>{children}</>;
}