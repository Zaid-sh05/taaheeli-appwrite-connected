import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  DemoData,
  RegistrationRequest,
  RequestStatus,
  AppNotification,
  Appointment,
  RehabSession,
  TreatmentPlan,
  PlanGoal,
  Exercise,
  DemoDocument,
  ChatMessage,
  CompanionMessage,
  NotificationType,
  RoleKey,
} from "@/types/demo";
import { useSession } from "@/context/SessionContext";
import {
  createAppointmentRow,
  createRegistrationRequest,
  createSessionRow,
  createTreatmentPlanRow,
  loadAppwriteData,
  updateAppointmentRow,
  updateRegistrationRequest,
  updateTreatmentPlanRow,
} from "@/services/appwrite-data.service";

const DATA_VERSION = 1;

interface AddRequestForm {
  fullName: string;
  username: string;
  birthDate: string;
  gender: "male" | "female" | "";
  hasCaregiver: boolean;
  caregiverName: string;
  caregiverRelation: string;
  phone?: string;
  email?: string;
  consent: boolean;
}

interface NewAppointmentForm {
  patientId: string;
  employeeId: string;
  date: string;
  time: string;
  durationMin: number;
  type: string;
  channel: "in-person" | "video";
  notes?: string;
}

interface NewSessionForm {
  patientId: string;
  employeeId: string;
  date: string;
  durationMin: number;
  type: string;
  attendance: "attended" | "missed" | "late";
  notes: string;
  completedExerciseIds: string[];
  goalProgressUpdates: { goalId: string; newProgress: number }[];
  nextRecommendations: string;
  followUpDate: string | null;
  status: "draft" | "completed";
}

interface NewPlanForm {
  patientId: string;
  employeeId: string;
  title: string;
  startDate: string;
  endDate: string | null;
  reviewDate: string | null;
  goals: { text: string }[];
  sessionFrequency: string;
  notes: string;
  status: "active" | "completed" | "paused" | "draft";
}

interface NewDocumentForm {
  patientId: string;
  title: string;
  category: DemoDocument["category"];
  notes: string;
}

interface DemoDataContextValue {
  data: DemoData;
  isLoading: boolean;
  dataError: string | null;
  refreshData: () => Promise<void>;
  addRequest: (form: AddRequestForm) => Promise<string>;
  approveRequest: (id: string) => Promise<void>;
  rejectRequest: (id: string, note?: string) => Promise<void>;
  requestInfo: (id: string, note?: string) => Promise<void>;
  forwardToManager: (id: string) => Promise<void>;
  updateRequestContact: (id: string, patch: { phone?: string; email?: string }) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (targetRole?: RoleKey) => void;
  resetDemoData: () => void;
  addAppointment: (form: NewAppointmentForm) => Promise<string>;
  updateAppointment: (id: string, patch: Partial<Appointment>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  confirmAttendance: (id: string) => Promise<void>;
  markNoShow: (id: string) => Promise<void>;
  addSession: (form: NewSessionForm) => Promise<string>;
  addPlan: (form: NewPlanForm) => Promise<string>;
  updatePlan: (id: string, patch: Partial<TreatmentPlan>) => Promise<void>;
  addPlanGoal: (planId: string, text: string) => Promise<void>;
  updatePlanGoal: (planId: string, goalId: string, progress: number) => Promise<void>;
  changePlanStatus: (planId: string, status: TreatmentPlan["status"]) => Promise<void>;
  addExercise: (exercise: Omit<Exercise, "id" | "status">) => void;
  completeExercise: (id: string, difficultyRating?: number) => void;
  addDocument: (form: NewDocumentForm) => void;
  updateDocument: (id: string, patch: Partial<DemoDocument>) => void;
  sendMessage: (conversationId: string, sender: ChatMessage["sender"], text: string) => void;
  sendCompanionMessage: (text: string, sender: "user" | "companion") => void;
  addNotification: (n: { type: NotificationType; title: string; message: string; link?: string; targetRole?: RoleKey }) => void;
}

const DemoDataContext = createContext<DemoDataContextValue | undefined>(undefined);

function loadData(): DemoData {
  return {
    patients: [],
    requests: [],
    employees: [],
    appointments: [],
    treatmentPlans: [],
    sessions: [],
    exercises: [],
    notifications: [],
    documents: [],
    conversations: [],
    companionMessages: [],
    version: DATA_VERSION,
  };
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const { session, isLoading: isSessionLoading } = useSession();
  const [data, setData] = useState<DemoData>(() => loadData());
  const [isLoading, setIsLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    if (!session) {
      setData(loadData());
      setDataError(null);
      return;
    }

    setIsLoading(true);
    setDataError(null);

    try {
      setData(await loadAppwriteData());
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "تعذر تحميل البيانات من Appwrite.";
      setDataError(message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!isSessionLoading) {
      void refreshData();
    }
  }, [isSessionLoading, refreshData]);

  const addNotification = useCallback<DemoDataContextValue["addNotification"]>((n) => {
    const notif: AppNotification = {
      id: genId("n"),
      type: n.type,
      title: n.title,
      message: n.message,
      createdAt: new Date().toISOString(),
      read: false,
      link: n.link,
      targetRole: n.targetRole,
    };
    setData((prev) => ({ ...prev, notifications: [notif, ...prev.notifications] }));
  }, []);

  const addRequest = useCallback<DemoDataContextValue["addRequest"]>(async (form) => {
    const id = await createRegistrationRequest({
      ...form,
    });
    const now = new Date().toISOString();
    const request: RegistrationRequest = {
      id,
      fullName: form.fullName,
      username: form.username,
      birthDate: form.birthDate,
      gender: form.gender,
      hasCaregiver: form.hasCaregiver,
      caregiverName: form.caregiverName,
      caregiverRelation: form.caregiverRelation,
      phone: form.phone,
      email: form.email,
      consent: form.consent,
      status: "pending",
      submittedAt: now,
      reviewedAt: null,
      reviewNote: null,
    };
    const notification: AppNotification = {
      id: genId("n"),
      type: "registration",
      title: "طلب تسجيل جديد",
      message: `وصل طلب تسجيل جديد من ${form.fullName}`,
      createdAt: now,
      read: false,
      link: `/manager/requests/${id}`,
      targetRole: "manager",
    };
    const adminNotif: AppNotification = {
      id: genId("n"),
      type: "registration",
      title: "تسجيل جديد",
      message: `طلب تسجيل جديد من ${form.fullName} بحاجة لمراجعة البيانات`,
      createdAt: now,
      read: false,
      link: "/admin/registrations",
      targetRole: "admin",
    };
    setData((prev) => ({
      ...prev,
      requests: [request, ...prev.requests],
      notifications: [notification, adminNotif, ...prev.notifications],
    }));
    return id;
  }, []);

  const approveRequest = useCallback(async (id: string) => {
    const reviewedAt = new Date().toISOString();
    const reviewNote =
      "تمت الموافقة على الطلب. إنشاء حساب Auth والمريض يتم عبر إجراء الخادم الآمن.";
    await updateRegistrationRequest(id, {
      requestStatus: "approved",
      reviewedAt,
      reviewNote,
    });
    setData((prev) => ({
      ...prev,
      requests: prev.requests.map((request) =>
        request.id === id
          ? {
              ...request,
              status: "approved" as RequestStatus,
              reviewedAt,
              reviewNote,
            }
          : request,
      ),
    }));
  }, []);

  const rejectRequest = useCallback(async (id: string, note?: string) => {
    const reviewedAt = new Date().toISOString();
    const reviewNote = note ?? "تم رفض الطلب";
    await updateRegistrationRequest(id, {
      requestStatus: "rejected",
      reviewedAt,
      reviewNote,
    });
    setData((prev) => ({
      ...prev,
      requests: prev.requests.map((r) =>
        r.id === id
          ? { ...r, status: "rejected" as RequestStatus, reviewedAt, reviewNote }
          : r,
      ),
    }));
  }, []);

  const requestInfo = useCallback(async (id: string, note?: string) => {
    const reviewedAt = new Date().toISOString();
    const reviewNote = note ?? "يرجى استكمال المعلومات";
    await updateRegistrationRequest(id, {
      requestStatus: "info-requested",
      reviewedAt,
      reviewNote,
    });
    setData((prev) => ({
      ...prev,
      requests: prev.requests.map((r) =>
        r.id === id
          ? { ...r, status: "info-requested" as RequestStatus, reviewedAt, reviewNote }
          : r,
      ),
    }));
  }, []);

  const forwardToManager = useCallback(async (id: string) => {
    const reviewNote = "تم التحويل لمدير المركز للمراجعة";
    await updateRegistrationRequest(id, { reviewNote });
    setData((prev) => ({
      ...prev,
      requests: prev.requests.map((r) =>
        r.id === id ? { ...r, reviewNote } : r,
      ),
      notifications: [{
        id: genId("n"),
        type: "registration",
        title: "طلب محوّل للمراجعة",
        message: `تم تحويل طلب ${prev.requests.find((r) => r.id === id)?.fullName ?? ""} من الموظف الإداري`,
        createdAt: new Date().toISOString(),
        read: false,
        link: `/manager/requests/${id}`,
        targetRole: "manager",
      }, ...prev.notifications],
    }));
  }, []);

  const updateRequestContact = useCallback(async (id: string, patch: { phone?: string; email?: string }) => {
    await updateRegistrationRequest(id, {
      phone: patch.phone ?? null,
      email: patch.email ?? null,
    });
    setData((prev) => ({
      ...prev,
      requests: prev.requests.map((r) => r.id === id ? { ...r, ...patch } : r),
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback((targetRole?: RoleKey) => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        !targetRole || n.targetRole === targetRole ? { ...n, read: true } : n,
      ),
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    void refreshData();
  }, [refreshData]);

  const addAppointment = useCallback<DemoDataContextValue["addAppointment"]>(async (form) => {
    const appointmentWithoutId: Omit<Appointment, "id"> = {
      patientId: form.patientId,
      employeeId: form.employeeId,
      date: form.date,
      time: form.time,
      durationMin: form.durationMin,
      type: form.type,
      channel: form.channel,
      status: "scheduled",
      notes: form.notes,
    };
    const id = await createAppointmentRow(appointmentWithoutId);
    const appt: Appointment = { ...appointmentWithoutId, id };
    setData((prev) => ({
      ...prev,
      appointments: [...prev.appointments, appt],
      patients: prev.patients.map((p) =>
        p.id === form.patientId ? { ...p, nextAppointmentDate: form.date } : p,
      ),
    }));
    return id;
  }, []);

  const updateAppointment = useCallback(async (id: string, patch: Partial<Appointment>) => {
    const current = data.appointments.find((appointment) => appointment.id === id);
    if (!current) return;
    const updated = { ...current, ...patch };
    await updateAppointmentRow(updated);
    setData((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) => (a.id === id ? updated : a)),
    }));
  }, [data.appointments]);

  const cancelAppointment = useCallback(async (id: string) => {
    await updateAppointment(id, { status: "cancelled" });
  }, [updateAppointment]);

  const confirmAttendance = useCallback(async (id: string) => {
    await updateAppointment(id, { status: "completed" });
  }, [updateAppointment]);

  const markNoShow = useCallback(async (id: string) => {
    await updateAppointment(id, { status: "missed" });
  }, [updateAppointment]);

  const addSession = useCallback<DemoDataContextValue["addSession"]>(async (form) => {
    const sessionWithoutId: Omit<RehabSession, "id"> = {
      patientId: form.patientId,
      employeeId: form.employeeId,
      date: form.date,
      durationMin: form.durationMin,
      type: form.type,
      notes: form.notes,
      attendance: form.attendance,
      completedExerciseIds: form.completedExerciseIds,
      goalProgressUpdates: form.goalProgressUpdates,
      nextRecommendations: form.nextRecommendations,
      followUpDate: form.followUpDate,
      status: form.status,
    };
    const id = await createSessionRow(sessionWithoutId);
    const session: RehabSession = { ...sessionWithoutId, id };

    setData((prev) => {
      const newPatients = prev.patients.map((p) => {
        if (p.id !== form.patientId) return p;
        if (form.status !== "completed") return p;
        let newProgress = p.progress;
        if (form.goalProgressUpdates.length > 0) {
          const plans = prev.treatmentPlans.filter((tp) => tp.patientId === form.patientId);
          if (plans.length > 0) {
            const allGoals = plans.flatMap((tp) => tp.goals);
            const totalProgress = allGoals.reduce((sum, g) => {
              const update = form.goalProgressUpdates.find((u) => u.goalId === g.id);
              return sum + (update ? update.newProgress : g.progress);
            }, 0);
            newProgress = allGoals.length > 0 ? Math.round(totalProgress / allGoals.length) : p.progress;
          }
        }
        return {
          ...p,
          progress: Math.min(100, newProgress),
          lastSessionDate: form.date,
        };
      });

      const newPlans = form.status === "completed"
        ? prev.treatmentPlans.map((tp) => {
            if (tp.patientId !== form.patientId) return tp;
            const updatedGoals = tp.goals.map((g) => {
              const update = form.goalProgressUpdates.find((u) => u.goalId === g.id);
              return update ? { ...g, progress: Math.min(100, update.newProgress) } : g;
            });
            const avgProgress = updatedGoals.length > 0
              ? Math.round(updatedGoals.reduce((s, g) => s + g.progress, 0) / updatedGoals.length)
              : tp.progress;
            return { ...tp, goals: updatedGoals, progress: avgProgress };
          })
        : prev.treatmentPlans;

      return {
        ...prev,
        sessions: [session, ...prev.sessions],
        patients: newPatients,
        treatmentPlans: newPlans,
      };
    });

    return id;
  }, []);

  const addPlan = useCallback<DemoDataContextValue["addPlan"]>(async (form) => {
    const goals: PlanGoal[] = form.goals.map((g, i) => ({ id: genId(`tp${i}g`), text: g.text, progress: 0 }));
    const planWithoutId: Omit<TreatmentPlan, "id"> = {
      patientId: form.patientId,
      employeeId: form.employeeId,
      title: form.title,
      startDate: form.startDate,
      endDate: form.endDate,
      reviewDate: form.reviewDate,
      goals,
      sessionFrequency: form.sessionFrequency,
      notes: form.notes,
      progress: 0,
      status: form.status,
    };
    const id = await createTreatmentPlanRow(planWithoutId);
    const plan: TreatmentPlan = { ...planWithoutId, id };
    setData((prev) => ({ ...prev, treatmentPlans: [...prev.treatmentPlans, plan] }));
    return id;
  }, []);

  const updatePlan = useCallback(async (id: string, patch: Partial<TreatmentPlan>) => {
    const current = data.treatmentPlans.find((plan) => plan.id === id);
    if (!current) return;
    const updated = { ...current, ...patch };
    await updateTreatmentPlanRow(updated);
    setData((prev) => ({
      ...prev,
      treatmentPlans: prev.treatmentPlans.map((tp) => (tp.id === id ? updated : tp)),
    }));
  }, [data.treatmentPlans]);

  const addPlanGoal = useCallback(async (planId: string, text: string) => {
    const newGoal: PlanGoal = { id: genId("g"), text, progress: 0 };
    const current = data.treatmentPlans.find((plan) => plan.id === planId);
    if (!current) return;
    await updatePlan(planId, { goals: [...current.goals, newGoal] });
  }, [data.treatmentPlans, updatePlan]);

  const updatePlanGoal = useCallback(async (planId: string, goalId: string, progress: number) => {
    const current = data.treatmentPlans.find((plan) => plan.id === planId);
    if (!current) return;
    const goals = current.goals.map((goal) =>
      goal.id === goalId
        ? {
            ...goal,
            progress: Math.min(100, Math.max(0, progress)),
          }
        : goal,
    );
    const average =
      goals.length > 0
        ? Math.round(
            goals.reduce((sum, goal) => sum + goal.progress, 0) /
              goals.length,
          )
        : 0;
    await updatePlan(planId, { goals, progress: average });
  }, [data.treatmentPlans, updatePlan]);

  const changePlanStatus = useCallback(async (planId: string, status: TreatmentPlan["status"]) => {
    await updatePlan(planId, { status });
  }, [updatePlan]);

  const addExercise = useCallback<DemoDataContextValue["addExercise"]>((exercise) => {
    const ex: Exercise = { ...exercise, id: genId("ex"), status: "active" };
    setData((prev) => ({ ...prev, exercises: [...prev.exercises, ex] }));
  }, []);

  const completeExercise = useCallback((id: string, difficultyRating?: number) => {
    setData((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === id ? { ...ex, status: "completed", difficultyRating } : ex,
      ),
    }));
  }, []);

  const addDocument = useCallback<DemoDataContextValue["addDocument"]>((form) => {
    const doc: DemoDocument = {
      id: genId("d"),
      patientId: form.patientId,
      title: form.title,
      category: form.category,
      status: "received",
      uploadedAt: new Date().toISOString(),
      notes: form.notes,
    };
    setData((prev) => ({ ...prev, documents: [...prev.documents, doc] }));
  }, []);

  const updateDocument = useCallback((id: string, patch: Partial<DemoDocument>) => {
    setData((prev) => ({
      ...prev,
      documents: prev.documents.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));
  }, []);

  const sendMessage = useCallback((conversationId: string, sender: ChatMessage["sender"], text: string) => {
    const msg: ChatMessage = { id: genId("m"), sender, text, timestamp: new Date().toISOString() };
    setData((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) =>
        c.id === conversationId ? { ...c, messages: [...c.messages, msg] } : c,
      ),
    }));
  }, []);

  const sendCompanionMessage = useCallback((text: string, sender: "user" | "companion") => {
    const msg: CompanionMessage = { id: genId("cm"), sender, text, timestamp: new Date().toISOString() };
    setData((prev) => ({ ...prev, companionMessages: [...prev.companionMessages, msg] }));
  }, []);

  const value = useMemo<DemoDataContextValue>(
    () => ({
      data,
      isLoading,
      dataError,
      refreshData,
      addRequest,
      approveRequest,
      rejectRequest,
      requestInfo,
      forwardToManager,
      updateRequestContact,
      markNotificationRead,
      markAllNotificationsRead,
      resetDemoData,
      addAppointment,
      updateAppointment,
      cancelAppointment,
      confirmAttendance,
      markNoShow,
      addSession,
      addPlan,
      updatePlan,
      addPlanGoal,
      updatePlanGoal,
      changePlanStatus,
      addExercise,
      completeExercise,
      addDocument,
      updateDocument,
      sendMessage,
      sendCompanionMessage,
      addNotification,
    }),
    [data, isLoading, dataError, refreshData, addRequest, approveRequest, rejectRequest, requestInfo, forwardToManager, updateRequestContact, markNotificationRead, markAllNotificationsRead, resetDemoData, addAppointment, updateAppointment, cancelAppointment, confirmAttendance, markNoShow, addSession, addPlan, updatePlan, addPlanGoal, updatePlanGoal, changePlanStatus, addExercise, completeExercise, addDocument, updateDocument, sendMessage, sendCompanionMessage, addNotification],
  );

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData(): DemoDataContextValue {
  const ctx = useContext(DemoDataContext);
  if (!ctx) throw new Error("useDemoData must be used within DemoDataProvider");
  return ctx;
}
