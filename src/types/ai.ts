import type { RoleKey } from "@/config/roles";
import type { DemoData } from "@/types/demo";

export type AIAgentKey =
  | "case-summary"
  | "recommendation"
  | "progress-analysis";

export type AIAudience = "doctor" | "manager" | "parent";
export type AIScope = "case" | "center";
export type AIResultStatus = "draft" | "approved" | "rejected";

export type AIEvidenceSource =
  | "patient"
  | "session"
  | "treatment-plan"
  | "appointment"
  | "exercise"
  | "document"
  | "aggregate";

export interface AIEvidence {
  id: string;
  label: string;
  value: string;
  sourceType: AIEvidenceSource;
  sourceId?: string;
  recordedAt?: string;
}

export interface AIRequest {
  agent: AIAgentKey;
  scope: AIScope;
  audience: AIAudience;
  patientId?: string;
}

export interface AIReview {
  decision: "approved" | "rejected";
  reviewedAt: string;
  reviewedBy: string;
  reviewerRole: RoleKey;
  note?: string;
  contentWasEdited: boolean;
}

export interface AIResult {
  id: string;
  patientId: string | null;
  patientName: string | null;
  agent: AIAgentKey;
  scope: AIScope;
  audience: AIAudience;
  title: string;
  content: string;
  evidence: AIEvidence[];
  confidence: number | null;
  status: AIResultStatus;
  limitations: string[];
  requiresHumanReview: true;
  modelVersion: string;
  generatedAt: string;
  generatedBy: string;
  review?: AIReview;
}

export type AIAuditAction =
  | "generated"
  | "approved"
  | "rejected"
  | "companion-response";

export interface AIAuditEvent {
  id: string;
  resultId: string | null;
  action: AIAuditAction;
  actorRole: RoleKey;
  actorName: string;
  createdAt: string;
  details: string;
}

export interface AIProviderInput {
  request: AIRequest;
  data: DemoData;
  actorRole: RoleKey;
  actorName: string;
}

export interface AIProvider {
  readonly id: string;
  readonly version: string;
  generate: (input: AIProviderInput) => Promise<AIResult>;
  companionReply: (message: string) => Promise<AICompanionReply>;
}

export interface AICompanionReply {
  text: string;
  safetyAction: "none" | "refer-to-center" | "emergency";
}

export interface AIPersistedState {
  version: number;
  results: AIResult[];
  auditEvents: AIAuditEvent[];
}
