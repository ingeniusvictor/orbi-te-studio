import { describe, expect, it } from "vitest";
import {
  buildMinimumFieldChecklist,
  fieldIntakeCompletionPercent
} from "../src/field/checklist.js";
import { casaGoyoFieldIntake } from "../src/reference/casa-goyo-intake.js";

describe("Casa Goyo field intake", () => {
  it("recognizes the board photo and observed protection set", () => {
    const items = buildMinimumFieldChecklist(casaGoyoFieldIntake);
    expect(
      items.find((item) => item.id === "FIELD-BOARD-FRONTAL")?.status
    ).toBe("complete");
    expect(
      items.find((item) => item.id === "FIELD-BOARD-DEVICES")?.status
    ).toBe("complete");
  });

  it("keeps missing owner, address, georeference and measurements visible", () => {
    const items = buildMinimumFieldChecklist(casaGoyoFieldIntake);
    expect(items.find((item) => item.id === "FIELD-OWNER")?.status).toBe("missing");
    expect(items.find((item) => item.id === "FIELD-ADDRESS")?.status).toBe("missing");
    expect(items.find((item) => item.id === "FIELD-GEOREF")?.status).toBe("missing");
    expect(items.find((item) => item.id === "FIELD-MEASUREMENTS")?.status).toBe("missing");
  });

  it("computes a transparent completion percentage", () => {
    expect(fieldIntakeCompletionPercent(casaGoyoFieldIntake)).toBe(33);
  });
});
