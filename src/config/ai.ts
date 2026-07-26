export const AI_FEATURE_FLAGS = {
  skeletonEnabled: import.meta.env.VITE_ENABLE_AI_SKELETON !== "false",
} as const;

export const AI_STORAGE = {
  key: "taaheeli-ai-skeleton",
  version: 1,
} as const;

export const AI_PROVIDER_CONFIG = {
  id: "mock",
  version: "mock-v1",
  simulatedLatencyMs: 450,
} as const;

export const AI_LIMITATIONS = [
  "هذه نتيجة تجريبية مولّدة من بيانات وهمية داخل المتصفح.",
  "لا تمثل تشخيصاً أو قراراً أو توصية طبية.",
  "لا تظهر للأسرة إلا بعد مراجعة واعتماد المختص.",
] as const;
