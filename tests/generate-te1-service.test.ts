import { describe, expect, it } from "vitest";
import { generateTE1FromDraft } from "../src/server/generate-te1-service.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";

describe("TE1 generation service", () => {
  it("rejects current Casa Goyo draft before professional approval", async () => {
    const result = await generateTE1FromDraft(
      createCasaGoyoDemoDraft(),
      "TE1-REF-002"
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(409);
      expect(result.code).toBe("EXPORT_GATE_BLOCKED");
    }
  });
});
