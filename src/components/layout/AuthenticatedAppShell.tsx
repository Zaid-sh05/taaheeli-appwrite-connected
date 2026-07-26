import { Outlet, useNavigate, Link } from "react-router-dom";
import { SkipLink } from "@/components/ui/SkipLink";
import { TextSizeModeControl } from "@/components/ui/TextSizeModeControl";
import { MainLandmark } from "@/components/layout/MainLandmark";
import { RoleNav } from "./RoleNav";
import { useSession } from "@/context/SessionContext";
import { ROLES } from "@/config/roles";
import { LogOut, CircleUser as UserCircle2 } from "lucide-react";

export function AuthenticatedAppShell() {
  const navigate = useNavigate();
  const { session, logout } = useSession();

  if (!session) {
    return null;
  }

  const roleMeta = ROLES[session.role];

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-neutral-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex items-center justify-between gap-4 py-3">
          <Link to="/" onClick={(e) => e.preventDefault()} className="flex items-center gap-2 shrink-0">
            <img src="/logo.svg" alt="" className="h-9 w-9" />
            <span className="text-xl font-bold text-primary-700">تأهيلي</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <TextSizeModeControl />
            <div className="hidden sm:flex items-center gap-2 text-base text-neutral-700">
              <UserCircle2 className="h-5 w-5" aria-hidden="true" />
              <span className="font-semibold">{roleMeta.label}</span>
              <span className="text-neutral-400">|</span>
              <span className="text-sm text-neutral-500">{session.username}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-base font-semibold text-neutral-600 hover:text-error-700 min-h-[48px] px-2"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      <RoleNav role={session.role} />

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
