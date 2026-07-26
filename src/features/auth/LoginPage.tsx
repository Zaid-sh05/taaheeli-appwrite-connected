import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useSession, ROLE_HOME } from "@/context/SessionContext";
import { ROLES } from "@/config/roles";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Field } from "@/components/ui/Field";
import { FormErrorSummary } from "@/components/feedback/FormErrorSummary";

interface AppwriteErrorLike {
  type?: string;
  code?: number;
}

function getLoginError(error: unknown): string {
  if (
    error instanceof Error &&
    /[\u0600-\u06FF]/.test(error.message)
  ) {
    return error.message;
  }

  const appwriteError = error as AppwriteErrorLike;

  switch (appwriteError?.type) {
    case "user_invalid_credentials":
      return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

    case "user_blocked":
      return "هذا الحساب محظور. راجع إدارة المركز.";

    case "general_rate_limit_exceeded":
      return "تم إجراء محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.";

    case "row_not_found":
    case "document_not_found":
      return "تم العثور على الحساب، لكن ملف المستخدم غير موجود في جدول Profiles.";

    case "user_unauthorized":
    case "general_unauthorized_scope":
      return "لا توجد صلاحية لقراءة ملف المستخدم. تحقق من صلاحيات جدول Profiles.";

    default:
      return "تعذر تسجيل الدخول. تحقق من البيانات والاتصال ثم حاول مرة أخرى.";
  }
}

export function LoginPage() {
  useDocumentTitle("تسجيل الدخول");

  const navigate = useNavigate();
  const { selectedRole, login, isLoading } = useSession();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const roleMeta = selectedRole ? ROLES[selectedRole] : null;
  const showRegisterLink =
    selectedRole === "patient" || !selectedRole;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (isSubmitting || isLoading) return;

    const validationErrors: string[] = [];
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      validationErrors.push("البريد الإلكتروني مطلوب");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      validationErrors.push("صيغة البريد الإلكتروني غير صحيحة");
    }

    if (!password) {
      validationErrors.push("كلمة المرور مطلوبة");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsSubmitting(true);

    try {
      const authenticatedSession = await login(
        normalizedEmail,
        password,
      );

      navigate(ROLE_HOME[authenticatedSession.role], {
        replace: true,
      });
    } catch (error) {
      setErrors([getLoginError(error)]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer className="py-10">
      <PageHeader
        title="تسجيل الدخول"
        subtitle={
          roleMeta
            ? `دخول بدور: ${roleMeta.label}`
            : "أدخل بياناتك للمتابعة"
        }
      />

      <h2 ref={headingRef} className="sr-only">
        نموذج تسجيل الدخول
      </h2>

      <Card>
        {errors.length > 0 && (
          <FormErrorSummary
            errors={errors}
            className="mb-4"
          />
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-busy={isSubmitting || isLoading}
        >
          <Field
            label="البريد الإلكتروني"
            htmlFor="email"
            required
          >
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.length > 0) setErrors([]);
              }}
              autoComplete="email"
              inputMode="email"
              dir="ltr"
              hasError={errors.some((error) =>
                error.includes("البريد الإلكتروني"),
              )}
              aria-required
            />
          </Field>

          <div className="mb-4">
            <Label htmlFor="password" required>
              كلمة المرور
            </Label>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.length > 0) setErrors([]);
                }}
                autoComplete="current-password"
                dir="ltr"
                hasError={errors.some((error) =>
                  error.includes("كلمة المرور"),
                )}
                className="ps-3 pe-12"
                aria-required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                className="absolute inset-y-0 end-0 inline-flex min-h-[48px] items-center justify-center px-3 text-neutral-600 hover:text-primary-700"
                aria-label={
                  showPassword
                    ? "إخفاء كلمة المرور"
                    : "إظهار كلمة المرور"
                }
              >
                {showPassword ? (
                  <EyeOff
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                ) : (
                  <Eye
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              type="submit"
              fullWidth
              disabled={isSubmitting || isLoading}
              leftIcon={
                <LogIn
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              }
            >
              {isLoading
                ? "جارٍ استعادة الجلسة..."
                : isSubmitting
                  ? "جارٍ تسجيل الدخول..."
                  : "دخول"}
            </Button>

            <div className="flex items-center justify-between text-base">
              <Link
                to="/"
                className="font-semibold text-primary-700 hover:underline"
              >
                تغيير الدور
              </Link>

              {showRegisterLink && (
                <Link
                  to="/register/patient"
                  className="font-semibold text-primary-700 hover:underline"
                >
                  تسجيل مريض جديد
                </Link>
              )}
            </div>
          </div>
        </form>
      </Card>

      <p className="mt-4 text-center text-sm text-neutral-500">
        استخدم البريد الإلكتروني وكلمة المرور المسجلين في نظام المركز.
      </p>
    </PageContainer>
  );
}