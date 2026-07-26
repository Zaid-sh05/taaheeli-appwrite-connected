import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, CalendarDays, Dumbbell, Sparkles } from "lucide-react";

import { useSession } from "@/context/SessionContext";
import { account, appwriteConfig, tablesDB } from "@/lib/appwrite";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PatientProgressIndicator } from "@/components/manager/PatientProgressIndicator";

interface PatientRow {
  $id: string;
  fullName: string;
  fileNumber: string;
  username: string;
  status: string;
  assignedTherapistId?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  caregiverName?: string | null;
  caregiverRelation?: string | null;
  progress?: number | null;
  lastSessionDate?: string | null;
  nextAppointmentDate?: string | null;
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "تعذر تحميل بيانات المريض من قاعدة البيانات.";
}

export function PatientOverviewPage() {
  useDocumentTitle("صفحتي");

  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { session, isLoading: isSessionLoading, logout } = useSession();

  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPatient() {
      if (isSessionLoading) {
        return;
      }

      if (!session?.userId) {
        if (!cancelled) {
          setPatient(null);
          setErrorMessage("لا توجد جلسة مستخدم نشطة.");
          setIsLoading(false);
        }

        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        /*
         * نتحقق من مستخدم Appwrite الفعلي، ثم نستخدم معرّفه
         * لقراءة صف المريض المطابق من جدول Patients.
         */
        const currentUser = await account.get();

        const patientRow = (await tablesDB.getRow({
          databaseId: appwriteConfig.databaseId,
          tableId: appwriteConfig.tables.patients,
          rowId: currentUser.$id,
        })) as unknown as PatientRow;

        if (patientRow.status !== "active") {
          throw new Error("حساب المريض غير مفعّل.");
        }

        if (!cancelled) {
          setPatient(patientRow);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setPatient(null);
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPatient();

    return () => {
      cancelled = true;
    };
  }, [session?.userId, isSessionLoading]);

  async function handleLogout() {
    await logout();
    window.location.href = "/";
  }

  if (isSessionLoading || isLoading) {
    return (
      <PageContainer maxWidth="max-w-4xl" className="py-8">
        <Card>
          <p className="text-center text-lg text-neutral-700">
            جارٍ تحميل بياناتك من قاعدة البيانات...
          </p>
        </Card>
      </PageContainer>
    );
  }

  if (errorMessage || !patient) {
    return (
      <PageContainer maxWidth="max-w-4xl" className="py-8">
        <PageHeader
          title="تعذر تحميل الصفحة"
          subtitle="لم نتمكن من العثور على سجل المريض."
        />

        <Card>
          <EmptyState
            icon={
              <Activity
                className="h-12 w-12"
                aria-hidden="true"
              />
            }
            title="بيانات المريض غير متاحة"
            description={
              errorMessage ??
              "تأكد من وجود سجل مطابق للحساب داخل جدول Patients."
            }
            action={
              <Button
                variant="secondary"
                onClick={() => void handleLogout()}
              >
                تسجيل الخروج
              </Button>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  const firstName =
    patient.fullName?.trim().split(/\s+/)[0] || patient.username;

  const progress =
    typeof patient.progress === "number" ? patient.progress : 0;

  return (
    <PageContainer maxWidth="max-w-4xl" className="py-8">
      <PageHeader
        title={`أهلاً ${firstName}`}
        subtitle="هذه صفحتك الخاصة لمتابعة رحلة التأهيل"
      />

      <h2 ref={headingRef} className="sr-only">
        لوحة متابعة المريض
      </h2>

      <Card className="mb-6">
        <h3 className="mb-4 text-xl font-bold text-ink">
          معلومات المريض
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-neutral-500">الاسم الكامل</p>
            <p className="text-lg font-semibold text-ink">
              {patient.fullName}
            </p>
          </div>

          <div>
            <p className="text-sm text-neutral-500">رقم الملف</p>
            <p className="text-lg font-semibold text-ink">
              {patient.fileNumber}
            </p>
          </div>

          <div>
            <p className="text-sm text-neutral-500">اسم المستخدم</p>
            <p className="text-lg font-semibold text-ink">
              {patient.username}
            </p>
          </div>

          <div>
            <p className="text-sm text-neutral-500">حالة الحساب</p>
            <p className="text-lg font-semibold text-success-700">
              {patient.status === "active" ? "نشط" : patient.status}
            </p>
          </div>

          {patient.phone && (
            <div>
              <p className="text-sm text-neutral-500">رقم الهاتف</p>
              <p className="text-lg font-semibold text-ink">
                {patient.phone}
              </p>
            </div>
          )}

          {patient.email && (
            <div>
              <p className="text-sm text-neutral-500">
                البريد الإلكتروني
              </p>
              <p className="text-lg font-semibold text-ink">
                {patient.email}
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="mb-6">
        <div className="mb-4 flex items-center gap-3">
          <Sparkles
            className="h-6 w-6 text-primary-600"
            aria-hidden="true"
          />

          <h3 className="text-xl font-bold text-ink">
            تقدمك العلاجي
          </h3>
        </div>

        <PatientProgressIndicator value={progress} />

        {patient.lastSessionDate && (
          <p className="mt-4 text-base text-neutral-600">
            آخر جلسة:{" "}
            {new Date(patient.lastSessionDate).toLocaleDateString(
              "ar-JO",
            )}
          </p>
        )}

        {patient.nextAppointmentDate && (
          <p className="mt-2 text-base text-neutral-600">
            الموعد القادم:{" "}
            {new Date(
              patient.nextAppointmentDate,
            ).toLocaleDateString("ar-JO")}
          </p>
        )}
      </Card>

      <Card className="mb-6">
        <EmptyState
          icon={
            <CalendarDays
              className="h-12 w-12"
              aria-hidden="true"
            />
          }
          title="المواعيد"
          description="ستظهر هنا المواعيد الحقيقية المسجلة لهذا المريض في جدول Appointments."
          action={
            <Link to="/patient/appointments">
              <Button variant="primary">
                الانتقال إلى مواعيدي
              </Button>
            </Link>
          }
        />
      </Card>

      <Card className="mb-6">
        <EmptyState
          icon={
            <Activity
              className="h-12 w-12"
              aria-hidden="true"
            />
          }
          title="الخطة العلاجية"
          description="ستظهر هنا الخطة الحقيقية المسجلة للمريض في جدول TreatmentPlans."
        />
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/patient/exercises">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={
              <Dumbbell
                className="h-6 w-6"
                aria-hidden="true"
              />
            }
          >
            عرض تماريني
          </Button>
        </Link>

        <Link to="/patient/appointments">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={
              <CalendarDays
                className="h-6 w-6"
                aria-hidden="true"
              />
            }
          >
            مواعيدي
          </Button>
        </Link>

        <Link to="/patient/companion">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={
              <Sparkles
                className="h-6 w-6"
                aria-hidden="true"
              />
            }
          >
            المرافق الذكي
          </Button>
        </Link>
      </div>
    </PageContainer>
  );
}