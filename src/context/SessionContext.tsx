import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { RoleKey } from "@/config/roles";
import { account, appwriteConfig, tablesDB } from "@/lib/appwrite";

const SELECTED_ROLE_KEY = "taaheeli-selected-role";
const LEGACY_SESSION_KEY = "taaheeli-session";

const VALID_ROLES = new Set<RoleKey>([
  "manager",
  "doctor",
  "admin",
  "parent",
  "patient",
]);

interface ProfileRow {
  $id: string;
  fullName?: string;
  username?: string;
  email?: string;
  role?: unknown;
  isActive?: boolean;
}

interface AppwriteErrorLike {
  type?: unknown;
}

export interface SessionInfo {
  userId: string;
  role: RoleKey;
  username: string;
  fullName: string;
  email: string;
  isAuthenticated: true;
}

interface SessionContextValue {
  selectedRole: RoleKey | null;
  setSelectedRole: (role: RoleKey) => void;
  clearSelectedRole: () => void;
  session: SessionInfo | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<SessionInfo>;
  logout: () => Promise<void>;
}

const SessionContext =
  createContext<SessionContextValue | undefined>(undefined);

function isRoleKey(value: unknown): value is RoleKey {
  return (
    typeof value === "string" &&
    VALID_ROLES.has(value as RoleKey)
  );
}

function getAppwriteErrorType(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return "";
  }

  const appwriteError = error as AppwriteErrorLike;

  return typeof appwriteError.type === "string"
    ? appwriteError.type
    : "";
}

async function readSessionInfo(
  userId: string,
  accountEmail: string,
  expectedRole?: RoleKey,
): Promise<SessionInfo> {
  const profile = (await tablesDB.getRow({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.tables.profiles,
    rowId: userId,
  })) as unknown as ProfileRow;

  if (!isRoleKey(profile.role)) {
    throw new Error("دور المستخدم داخل جدول Profiles غير صحيح.");
  }

  if (profile.isActive !== true) {
    throw new Error("هذا الحساب غير مفعّل. راجع إدارة المركز.");
  }

  if (expectedRole && profile.role !== expectedRole) {
    throw new Error(
      "هذا الحساب مسجل بدور مختلف عن الواجهة التي اخترتها.",
    );
  }

  const username =
    profile.username?.trim() ||
    profile.fullName?.trim() ||
    accountEmail.split("@")[0];

  return {
    userId,
    role: profile.role,
    username,
    fullName: profile.fullName?.trim() || username,
    email: accountEmail,
    isAuthenticated: true,
  };
}

export function SessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedRole, setSelectedRoleState] =
    useState<RoleKey | null>(() => {
      try {
        const storedRole =
          sessionStorage.getItem(SELECTED_ROLE_KEY);

        return isRoleKey(storedRole) ? storedRole : null;
      } catch {
        return null;
      }
    });

  const [session, setSession] =
    useState<SessionInfo | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const setSelectedRole = useCallback((role: RoleKey) => {
    setSelectedRoleState(role);

    try {
      sessionStorage.setItem(SELECTED_ROLE_KEY, role);
    } catch {
      // تجاهل أخطاء التخزين في المتصفح
    }
  }, []);

  const clearSelectedRole = useCallback(() => {
    setSelectedRoleState(null);

    try {
      sessionStorage.removeItem(SELECTED_ROLE_KEY);
    } catch {
      // تجاهل أخطاء التخزين في المتصفح
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let authenticatedUserFound = false;

    async function restoreSession() {
      try {
        const user = await account.get();
        authenticatedUserFound = true;

        const restoredSession = await readSessionInfo(
          user.$id,
          user.email,
        );

        if (!cancelled) {
          setSession(restoredSession);
          setSelectedRole(restoredSession.role);
        }
      } catch {
        if (!cancelled) {
          setSession(null);
        }

        /*
         * إذا وُجد مستخدم مسجل، لكن تعذر قراءة ملفه من Profiles،
         * نحذف الجلسة غير الصالحة حتى يستطيع تسجيل الدخول مجددًا.
         */
        if (authenticatedUserFound) {
          try {
            await account.deleteSession({
              sessionId: "current",
            });
          } catch {
            // تجاهل الخطأ إذا كانت الجلسة منتهية أصلًا
          }
        }
      } finally {
        try {
          sessionStorage.removeItem(LEGACY_SESSION_KEY);
        } catch {
          // تجاهل أخطاء التخزين في المتصفح
        }

        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [setSelectedRole]);

  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<SessionInfo> => {
      let appwriteSessionCreated = false;

      try {
        try {
          await account.createEmailPasswordSession({
            email: email.trim(),
            password,
          });

          appwriteSessionCreated = true;
        } catch (error: unknown) {
          const errorType = getAppwriteErrorType(error);

          /*
           * إذا كانت هناك جلسة قديمة، نحذفها ثم ننشئ
           * جلسة جديدة بالحساب الذي أدخله المستخدم.
           */
          if (errorType !== "user_session_already_exists") {
            throw error;
          }

          await account.deleteSession({
            sessionId: "current",
          });

          await account.createEmailPasswordSession({
            email: email.trim(),
            password,
          });

          appwriteSessionCreated = true;
        }

        const user = await account.get();

        const newSession = await readSessionInfo(
          user.$id,
          user.email,
          selectedRole ?? undefined,
        );

        setSession(newSession);
        setSelectedRole(newSession.role);

        return newSession;
      } catch (error) {
        /*
         * إذا أُنشئت الجلسة ثم فشلت قراءة Profiles
         * أو كان الدور غير مطابق، نحذف الجلسة غير المكتملة.
         */
        if (appwriteSessionCreated) {
          try {
            await account.deleteSession({
              sessionId: "current",
            });
          } catch {
            // تجاهل خطأ حذف جلسة غير مكتملة
          }
        }

        setSession(null);
        throw error;
      }
    },
    [selectedRole, setSelectedRole],
  );

  const logout = useCallback(async () => {
    try {
      await account.deleteSession({
        sessionId: "current",
      });
    } catch (error: unknown) {
      const errorType = getAppwriteErrorType(error);

      if (
        errorType !== "user_session_not_found" &&
        errorType !== "general_unauthorized_scope"
      ) {
        throw error;
      }
    } finally {
      setSession(null);
      clearSelectedRole();
    }
  }, [clearSelectedRole]);

  const value = useMemo<SessionContextValue>(
    () => ({
      selectedRole,
      setSelectedRole,
      clearSelectedRole,
      session,
      isLoading,
      login,
      logout,
    }),
    [
      selectedRole,
      setSelectedRole,
      clearSelectedRole,
      session,
      isLoading,
      login,
      logout,
    ],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);

  if (!ctx) {
    throw new Error(
      "useSession must be used within SessionProvider",
    );
  }

  return ctx;
}

export const ROLE_HOME: Record<RoleKey, string> = {
  manager: "/manager",
  doctor: "/therapist",
  admin: "/admin",
  parent: "/family",
  patient: "/patient",
};