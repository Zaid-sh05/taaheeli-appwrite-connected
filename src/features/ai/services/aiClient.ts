import { aiOrchestrator } from "@/features/ai/services/orchestrator";
import type {
  AICompanionReply,
  AIProviderInput,
  AIResult,
} from "@/types/ai";

export const aiClient = {
  generate(input: AIProviderInput): Promise<AIResult> {
    return aiOrchestrator.generate(input);
  },

  companionReply(message: string): Promise<AICompanionReply> {
    return aiOrchestrator.companionReply(message);
  },
};
