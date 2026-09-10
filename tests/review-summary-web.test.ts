import { describe, expect, it } from "vitest";
import { buildReviewGateSummary } from "../src/web/review-summary.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";

describe("web professional review gate", () => {
  it("keeps Casa Goyo blocked with current incomplete evidence", () => {
    const summary = buildReviewGateSummary(createCasaGoyoDemoDraft());

    expect(summary.readyForApproval).toBe(false);
    expect(summary.items.find((item) => item.id === "DESIGN")?.completed).toBe(false);
    expect(summary.items.find((item) => item.id === "MEASUREMENTS")?.completed).toBe(false);
    expect(summary.items.find((item) => item.id === "PLANS")?.completed).toBe(false);
  });
});
