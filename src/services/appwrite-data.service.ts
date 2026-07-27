import { ID, Query, type Models } from "appwrite";

import { appwriteConfig, tablesDB } from "@/lib/appwrite";
import type {
  Appointment,
  DemoData,
  Employee,
  Patient,
  RegistrationRequest,
  RehabSession,
  RequestStatus,
  TreatmentPlan,
} from "@/types/demo";

type Row = Models.Row & Record<string, unknown>;

interface RegistrationRequestInput {
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

const EMPTY_DATA: DemoData = {
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
  version: 1,
};

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function number(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function boolean(value: unknown): boolean {
  return value === true;
}

function dateParts(value: unknown): {
  date: string;
  time: string;
} {
  if (typeof value !== "string" || !value) {
    return {
      date: "",
      time: "",
    };
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    const [date = "", time = ""] = value.split("T");

    return {
      date,
      time: time.slice(0, 5),
    };
  }

  return {
    date: parsed.toISOString().slice(0, 10),
    time: parsed.toISOString().slice(11, 16),
  };
}

function mapPatient(row: Row): Patient {
  const status =
    text(row.status) === "active"
      ? "active"
      : "inactive";

  const gender = text(row.gender);

  return {
    id: row.$id,
    fullName: text(row.fullName),
    fileNumber: text(row.fileNumber),
    username: text(row.username),
    status,
    assignedTherapistId: nullableText(
      row.assignedTherapistId,
    ),
    birthDate: text(row.birthDate).slice(0, 10),
    gender:
      gender === "male" || gender === "female"
        ? gender
        : "",
    phone: nullableText(row.phone) ?? undefined,
    email: nullableText(row.email) ?? undefined,
    caregiverName:
      nullableText(row.caregiverName) ?? undefined,
    caregiverRelation:
      nullableText(row.caregiverRelation) ??
      undefined,
    progress: Math.min(
      100,
      Math.max(0, number(row.progress)),
    ),
    lastSessionDate: nullableText(
      row.lastSessionDate,
    ),
    nextAppointmentDate: nullableText(
      row.nextAppointmentDate,
    ),
    createdAt: row.$createdAt,
  };
}

function mapRequest(
  row: Row,
): RegistrationRequest {
  const rawStatus = text(
    row.requestStatus,
    "pending",
  );

  const validStatuses: RequestStatus[] = [
    "pending",
    "approved",
    "rejected",
    "info-requested",
  ];

  const status = validStatuses.includes(
    rawStatus as RequestStatus,
  )
    ? (rawStatus as RequestStatus)
    : "pending";

  const gender = text(row.gender);

  return {
    id: row.$id,
    fullName: text(row.fullName),
    username: text(row.username),
    birthDate: text(row.birthDate).slice(0, 10),
    gender:
      gender === "male" || gender === "female"
        ? gender
        : "",
    hasCaregiver: boolean(row.hasCaregiver),
    caregiverName: text(row.caregiverName),
    caregiverRelation: text(
      row.caregiverRelation,
    ),
    phone: nullableText(row.phone) ?? undefined,
    email: nullableText(row.email) ?? undefined,
    consent: boolean(row.consent),
    status,
    submittedAt: row.$createdAt,

    // العمودان غير موجودين في Appwrite.
    reviewedAt: null,
    reviewNote: null,
  };
}

function mapEmployee(row: Row): Employee {
  const role = text(row.role);

  const allowedRoles: Employee["role"][] = [
    "doctor",
    "therapist",
    "admin",
    "nurse",
    "coordinator",
  ];

  const employmentStatus =
    text(row.employmentStatus) === "active"
      ? "active"
      : "on-leave";

  return {
    id: row.$id,
    fullName: text(row.fullName),
    role: allowedRoles.includes(
      role as Employee["role"],
    )
      ? (role as Employee["role"])
      : "therapist",
    specialty:
      role === "admin"
        ? "إدارة المركز"
        : "التأهيل والعلاج",
    employmentStatus,
    assignedCaseCount: 0,
    todayAppointmentCount: 0,
    phone: nullableText(row.phone) ?? undefined,
    email: nullableText(row.email) ?? undefined,
    hireDate: text(row.hireDate).slice(0, 10),
  };
}

function mapAppointment(
  row: Row,
): Appointment {
  const { date, time } = dateParts(
    row.scheduledAt,
  );

  const rawStatus = text(
    row.appointmentStatus,
    "scheduled",
  );

  const status: Appointment["status"] =
    rawStatus === "no_show"
      ? "missed"
      : rawStatus === "completed" ||
          rawStatus === "cancelled" ||
          rawStatus === "scheduled"
        ? rawStatus
        : "scheduled";

  return {
    id: row.$id,
    patientId: text(row.patientId),
    employeeId: text(row.employeeId),
    date,
    time,
    durationMin: number(row.durationMinutes),
    type: text(row.appointmentType),
    channel: "in-person",
    status,
    notes:
      nullableText(row.cancellationReason) ??
      nullableText(row.notes) ??
      undefined,
  };
}

function mapSession(row: Row): RehabSession {
  const rawStatus = text(row.sessionStatus);

  const status: RehabSession["status"] =
    rawStatus === "completed"
      ? "completed"
      : "draft";

  return {
    id: row.$id,
    patientId: text(row.patientId),
    employeeId: text(row.employeeId),
    date: text(row.sessionDate).slice(0, 10),
    durationMin: number(row.durationMinutes),
    type: text(row.sessionType),
    notes: text(row.observations),
    attendance:
      rawStatus === "cancelled"
        ? "missed"
        : "attended",
    completedExerciseIds: [],
    goalProgressUpdates: [],
    nextRecommendations: text(
      row.recommendations,
    ),
    followUpDate: null,
    status,
  };
}

function mapPlan(row: Row): TreatmentPlan {
  const objectiveLines = text(row.objectives)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  const status = text(row.planStatus);

  const progressMatch = text(
    row.progressSummary,
  ).match(/(\d{1,3})\s*%/);

  const progress = progressMatch
    ? Math.min(
        100,
        Number.parseInt(progressMatch[1], 10),
      )
    : 0;

  const validStatuses: TreatmentPlan["status"][] =
    [
      "active",
      "completed",
      "paused",
      "draft",
    ];

  return {
    id: row.$id,
    patientId: text(row.patientId),
    employeeId: text(
      row.responsibleEmployeeId,
    ),
    title: text(row.title),
    startDate: text(row.startDate).slice(0, 10),
    endDate:
      nullableText(row.endDate)?.slice(0, 10) ??
      null,
    reviewDate:
      nullableText(row.reviewDate)?.slice(
        0,
        10,
      ) ?? null,
    goals: objectiveLines.map(
      (goal, index) => ({
        id: `${row.$id}-goal-${index + 1}`,
        text: goal,
        progress,
      }),
    ),
    sessionFrequency: `${number(
      row.sessionsPerWeek,
    )} جلسات أسبوعيًا`,
    notes:
      nullableText(row.notes) ??
      nullableText(row.progressSummary) ??
      text(row.interventions),
    progress,
    status: validStatuses.includes(
      status as TreatmentPlan["status"],
    )
      ? (status as TreatmentPlan["status"])
      : "draft",
  };
}

async function listRows(
  tableId: string,
): Promise<Row[]> {
  try {
    const result = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId,
      queries: [Query.limit(1000)],
    });

    return result.rows as Row[];
  } catch {
    return [];
  }
}

export async function loadAppwriteData(): Promise<DemoData> {
  const [
    patients,
    requests,
    employees,
    appointments,
    sessions,
    treatmentPlans,
  ] = await Promise.all([
    listRows(appwriteConfig.tables.patients),
    listRows(
      appwriteConfig.tables.registrationRequests,
    ),
    listRows(appwriteConfig.tables.employees),
    listRows(appwriteConfig.tables.appointments),
    listRows(appwriteConfig.tables.sessions),
    listRows(
      appwriteConfig.tables.treatmentPlans,
    ),
  ]);

  const mappedEmployees =
    employees.map(mapEmployee);

  const mappedAppointments =
    appointments.map(mapAppointment);

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  return {
    ...EMPTY_DATA,

    patients: patients.map(mapPatient),

    requests: requests.map(mapRequest),

    employees: mappedEmployees.map(
      (employee) => ({
        ...employee,

        assignedCaseCount: patients.filter(
          (patient) =>
            text(
              patient.assignedTherapistId,
            ) === employee.id,
        ).length,

        todayAppointmentCount:
          mappedAppointments.filter(
            (appointment) =>
              appointment.employeeId ===
                employee.id &&
              appointment.date === today,
          ).length,
      }),
    ),

    appointments: mappedAppointments,

    sessions: sessions.map(mapSession),

    treatmentPlans:
      treatmentPlans.map(mapPlan),
  };
}

export async function createRegistrationRequest(
  form: RegistrationRequestInput,
): Promise<string> {
  const row = await tablesDB.createRow({
    databaseId: appwriteConfig.databaseId,

    tableId:
      appwriteConfig.tables
        .registrationRequests,

    rowId: ID.unique(),

    data: {
      fullName: form.fullName.trim(),

      username: form.username.trim(),

      birthDate: new Date(
        `${form.birthDate}T00:00:00.000Z`,
      ).toISOString(),

      gender: form.gender || null,

      hasCaregiver: form.hasCaregiver,

      caregiverName: form.hasCaregiver
        ? form.caregiverName.trim()
        : null,

      caregiverRelation: form.hasCaregiver
        ? form.caregiverRelation.trim()
        : null,

      phone: form.phone?.trim() || null,

      email: form.email?.trim() || null,

      consent: form.consent,

      requestStatus: "pending",
    },
  });

  return row.$id;
}

export async function updateRegistrationRequest(
  rowId: string,
  data: Record<string, unknown>,
): Promise<void> {
  /*
   * بعض أجزاء الواجهة ما زالت ترسل
   * reviewedAt و reviewNote.
   * يتم حذفهما قبل إرسال التحديث إلى Appwrite.
   */
  const {
    reviewedAt: _removedReviewedAt,
    reviewNote: _removedReviewNote,
    ...validData
  } = data;

  await tablesDB.updateRow({
    databaseId: appwriteConfig.databaseId,

    tableId:
      appwriteConfig.tables
        .registrationRequests,

    rowId,

    data: validData,
  });
}

function appointmentStatusForAppwrite(
  status: Appointment["status"],
): string {
  return status === "missed"
    ? "no_show"
    : status;
}

function appointmentData(
  appointment: Appointment,
) {
  return {
    patientId: appointment.patientId,

    employeeId: appointment.employeeId,

    scheduledAt: new Date(
      `${appointment.date}T${
        appointment.time || "00:00"
      }:00.000Z`,
    ).toISOString(),

    durationMinutes:
      appointment.durationMin,

    appointmentType: appointment.type,

    appointmentStatus:
      appointmentStatusForAppwrite(
        appointment.status,
      ),

    room: null,

    notes: appointment.notes ?? null,

    cancellationReason:
      appointment.status === "cancelled"
        ? appointment.notes ??
          "أُلغي الموعد"
        : null,
  };
}

export async function createAppointmentRow(
  appointment: Omit<Appointment, "id">,
): Promise<string> {
  const row = await tablesDB.createRow({
    databaseId: appwriteConfig.databaseId,

    tableId:
      appwriteConfig.tables.appointments,

    rowId: ID.unique(),

    data: appointmentData({
      ...appointment,
      id: "",
    }),
  });

  return row.$id;
}

export async function updateAppointmentRow(
  appointment: Appointment,
): Promise<void> {
  await tablesDB.updateRow({
    databaseId: appwriteConfig.databaseId,

    tableId:
      appwriteConfig.tables.appointments,

    rowId: appointment.id,

    data: appointmentData(appointment),
  });
}

export async function createSessionRow(
  session: Omit<RehabSession, "id">,
): Promise<string> {
  const progressValues =
    session.goalProgressUpdates.map(
      (item) => item.newProgress,
    );

  const progressScore =
    progressValues.length > 0
      ? Math.round(
          progressValues.reduce(
            (sum, value) =>
              sum + value,
            0,
          ) / progressValues.length,
        )
      : null;

  const row = await tablesDB.createRow({
    databaseId: appwriteConfig.databaseId,

    tableId:
      appwriteConfig.tables.sessions,

    rowId: ID.unique(),

    data: {
      patientId: session.patientId,

      employeeId: session.employeeId,

      appointmentId: null,

      treatmentPlanId: null,

      sessionDate: new Date(
        `${session.date}T00:00:00.000Z`,
      ).toISOString(),

      durationMinutes:
        session.durationMin,

      sessionType: session.type,

      sessionStatus:
        session.status === "completed"
          ? "completed"
          : "scheduled",

      progressScore,

      objectivesWorkedOn:
        session.completedExerciseIds.join(
          "\n",
        ) || null,

      observations:
        session.notes || null,

      patientResponse:
        session.attendance,

      recommendations:
        session.nextRecommendations || null,
    },
  });

  return row.$id;
}

function sessionsPerWeek(
  value: string,
): number {
  const parsed = Number.parseInt(
    value.match(/\d+/)?.[0] ?? "1",
    10,
  );

  return Math.min(
    7,
    Math.max(1, parsed),
  );
}

function treatmentPlanData(
  plan: Omit<TreatmentPlan, "id">,
) {
  const goals = plan.goals
    .map((goal) => goal.text)
    .filter(Boolean);

  return {
    patientId: plan.patientId,

    responsibleEmployeeId:
      plan.employeeId,

    title: plan.title,

    startDate: new Date(
      `${plan.startDate}T00:00:00.000Z`,
    ).toISOString(),

    endDate: new Date(
      `${
        plan.endDate ??
        plan.reviewDate ??
        plan.startDate
      }T00:00:00.000Z`,
    ).toISOString(),

    planStatus: plan.status,

    sessionsPerWeek: sessionsPerWeek(
      plan.sessionFrequency,
    ),

    sessionDurationMinutes: 60,

    overallGoal:
      goals[0] ?? plan.title,

    objectives: goals.join("\n"),

    interventions:
      plan.notes || null,

    reviewDate: plan.reviewDate
      ? new Date(
          `${plan.reviewDate}T00:00:00.000Z`,
        ).toISOString()
      : null,

    progressSummary:
      plan.progress > 0
        ? `نسبة التقدم الحالية: ${plan.progress}%`
        : null,

    notes: plan.notes || null,
  };
}

export async function createTreatmentPlanRow(
  plan: Omit<TreatmentPlan, "id">,
): Promise<string> {
  const row = await tablesDB.createRow({
    databaseId: appwriteConfig.databaseId,

    tableId:
      appwriteConfig.tables
        .treatmentPlans,

    rowId: ID.unique(),

    data: treatmentPlanData(plan),
  });

  return row.$id;
}

export async function updateTreatmentPlanRow(
  plan: TreatmentPlan,
): Promise<void> {
  await tablesDB.updateRow({
    databaseId: appwriteConfig.databaseId,

    tableId:
      appwriteConfig.tables
        .treatmentPlans,

    rowId: plan.id,

    data: treatmentPlanData(plan),
  });
}