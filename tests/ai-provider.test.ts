import { describe, expect, it } from "vitest";
import { MockAIProvider } from "../src/ai/mock-provider.js";
import { createAIProvider } from "../src/ai/provider-registry.js";

describe("local AI provider contract", () => {
  it("keeps mock deterministic and local", async () => {
    const provider = new MockAIProvider();
    const health = await provider.health();
    const response = await provider.chat({
      messages: [
        { role: "user", content: "Revisa tablero" }
      ]
    });

    expect(health.ready).toBe(true);
    expect(response.provider).toBe("mock");
    expect(response.content).toContain("Revisa tablero");
  });

  it("selects qwen-local without changing ORBI core", () => {
    const provider = createAIProvider({
      providerId: "qwen-local",
      qwenModel: "qwen3:8b"
    });

    expect(provider.id).toBe("qwen-local");
    expect(provider.model).toBe("qwen3:8b");
  });

  it("rejects unsupported provider ids", () => {
    expect(() =>
      createAIProvider({ providerId: "remote-unknown" })
    ).toThrow("Proveedor IA no soportado");
  });
});
