import type { AIProvider } from "./provider.js";
import { MockAIProvider } from "./mock-provider.js";
import { QwenLocalProvider } from "./qwen-local-provider.js";

export type AIProviderId = "mock" | "qwen-local";

export interface AIProviderRegistryOptions {
  providerId?: string;
  qwenBaseUrl?: string;
  qwenModel?: string;
}

export function createAIProvider(
  options: AIProviderRegistryOptions = {}
): AIProvider {
  const providerId =
    (options.providerId ?? "mock").trim() || "mock";

  if (providerId === "mock") {
    return new MockAIProvider();
  }

  if (providerId === "qwen-local") {
    return new QwenLocalProvider({
      baseUrl: options.qwenBaseUrl,
      model: options.qwenModel
    });
  }

  throw new Error(
    `Proveedor IA no soportado: ${providerId}. Use mock o qwen-local.`
  );
}

export function createAIProviderFromEnv(
  env: NodeJS.ProcessEnv = process.env
): AIProvider {
  return createAIProvider({
    providerId: env.ORBI_AI_PROVIDER,
    qwenBaseUrl: env.ORBI_QWEN_BASE_URL,
    qwenModel: env.ORBI_QWEN_MODEL
  });
}
