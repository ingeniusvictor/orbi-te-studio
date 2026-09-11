import type {
  AIChatRequest,
  AIChatResponse,
  AIProvider,
  AIProviderHealth
} from "./provider.js";
import { validateChatRequest } from "./provider.js";

export interface QwenLocalProviderOptions {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

interface OllamaChatResponse {
  model?: string;
  message?: {
    role?: string;
    content?: string;
  };
  done?: boolean;
  error?: string;
}

export class QwenLocalProvider implements AIProvider {
  readonly id = "qwen-local";
  readonly model: string;

  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: QwenLocalProviderOptions = {}) {
    this.baseUrl = normalizeBaseUrl(
      options.baseUrl ?? "http://127.0.0.1:11434"
    );
    this.model = options.model ?? "qwen3:8b";
    this.timeoutMs = options.timeoutMs ?? 120_000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async health(): Promise<AIProviderHealth> {
    try {
      const response = await this.request("/api/tags", {
        method: "GET"
      });

      if (!response.ok) {
        return {
          provider: this.id,
          model: this.model,
          ready: false,
          detail: `Ollama respondió HTTP ${response.status}.`
        };
      }

      const body = (await response.json()) as {
        models?: Array<{ name?: string; model?: string }>;
      };
      const names = (body.models ?? []).flatMap((item) => [
        item.name ?? "",
        item.model ?? ""
      ]);
      const modelPresent = names.some(
        (name) =>
          name === this.model ||
          name.startsWith(`${this.model}:`) ||
          this.model.startsWith(`${name}:`)
      );

      return {
        provider: this.id,
        model: this.model,
        ready: modelPresent,
        detail: modelPresent
          ? "Ollama y el modelo Qwen están disponibles."
          : `Ollama está disponible, pero no se encontró ${this.model}.`
      };
    } catch (error) {
      return {
        provider: this.id,
        model: this.model,
        ready: false,
        detail:
          error instanceof Error
            ? error.message
            : "No fue posible conectar con Ollama."
      };
    }
  }

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const issues = validateChatRequest(request);
    if (issues.length > 0) {
      throw new Error(issues.join(" "));
    }

    const response = await this.request("/api/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        messages: request.messages,
        stream: false,
        options: {
          temperature: request.temperature ?? 0.2,
          ...(request.maxTokens !== undefined
            ? { num_predict: request.maxTokens }
            : {})
        }
      })
    });

    const body = (await response.json()) as OllamaChatResponse;

    if (!response.ok) {
      throw new Error(
        body.error ||
          `Ollama devolvió HTTP ${response.status}.`
      );
    }

    const content = body.message?.content;
    if (typeof content !== "string" || content.length === 0) {
      throw new Error(
        "Ollama respondió sin contenido de mensaje utilizable."
      );
    }

    return {
      provider: this.id,
      model: body.model ?? this.model,
      content,
      done: body.done ?? true
    };
  }

  private async request(
    path: string,
    init: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.timeoutMs
    );

    try {
      return await this.fetchImpl(
        `${this.baseUrl}${path}`,
        {
          ...init,
          signal: controller.signal
        }
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}
