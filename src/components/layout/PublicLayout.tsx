import { Outlet, useNavigate } from "react-router-dom";
import { SkipLink } from "@/components/ui/SkipLink";
import { TextSizeModeControl } from "@/components/ui/TextSizeModeControl";
import { useSession } from "@/context/SessionContext";
import { ROLES } from "@/config/roles";
import type { RoleKey } from "@/config/roles";
import { MainLandmark } from "@/components/layout/MainLandmark";
import { UserCog, ArrowLeftRight } from "lucide-react";

export function PublicLayout() {
  const navigate = useNavigate();
  const { selectedRole, clearSelectedRole } = useSession();
  const roleMeta = selectedRole ? ROLES[selectedRole as RoleKey] : null;

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-neutral-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex items-center justify-between gap-4 py-3">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 shrink-0">
            <img src="/logo.svg" alt="" className="h-9 w-9" />
            <span className="text-xl font-bold text-primary-700">تأهيلي</span>
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <TextSizeModeControl />
            {roleMeta && (
              <div className="hidden sm:flex items-center gap-2 text-base text-neutral-700">
                <UserCog className="h-5 w-5" aria-hidden="true" />
                <span className="font-semibold">{roleMeta.label}</span>
              </div>
            )}
            {selectedRole && (
              <button
                type="button"
                onClick={() => {
                  clearSelectedRole();
                  navigate("/");
                }}
                className="inline-flex items-center gap-1.5 text-base font-semibold text-neutral-600 hover:text-primary-700 min-h-[48px] px-2"
              >
                <ArrowLeftRight className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">تغيير الدور</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <MainLandmark>
        <Outlet />
      </MainLandmark>

      <footer className="border-t border-neutral-100 bg-white mt-auto">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 text-center text-sm text-neutral-500">
          <p>تأهيلي — نظام تأهيلي لمراكز تأهيل ذوي الإعاقة وإصابات الدماغ</p>
          <p className="mt-1">نموذج تجريبي للواجهة — جميع البيانات وهمية</p>
        </div>
      </footer>
    </div>
  );
}
