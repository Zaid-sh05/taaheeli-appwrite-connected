import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AI_STORAGE } from "@/config/ai";
import { useDemoData } from "@/context/DemoDataContext";
import { useSession } from "@/context/SessionContext";
import {
  assertCanReview,
  canReadResult,
} from "@/features/ai/policies/permissions";
import { aiClient } from "@/features/ai/services/aiClient";
import type {
  AIAuditEvent,
  AICompanionReply,
  AIPersistedState,
  AIRequest,
  AIResult,
} from "@/types/ai";

interface ReviewInput {
  resultId: string;
  decision: "approved" | "rejected";
  content: string;
  note?: string;
}

interface AIContextValue {
  results: AIResult[];
  visibleResults: AIResult[];
  auditEvents: AIAuditEvent[];
  generate: (request: AIRequest) => Promise<AIResult>;
  reviewResult: (input: ReviewInput) => AIResult;
  companionReply: (message: string) => Promise<AICompanionReply>;
  resetAIData: () => void;
}

const AIContext = createContext<AIContextValue | undefined>(undefined);

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyState(): AIPersistedState {
  return {
    version: AI_STORAGE.version,
    results: [],
    auditEvents: [],
  };
}

function loadState(): AIPersistedState {
  try {
    const raw = localStorage.getItem(AI_STORAGE.key);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<AIPersistedState>;
    if (parsed.version !== AI_STORAGE.version) return emptyState();
    return {
      version: AI_STORAGE.version,
      results: parsed.results ?? [],
      auditEvents: parsed.auditEvents ?? [],
    };
  } catch {
    return emptyState();
  }
}

export function AIProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => loadState(), []);
  const [results, setResults] = useState<AIResult[]>(initial.results);
  const [auditEvents, setAuditEvents] = useState<AIAuditEvent[]>(
    initial.auditEvents,
  );
  const { data } = useDemoData();
  const { session, selectedRole } = useSession();

  const role = session?.role ?? selectedRole;
  const actorName = session?.username?.trim() || "مستخدم تجريبي";

  useEffect(() => {
    const next: AIPersistedState = {
      version: AI_STORAGE.version,
      results,
      auditEvents,
    };
    try {
      localStorage.setItem(AI_STORAGE.key, JSON.stringify(next));
    } catch {
      // The prototype remains usable if browser storage is unavailable.
    }
  }, [results, auditEvents]);

  const addAudit = useCallback(
    (
      event: Omit<AIAuditEvent, "id" | "createdAt" | "actorName"> & {
        actorName?: string;
      },
    ) => {
      const auditEvent: AIAuditEvent = {
        ...event,
        id: makeId("audit"),
        actorName: event.actorName ?? actorName,
        createdAt: new Date().toISOString(),
      };
      setAuditEvents((current) => [auditEvent, ...current]);
    },
    [actorName],
  );

  const generate = useCallback<AIContextValue["generate"]>(
    async (request) => {
      if (!role) throw new Error("يجب تسجيل الدخول قبل تشغيل المساعد الذكي.");
      const result = await aiClient.generate({
        request,
        data,
        actorRole: role,
        actorName,
      });
      setResults((current) => [result, ...current]);
      addAudit({
        resultId: result.id,
        action: "generated",
        actorRole: role,
        details: `تشغيل ${result.title} عبر ${result.modelVersion}`,
      });
      return result;
    },
    [actorName, addAudit, data, role],
  );

  const reviewResult = useCallback<AIContextValue["reviewResult"]>(
    (input) => {
      if (!role) throw new Error("يجب تسجيل الدخول لمراجعة النتيجة.");
      const current = results.find((item) => item.id === input.resultId);
      if (!current) throw new Error("لم يتم العثور على النتيجة.");
      if (current.status !== "draft") {
        throw new Error("تمت مراجعة هذه النتيجة مسبقاً.");
      }
      assertCanReview(role, current);

      const nextContent = input.content.trim();
      if (!nextContent) throw new Error("لا يمكن حفظ نتيجة فارغة.");

      const reviewed: AIResult = {
        ...current,
        content: nextContent,
        status: input.decision,
        review: {
          decision: input.decision,
          reviewedAt: new Date().toISOString(),
          reviewedBy: actorName,
          reviewerRole: role,
          note: input.note?.trim() || undefined,
          contentWasEdited: nextContent !== current.content,
        },
      };

      setResults((items) =>
        items.map((item) => (item.id === reviewed.id ? reviewed : item)),
      );
      addAudit({
        resultId: reviewed.id,
        action: input.decision,
        actorRole: role,
        details:
          input.decision === "approved"
            ? `اعتماد النتيجة${reviewed.review?.contentWasEdited ? " بعد تعديلها" : ""}`
            : "رفض النتيجة",
      });
      return reviewed;
    },
    [actorName, addAudit, results, role],
  );

  const companionReply = useCallback<AIContextValue["companionReply"]>(
    async (message) => {
      if (!role) throw new Error("يجب تسجيل الدخول لاستخدام المرافق.");
      const reply = await aiClient.companionReply(message);
      addAudit({
        resultId: null,
        action: "companion-response",
        actorRole: role,
        details: `استجابة مرافق تجريبية — إجراء السلامة: ${reply.safetyAction}`,
      });
      return reply;
    },
    [addAudit, role],
  );

  const resetAIData = useCallback(() => {
    setResults([]);
    setAuditEvents([]);
  }, []);

  const visibleResults = useMemo(
    () => (role ? results.filter((item) => canReadResult(role, item)) : []),
    [results, role],
  );

  const value = useMemo<AIContextValue>(
    () => ({
      results,
      visibleResults,
      auditEvents,
      generate,
      reviewResult,
      companionReply,
      resetAIData,
    }),
    [
      results,
      visibleResults,
      auditEvents,
      generate,
      reviewResult,
      companionReply,
      resetAIData,
    ],
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAI(): AIContextValue {
  const context = useContext(AIContext);
  if (!context) throw new Error("useAI must be used within AIProvider");
  return context;
}
