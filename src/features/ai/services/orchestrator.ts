import { AI_FEATURE_FLAGS } from "@/config/ai";
import { assertCanGenerate } from "@/features/ai/policies/permissions";
import { MockAIProvider } from "@/features/ai/providers/mockProvider";
import type {
  AICompanionReply,
  AIProvider,
  AIProviderInput,
  AIResult,
} from "@/types/ai";

export class AIOrchestrator {
  constructor(private readonly provider: AIProvider) {}

  async generate(input: AIProviderInput): Promise<AIResult> {
    if (!AI_FEATURE_FLAGS.skeletonEnabled) {
      throw new Error("ميزات الذكاء الاصطناعي التجريبية متوقفة حالياً.");
    }

    assertCanGenerate(input.actorRole, input.request);
    return this.provider.generate(input);
  }

  async companionReply(message: string): Promise<AICompanionReply> {
    if (!AI_FEATURE_FLAGS.skeletonEnabled) {
      throw new Error("المرافق الذكي التجريبي متوقف حالياً.");
    }
    return this.provider.companionReply(message);
  }
}

export const aiOrchestrator = new AIOrchestrator(new MockAIProvider());
