import { describe, expect, it } from "vitest";
import {
  buildReviewerChecklist,
  reviewerChecklistReady
} from "../src/qa/reviewer-checklist.js";
import { casaGoyoReference } from "../src/reference/casa-goyo.js";
import { casaGoyoFieldIntake } from "../src/reference/casa-goyo-intake.js";

describe("reviewer checklist", () => {
  it("does not allow Casa Goyo to appear review-complete with current evidence", () => {
    const items = buildReviewerChecklist(
      casaGoyoReference,
      casaGoyoFieldIntake,
      {
        complianceBlockers: 1,
        hasElectricalPlan: false,
        hasUnilinear: true,
        hasLoadSchedule: true,
        hasSymbolLegend: true
      }
    );

    expect(reviewerChecklistReady(items)).toBe(false);
    expect(items.find((item) => item.id === "REVIEW-FIELD-EVIDENCE")?.completed).toBe(true);
    expect(items.find((item) => item.id === "REVIEW-CIRCUITS")?.completed).toBe(false);
  });
});
