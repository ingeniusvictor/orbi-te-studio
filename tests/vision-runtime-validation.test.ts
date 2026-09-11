import { describe, expect, it } from "vitest";
import { validateVisionAnalyzeRequest } from "../src/server/vision-runtime-validation.js";

describe("vision request runtime validation", () => {
  it("accepts a bounded board-front request", () => {
    const result = validateVisionAnalyzeRequest({
      projectId: "TE1-1",
      receiptToken: "receipt",
      evidenceId: "EV-1",
      kind: "board-front",
      instruction: "Identifica solo datos legibles."
    });

    expect(result.ok).toBe(true);
    expect(result.value?.kind).toBe("board-front");
  });

  it("rejects unsupported evidence kinds", () => {
    const result = validateVisionAnalyzeRequest({
      projectId: "TE1-1",
      receiptToken: "receipt",
      evidenceId: "EV-1",
      kind: "invented-kind",
      instruction: "Analiza."
    });

    expect(result.ok).toBe(false);
    expect(result.issues[0]).toContain("categoría visual");
  });
});
