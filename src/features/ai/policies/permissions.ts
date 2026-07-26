import type { RoleKey } from "@/config/roles";
import type { AIRequest, AIResult } from "@/types/ai";

export class AIPermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIPermissionError";
  }
}

export function assertCanGenerate(role: RoleKey, request: AIRequest): void {
  if (role === "doctor") {
    if (request.scope !== "case" || !request.patientId) {
      throw new AIPermissionError("يستطيع المختص تشغيل الوكلاء على ملف مستفيد محدد فقط.");
    }
    if (request.audience !== "doctor" && request.audience !== "parent") {
      throw new AIPermissionError("الجمهور المحدد غير مسموح للمختص.");
    }
    return;
  }

  if (role === "manager") {
    if (
      request.agent !== "case-summary" ||
      request.scope !== "center" ||
      request.audience !== "manager"
    ) {
      throw new AIPermissionError("المدير يستطيع إنشاء ملخص إداري مجمع فقط.");
    }
    return;
  }

  throw new AIPermissionError("هذا الدور لا يملك صلاحية تشغيل وكلاء التحليل.");
}

export function assertCanReview(role: RoleKey, result: AIResult): void {
  if (role === "doctor" && result.scope === "case") return;
  if (
    role === "manager" &&
    result.scope === "center" &&
    result.audience === "manager"
  ) {
    return;
  }
  throw new AIPermissionError("لا تملك صلاحية مراجعة هذه النتيجة.");
}

export function canReadResult(role: RoleKey, result: AIResult): boolean {
  if (role === "doctor") return result.scope === "case";
  if (role === "manager") {
    return result.scope === "center" && result.audience === "manager";
  }
  if (role === "parent") {
    return result.audience === "parent" && result.status === "approved";
  }
  return false;
}
