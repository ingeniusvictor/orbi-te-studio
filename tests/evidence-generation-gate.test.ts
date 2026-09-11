import { describe, expect, it } from "vitest";
import {
  auditReceiptCoverage,
  requiredEvidenceIdsFromDraft
} from "../src/server/evidence-generation-gate.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";

function linkedDraft() {
  const draft = createCasaGoyoDemoDraft();
  draft.board.frontalEvidenceId = "EV-BOARD";
  draft.location.locationSketchEvidenceId = "EV-LOC";
  draft.plan.sourceEvidenceId = "EV-PLAN";
  draft.measurements = draft.measurements.map((measurement, index) => ({
    ...measurement,
    evidenceId: `EV-M-${index}`
  }));
  return draft;
}

describe("server evidence receipt coverage", () => {
  it("enumerates all required linked evidence ids", () => {
    expect(requiredEvidenceIdsFromDraft(linkedDraft())).toHaveLength(8);
  });

  it("rejects incomplete receipt coverage", () => {
    const issues = auditReceiptCoverage(linkedDraft(), [
      { token: "token", evidenceId: "EV-BOARD", sha256: "a".repeat(64) }
    ]);
    expect(issues.some((issue) => issue.includes("EV-LOC"))).toBe(true);
  });

  it("accepts exact required coverage", () => {
    const draft = linkedDraft();
    const receipts = requiredEvidenceIdsFromDraft(draft).map((evidenceId) => ({
      token: `token-${evidenceId}`,
      evidenceId,
      sha256: "a".repeat(64)
    }));
    expect(auditReceiptCoverage(draft, receipts)).toEqual([]);
  });
});
