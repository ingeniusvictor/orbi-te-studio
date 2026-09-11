import { describe, expect, it } from "vitest";
import {
  createVisionProvider,
  createVisionProviderFromEnv
} from "../src/ai/vision-provider-registry.js";

describe("vision provider registry", () => {
  it("is disabled by default", () => {
    expect(createVisionProvider()).toBeUndefined();
  });

  it("creates local Qwen vision only when explicitly enabled", () => {
    const provider = createVisionProvider({
      providerId: "qwen-vision-local",
      model: "qwen2.5vl:3b"
    });

    expect(provider?.id).toBe("qwen-vision-local");
    expect(provider?.model).toBe("qwen2.5vl:3b");
  });

  it("reads opt-in provider from env", () => {
    const provider = createVisionProviderFromEnv({
      ORBI_VISION_PROVIDER: "qwen-vision-local",
      ORBI_QWEN_VISION_MODEL: "qwen2.5vl:3b"
    });

    expect(provider?.model).toBe("qwen2.5vl:3b");
  });
});
