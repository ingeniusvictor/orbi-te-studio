import type { AIProvider } from "./provider.js";
import { MockAIProvider } from "./mock-provider.js";
import {
  QwenLocalProvider,
  type QwenLocalProviderOptions
} from "./qwen-local-provider.js";

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
    const qwenOptions: QwenLocalProviderOptions = {};
    if (options.qwenBaseUrl) {
      qwenOptions.baseUrl = options.qwenBaseUrl;
    }
    if (options.qwenModel) {
      qwenOptions.model = options.qwenModel;
    }
    return new QwenLocalProvider(qwenOptions);
  }

  throw new Error(
    `Proveedor IA no soportado: ${providerId}. Use mock o qwen-local.`
  );
}

export function createAIProviderFromEnv(
  env: NodeJS.ProcessEnv = process.env
): AIProvider {
  const options: AIProviderRegistryOptions = {};

  if (env.ORBI_AI_PROVIDER) {
    options.providerId = env.ORBI_AI_PROVIDER;
  }
  if (env.ORBI_QWEN_BASE_URL) {
    options.qwenBaseUrl = env.ORBI_QWEN_BASE_URL;
  }
  if (env.ORBI_QWEN_MODEL) {
    options.qwenModel = env.ORBI_QWEN_MODEL;
  }

  return createAIProvider(options);
}
