export type AIMessageRole = "system" | "user" | "assistant";

export interface AIMessage {
  role: AIMessageRole;
  content: string;
}

export interface AIChatRequest {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIChatResponse {
  provider: string;
  model: string;
  content: string;
  done: boolean;
}

export interface AIProviderHealth {
  provider: string;
  model: string;
  ready: boolean;
  detail: string;
}

export interface AIProvider {
  readonly id: string;
  readonly model: string;

  health(): Promise<AIProviderHealth>;
  chat(request: AIChatRequest): Promise<AIChatResponse>;
}

export function validateChatRequest(request: AIChatRequest): string[] {
  const issues: string[] = [];

  if (!Array.isArray(request.messages) || request.messages.length === 0) {
    issues.push("messages debe contener al menos un mensaje.");
    return issues;
  }

  if (request.messages.length > 40) {
    issues.push("messages supera el máximo de 40 elementos.");
  }

  for (const [index, message] of request.messages.entries()) {
    if (
      message.role !== "system" &&
      message.role !== "user" &&
      message.role !== "assistant"
    ) {
      issues.push(`messages[${index}].role no es válido.`);
    }

    if (typeof message.content !== "string") {
      issues.push(`messages[${index}].content debe ser texto.`);
      continue;
    }

    if (message.content.length === 0) {
      issues.push(`messages[${index}].content no puede estar vacío.`);
    }

    if (message.content.length > 20_000) {
      issues.push(
        `messages[${index}].content supera 20.000 caracteres.`
      );
    }
  }

  if (
    request.temperature !== undefined &&
    (!Number.isFinite(request.temperature) ||
      request.temperature < 0 ||
      request.temperature > 2)
  ) {
    issues.push("temperature debe estar entre 0 y 2.");
  }

  if (
    request.maxTokens !== undefined &&
    (!Number.isSafeInteger(request.maxTokens) ||
      request.maxTokens < 1 ||
      request.maxTokens > 8192)
  ) {
    issues.push("maxTokens debe estar entre 1 y 8192.");
  }

  return issues;
}
