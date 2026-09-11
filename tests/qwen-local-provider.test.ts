import { describe, expect, it } from "vitest";
import { QwenLocalProvider } from "../src/ai/qwen-local-provider.js";

describe("Qwen local provider", () => {
  it("reports model readiness from Ollama tags", async () => {
    const provider = new QwenLocalProvider({
      model: "qwen3:1.7b",
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            models: [{ name: "qwen3:1.7b" }]
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" }
          }
        )
    });

    const health = await provider.health();
    expect(health.ready).toBe(true);
  });

  it("maps ORBI chat messages to local Ollama chat", async () => {
    let body = "";
    const provider = new QwenLocalProvider({
      model: "qwen3:1.7b",
      fetchImpl: async (_input, init) => {
        body = String(init?.body ?? "");
        return new Response(
          JSON.stringify({
            model: "qwen3:1.7b",
            message: {
              role: "assistant",
              content: "Falta verificar el conductor."
            },
            done: true
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" }
          }
        );
      }
    });

    const result = await provider.chat({
      messages: [
        {
          role: "system",
          content: "No inventes datos técnicos."
        },
        {
          role: "user",
          content: "¿Qué falta?"
        }
      ],
      temperature: 0.1,
      maxTokens: 200
    });

    expect(result.content).toBe(
      "Falta verificar el conductor."
    );
    const parsed = JSON.parse(body) as {
      model: string;
      stream: boolean;
      think: boolean;
      options: { temperature: number; num_predict: number };
    };
    expect(parsed.model).toBe("qwen3:1.7b");
    expect(parsed.stream).toBe(false);
    expect(parsed.think).toBe(false);
    expect(parsed.options.temperature).toBe(0.1);
    expect(parsed.options.num_predict).toBe(200);
  });

  it("does not accept empty chat content", async () => {
    const provider = new QwenLocalProvider({
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            model: "qwen3:1.7b",
            message: { content: "" },
            done: true
          }),
          { status: 200 }
        )
    });

    await expect(
      provider.chat({
        messages: [{ role: "user", content: "hola" }]
      })
    ).rejects.toThrow("sin contenido");
  });
});
