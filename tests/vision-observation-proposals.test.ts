import { describe, expect, it } from "vitest";
import { applyTE1VisionProposal, buildTE1VisionProposals } from "../src/ai/vision-observation-proposals.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";

describe("vision observation proposals", () => {
  it("creates manual board proposals only from observed medium/high confidence values", () => {
    const result = buildTE1VisionProposals([
      {
        field: "mainCurrentA",
        value: "25 A",
        confidence: "high",
        status: "OBSERVED",
        evidenceId: "EV-1",
        note: "C25 legible."
      },
      {
        field: "conductorPhaseMm2",
        value: "2.5",
        confidence: "high",
        status: "OBSERVED",
        evidenceId: "EV-1",
        note: "No debe escribirse por esta vía."
      },
      {
        field: "differentialResidualMA",
        value: "30 mA",
        confidence: "low",
        status: "OBSERVED",
        evidenceId: "EV-1",
        note: "Dudoso."
      }
    ]);

    expect(result.proposals).toEqual([
      {
        target: "board.mainCurrentA",
        proposedValue: "25",
        evidenceId: "EV-1",
        confidence: "high",
        sourceStatus: "OBSERVED",
        note: "C25 legible.",
        requiresManualAcceptance: true
      }
    ]);
    expect(result.ignored).toHaveLength(2);
  });

  it("applies only an explicitly accepted allowlisted board proposal", () => {
    const draft = createCasaGoyoDemoDraft();
    draft.board.mainCurrentA = "";

    const next = applyTE1VisionProposal(draft, {
      target: "board.mainCurrentA",
      proposedValue: "25",
      evidenceId: "EV-1",
      confidence: "high",
      sourceStatus: "OBSERVED",
      note: "C25 legible.",
      requiresManualAcceptance: true
    });

    expect(next.board.mainCurrentA).toBe("25");
    expect(draft.board.mainCurrentA).toBe("");
    expect(next.review.approved).toBe(false);
  });

  it("never converts pending observations into proposals", () => {
    const result = buildTE1VisionProposals([
      {
        field: "mainPoles",
        value: "2",
        confidence: "high",
        status: "PENDING",
        evidenceId: "EV-1",
        note: ""
      }
    ]);

    expect(result.proposals).toEqual([]);
  });
});
