import type { VisionProvider } from "./vision-provider.js";
import {
  QwenVisionProvider,
  type QwenVisionProviderOptions
} from "./qwen-vision-provider.js";

export type VisionProviderId =
  | "disabled"
  | "qwen-vision-local";

export interface VisionProviderRegistryOptions {
  providerId?: string;
  baseUrl?: string;
  model?: string;
}

export function createVisionProvider(
  options: VisionProviderRegistryOptions = {}
): VisionProvider | undefined {
  const providerId =
    (options.providerId ?? "disabled").trim() || "disabled";

  if (providerId === "disabled") {
    return undefined;
  }

  if (providerId === "qwen-vision-local") {
    const qwenOptions: QwenVisionProviderOptions = {};
    if (options.baseUrl) qwenOptions.baseUrl = options.baseUrl;
    if (options.model) qwenOptions.model = options.model;
    return new QwenVisionProvider(qwenOptions);
  }

  throw new Error(
    `Proveedor visual no soportado: ${providerId}. Use disabled o qwen-vision-local.`
  );
}

export function createVisionProviderFromEnv(
  env: NodeJS.ProcessEnv = process.env
): VisionProvider | undefined {
  const options: VisionProviderRegistryOptions = {};

  if (env.ORBI_VISION_PROVIDER) {
    options.providerId = env.ORBI_VISION_PROVIDER;
  }
  if (env.ORBI_QWEN_BASE_URL) {
    options.baseUrl = env.ORBI_QWEN_BASE_URL;
  }
  if (env.ORBI_QWEN_VISION_MODEL) {
    options.model = env.ORBI_QWEN_VISION_MODEL;
  }

  return createVisionProvider(options);
}
