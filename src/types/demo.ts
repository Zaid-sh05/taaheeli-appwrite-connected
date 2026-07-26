export type ID = string;

export type RoleKey = "manager" | "doctor" | "admin" | "parent" | "patient";

export type RequestStatus = "pending" | "approved" | "rejected" | "info-requested";

export interface Patient {
  id: ID;
  fullName: string;
  fileNumber: string;
  username: string;
  status: "active" | "inactive";
  assignedTherapistId: ID | null;
  birthDate: string;
  gender: "male" | "female" | "";
  phone?: string;
  email?: string;
  caregiverName?: string;
  caregiverRelation?: string;
  progress: number;
  lastSessionDate: string | null;
  nextAppointmentDate: string | null;
  createdAt: string;
}

export interface RegistrationRequest {
  id: ID;
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
  status: RequestStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export type EmployeeRole = "doctor" | "therapist" | "admin" | "nurse" | "coordinator";

export interface Employee {
  id: ID;
  fullName: string;
  role: EmployeeRole;
  specialty: string;
  employmentStatus: "active" | "on-leave";
  assignedCaseCount: number;
  todayAppointmentCount: number;
  phone?: string;
  email?: string;
  hireDate: string;
}

export type AppointmentChannel = "in-person" | "video";

export interface Appointment {
  id: ID;
  patientId: ID;
  employeeId: ID;
  date: string;
  time: string;
  durationMin: number;
  type: string;
  channel: AppointmentChannel;
  status: "scheduled" | "completed" | "missed" | "cancelled";
  notes?: string;
}

export type PlanStatus = "active" | "completed" | "paused" | "draft";

export interface PlanGoal {
  id: ID;
  text: string;
  progress: number;
}

export interface TreatmentPlan {
  id: ID;
  patientId: ID;
  employeeId: ID;
  title: string;
  startDate: string;
  endDate: string | null;
  reviewDate: string | null;
  goals: PlanGoal[];
  sessionFrequency: string;
  notes: string;
  progress: number;
  status: PlanStatus;
}

export interface RehabSession {
  id: ID;
  patientId: ID;
  employeeId: ID;
  date: string;
  durationMin: number;
  type: string;
  notes: string;
  attendance: "attended" | "missed" | "late";
  completedExerciseIds: ID[];
  goalProgressUpdates: { goalId: ID; newProgress: number }[];
  nextRecommendations: string;
  followUpDate: string | null;
  status: "draft" | "completed";
}

export interface Exercise {
  id: ID;
  patientId: ID;
  title: string;
  description: string;
  frequency: string;
  safetyNote: string;
  status: "active" | "completed";
  difficultyRating?: number;
}

export type NotificationType =
  | "registration"
  | "missed-appointment"
  | "report-review"
  | "incomplete-file"
  | "attendance-change"
  | "appointment-change"
  | "plan-review"
  | "patient-followup"
  | "manager-assignment"
  | "missing-info"
  | "document-reminder"
  | "appointment-request";

export interface AppNotification {
  id: ID;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
  targetRole?: RoleKey;
}

export type DocumentCategory = "identity" | "consent" | "medical-report" | "referral" | "administrative";
export type DocumentStatus = "missing" | "received" | "reviewed";

export interface DemoDocument {
  id: ID;
  patientId: ID;
  title: string;
  category: DocumentCategory;
  status: DocumentStatus;
  uploadedAt: string | null;
  notes: string;
}

export interface ChatMessage {
  id: ID;
  sender: "therapist" | "family" | "patient" | "system";
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: ID;
  patientId: ID;
  messages: ChatMessage[];
}

export interface CompanionMessage {
  id: ID;
  sender: "user" | "companion";
  text: string;
  timestamp: string;
}

export interface DemoData {
  patients: Patient[];
  requests: RegistrationRequest[];
  employees: Employee[];
  appointments: Appointment[];
  treatmentPlans: TreatmentPlan[];
  sessions: RehabSession[];
  exercises: Exercise[];
  notifications: AppNotification[];
  documents: DemoDocument[];
  conversations: Conversation[];
  companionMessages: CompanionMessage[];
  version: number;
}
