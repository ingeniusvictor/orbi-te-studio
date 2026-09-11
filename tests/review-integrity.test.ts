import { describe, expect, it } from "vitest";
import {
  applyReviewMetadataChange,
  applyTechnicalDraftChange
} from "../src/web/review-integrity.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";

function approvedDraft() {
  const draft = createCasaGoyoDemoDraft();
  draft.review.reviewerName = "Profesional Prueba";
  draft.review.approved = true;
  draft.review.approvedAt = "2026-09-11T02:00:00.000Z";
  return draft;
}

describe("professional review integrity", () => {
  it("invalidates approval after a technical field changes", () => {
    const previous = approvedDraft();
    const next = structuredClone(previous);
    next.board.mainCurrentA = "32";

    const result = applyTechnicalDraftChange(previous, next);

    expect(result.invalidated).toBe(true);
    expect(result.draft.review.approved).toBe(false);
    expect(result.draft.review.approvedAt).toBe("");
  });

  it("preserves approval when technical content is unchanged", () => {
    const previous = approvedDraft();
    const next = structuredClone(previous);

    const result = applyTechnicalDraftChange(previous, next);

    expect(result.invalidated).toBe(false);
    expect(result.draft.review.approved).toBe(true);
  });

  it("invalidates approval when reviewer identity changes", () => {
    const previous = approvedDraft();
    const result = applyReviewMetadataChange(previous, {
      reviewerName: "Otro Profesional"
    });

    expect(result.invalidated).toBe(true);
    expect(result.draft.review.approved).toBe(false);
  });

  it("allows the explicit approval action to set approved state", () => {
    const previous = approvedDraft();
    previous.review.approved = false;
    previous.review.approvedAt = "";

    const result = applyReviewMetadataChange(previous, {
      approved: true,
      approvedAt: "2026-09-11T03:00:00.000Z"
    });

    expect(result.invalidated).toBe(false);
    expect(result.draft.review.approved).toBe(true);
  });
});
