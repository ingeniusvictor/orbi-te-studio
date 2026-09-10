import { describe, expect, it } from "vitest";
import {
  blockWizardStep,
  completeWizardStep,
  createTE1Wizard,
  wizardProgress
} from "../src/wizard/te1-wizard.js";

describe("TE1 project wizard", () => {
  it("starts with only the project step active", () => {
    const state = createTE1Wizard("TE1-REF-002");
    expect(state.currentStep).toBe("project");
    expect(state.steps[0]?.status).toBe("in-progress");
    expect(state.steps[1]?.status).toBe("locked");
  });

  it("unlocks steps sequentially", () => {
    const initial = createTE1Wizard("TE1-REF-002");
    const next = completeWizardStep(initial, "project");

    expect(next.steps[0]?.status).toBe("complete");
    expect(next.steps[1]?.status).toBe("available");
    expect(next.currentStep).toBe("owner");
  });

  it("stores actionable blockers in the affected step", () => {
    const initial = createTE1Wizard("TE1-REF-002");
    const blocked = blockWizardStep(initial, "board", [
      "Protección posición 5 ilegible."
    ]);

    expect(blocked.currentStep).toBe("board");
    expect(blocked.steps.find((step) => step.id === "board")?.status).toBe("blocked");
  });

  it("reports deterministic progress", () => {
    const a = createTE1Wizard("TE1-X");
    const b = completeWizardStep(a, "project");
    expect(wizardProgress(b)).toBe(8);
  });
});
