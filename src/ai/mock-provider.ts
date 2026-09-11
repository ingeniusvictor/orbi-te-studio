import type {
  AIChatRequest,
  AIChatResponse,
  AIProvider,
  AIProviderHealth
} from "./provider.js";
import { validateChatRequest } from "./provider.js";

export class MockAIProvider implements AIProvider {
  readonly id = "mock";
  readonly model = "orbi-te-mock";

  async health(): Promise<AIProviderHealth> {
    return {
      provider: this.id,
      model: this.model,
      ready: true,
      detail: "Mock local disponible."
    };
  }

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const issues = validateChatRequest(request);
    if (issues.length > 0) {
      throw new Error(issues.join(" "));
    }

    const lastUser = [...request.messages]
      .reverse()
      .find((message) => message.role === "user");

    return {
      provider: this.id,
      model: this.model,
      content: lastUser
        ? `[MOCK ORBI TE] ${lastUser.content}`
        : "[MOCK ORBI TE]",
      done: true
    };
  }
}
