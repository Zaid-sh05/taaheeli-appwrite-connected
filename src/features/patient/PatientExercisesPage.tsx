import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  Dumbbell,
  Play,
  Check,
  Star,
  Repeat,
  ShieldAlert,
  User,
  ArrowRight,
} from "lucide-react";

export function PatientExercisesPage() {
  useDocumentTitle("تماريني");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data, completeExercise } = useDemoData();
  const { session } = useSession();
  const { showToast } = useToast();

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [startedExercises, setStartedExercises] = useState<Record<string, number>>({});

  // Identify the current patient. Fallback to first active patient (p1, محمد العتيبي).
  const patient = useMemo(() => {
    if (session?.username) {
      const match = data.patients.find(
        (p) => p.username === session.username && p.status === "active",
      );
      if (match) return match;
    }
    return data.patients.find((p) => p.status === "active") ?? data.patients[0];
  }, [data.patients, session]);

  // Show ONLY exercises assigned to this patient
  const myExercises = useMemo(
    () => data.exercises.filter((ex) => ex.patientId === patient.id),
    [data.exercises, patient.id],
  );

  const activeExercises = useMemo(
    () => myExercises.filter((ex) => ex.status === "active"),
    [myExercises],
  );

  const completedExercises = useMemo(
    () => myExercises.filter((ex) => ex.status === "completed"),
    [myExercises],
  );

  function handleStart(exerciseId: string) {
    setStartedExercises((prev) => ({ ...prev, [exerciseId]: Date.now() }));
    showToast("تم بدء التمرين — بالتوفيق!");
  }

  function handleComplete(exerciseId: string) {
    const rating = ratings[exerciseId];
    completeExercise(exerciseId, rating || undefined);
    showToast(rating ? `تم إكمال التمرين بتقييم ${rating} من 5` : "تم إكمال التمرين بنجاح");
  }

  function handleRating(exerciseId: string, rating: number) {
    setRatings((prev) => ({ ...prev, [exerciseId]: rating }));
  }

  return (
    <PageContainer maxWidth="max-w-3xl" className="py-8">
      <PageHeader
        title="تماريني"
        subtitle="تمارينك العلاجية المخصصة لك من معالجك"
        actions={<DemoDataBadge />}
      />
      <h2 ref={headingRef} className="sr-only">قائمة التمارين</h2>

      {myExercises.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Dumbbell className="h-12 w-12" aria-hidden="true" />}
            title="لا توجد تمارين مخصصة لك حالياً"
            description="عندما يع assigned لك المعالج تمارين، ستظهر هنا. يمكنك العودة لاحقاً للتحقق."
            action={
              <Link to="/patient">
                <Button variant="primary">العودة للصفحة الرئيسية</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          {/* Active exercises */}
          {activeExercises.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-ink mb-4">تمارين نشطة ({activeExercises.length})</h3>
              <div className="space-y-4">
                {activeExercises.map((exercise) => {
                  const therapist = data.employees.find(
                    (e) => e.id === patient.assignedTherapistId,
                  );
                  const isStarted = !!startedExercises[exercise.id];
                  const currentRating = ratings[exercise.id] ?? 0;
                  return (
                    <Card key={exercise.id}>
                      <div className="flex items-start gap-3 mb-4">
                        <div className="rounded-full bg-primary-100 p-3 shrink-0">
                          <Dumbbell className="h-7 w-7 text-primary-700" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-bold text-ink mb-1">{exercise.title}</p>
                          <p className="text-base text-neutral-600 leading-relaxed">
                            {exercise.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-base text-neutral-700 mb-4">
                        <div className="flex items-center gap-2">
                          <Repeat className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                          <span>التكرار: {exercise.frequency}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                          <span>المعالج: {therapist?.fullName ?? "غير محدد"}</span>
                        </div>
                      </div>

                      {/* Safety note */}
                      <div className="flex items-start gap-2 bg-warning-50 border border-warning-200 rounded-lg p-3 mb-4">
                        <ShieldAlert className="h-5 w-5 text-warning-600 shrink-0 mt-0.5" aria-hidden="true" />
                        <p className="text-base text-warning-800 leading-relaxed">
                          <span className="font-bold">تنبيه أمان: </span>
                          {exercise.safetyNote}
                        </p>
                      </div>

                      {/* Start / Complete buttons */}
                      <div className="flex flex-wrap gap-3">
                        {!isStarted ? (
                          <Button
                            variant="secondary"
                            size="lg"
                            leftIcon={<Play className="h-5 w-5" aria-hidden="true" />}
                            onClick={() => handleStart(exercise.id)}
                          >
                            بدء التمرين
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="primary"
                              size="lg"
                              leftIcon={<Check className="h-5 w-5" aria-hidden="true" />}
                              onClick={() => handleComplete(exercise.id)}
                            >
                              إكمال التمرين
                            </Button>
                            <span className="inline-flex items-center text-base text-success-700 font-semibold px-2">
                              ✓ تم البدء
                            </span>
                          </>
                        )}
                      </div>

                      {/* Rating (shown after started) */}
                      {isStarted && (
                        <div className="mt-4 pt-4 border-t border-neutral-100">
                          <p className="text-base font-semibold text-ink mb-2">
                            كيف كان التمرين؟ (اختياري)
                          </p>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleRating(exercise.id, star)}
                                className="p-2 rounded-lg hover:bg-primary-50 min-h-[48px] min-w-[48px] inline-flex items-center justify-center"
                                aria-label={`تقييم ${star} من 5`}
                              >
                                <Star
                                  className={
                                    "h-7 w-7 transition-colors " +
                                    (star <= currentRating
                                      ? "fill-warning-400 text-warning-400"
                                      : "text-neutral-300")
                                  }
                                  aria-hidden="true"
                                />
                              </button>
                            ))}
                            {currentRating > 0 && (
                              <span className="text-base text-neutral-600 mr-2">
                                {currentRating} من 5
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed exercises */}
          {completedExercises.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-ink mb-4">
                تمارين مكتملة ({completedExercises.length})
              </h3>
              <div className="space-y-4">
                {completedExercises.map((exercise) => {
                  const therapist = data.employees.find(
                    (e) => e.id === patient.assignedTherapistId,
                  );
                  return (
                    <Card key={exercise.id} className="bg-success-50 border-success-200">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-success-100 p-3 shrink-0">
                          <Check className="h-7 w-7 text-success-700" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-lg font-bold text-ink">{exercise.title}</p>
                            <Badge tone="success">مكتمل</Badge>
                          </div>
                          <p className="text-base text-neutral-600 leading-relaxed mb-2">
                            {exercise.description}
                          </p>
                          <div className="flex items-center gap-2 text-base text-neutral-700">
                            <User className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                            <span>المعالج: {therapist?.fullName ?? "غير محدد"}</span>
                          </div>
                          {exercise.difficultyRating && (
                            <div className="flex items-center gap-1 mt-2">
                              <span className="text-base text-neutral-600">تقييمك: </span>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={
                                    "h-5 w-5 " +
                                    (star <= exercise.difficultyRating!
                                      ? "fill-warning-400 text-warning-400"
                                      : "text-neutral-300")
                                  }
                                  aria-hidden="true"
                                />
                              ))}
                              <span className="text-base text-neutral-600 mr-1">
                                {exercise.difficultyRating} من 5
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Back to overview */}
          <div className="mt-8">
            <Link to="/patient">
              <Button
                variant="ghost"
                size="lg"
                leftIcon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}
              >
                العودة للصفحة الرئيسية
              </Button>
            </Link>
          </div>
        </>
      )}
    </PageContainer>
  );
}
