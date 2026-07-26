import type {
  AICompanionReply,
  AIProvider,
  AIProviderInput,
  AIResult,
} from "@/types/ai";

export class PrivateProviderPlaceholder implements AIProvider {
  readonly id = "private-provider-placeholder";
  readonly version = "not-configured";

  async generate(_input: AIProviderInput): Promise<AIResult> {
    throw new Error(
      "مزود الذكاء الاصطناعي الخاص غير مهيأ بعد. استخدم Mock Provider في المرحلة الحالية.",
    );
  }

  async companionReply(_message: string): Promise<AICompanionReply> {
    throw new Error("مزود المرافق الخاص غير مهيأ بعد.");
  }
}
