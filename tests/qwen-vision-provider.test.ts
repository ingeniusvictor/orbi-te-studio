import { describe, expect, it } from "vitest";
import { QwenVisionProvider } from "../src/ai/qwen-vision-provider.js";

describe("Qwen local vision provider", () => {
  it("sends image bytes to Ollama and normalizes observations", async () => {
    let requestBody = "";
    const provider = new QwenVisionProvider({
      model: "qwen2.5vl:3b",
      fetchImpl: async (_input, init) => {
        requestBody = String(init?.body ?? "");
        return new Response(
          JSON.stringify({
            model: "qwen2.5vl:3b",
            message: {
              content: JSON.stringify({
                observations: [
                  {
                    field: "mainCurrentA",
                    value: "25",
                    confidence: "high",
                    status: "OBSERVED",
                    note: "C25 visible."
                  },
                  {
                    field: "conductorPhaseMm2",
                    value: "2.5",
                    confidence: "low",
                    status: "VERIFIED",
                    note: "No legible."
                  }
                ],
                warnings: ["Verificar conductor en terreno."]
              })
            }
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" }
          }
        );
      }
    });

    const result = await provider.analyze(
      {
        evidenceId: "EV-BOARD",
        kind: "board-front",
        mimeType: "image/jpeg",
        bytes: new Uint8Array([1, 2, 3])
      },
      "Identifica solo datos legibles."
    );

    expect(result.observations).toHaveLength(2);
    expect(result.observations[0]?.status).toBe("OBSERVED");
    expect(result.observations[1]?.status).toBe("PENDING");
    expect(result.observations[1]?.evidenceId).toBe("EV-BOARD");

    const parsed = JSON.parse(requestBody) as {
      model: string;
      format: string;
      messages: Array<{ images?: string[] }>;
    };
    expect(parsed.model).toBe("qwen2.5vl:3b");
    expect(parsed.format).toBe("json");
    expect(parsed.messages[1]?.images?.[0]).toBe("AQID");
  });

  it("fails closed when visual output is not JSON", async () => {
    const provider = new QwenVisionProvider({
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            message: { content: "Creo que es C25." }
          }),
          { status: 200 }
        )
    });

    const result = await provider.analyze(
      {
        evidenceId: "EV-1",
        kind: "general",
        mimeType: "image/png",
        bytes: new Uint8Array([1])
      },
      "Analiza."
    );

    expect(result.observations).toEqual([]);
    expect(result.warnings[0]).toContain("JSON válido");
  });
});
