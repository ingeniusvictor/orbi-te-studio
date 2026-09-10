import { describe, expect, it } from "vitest";
import { evaluateExportReadiness } from "../src/qa/export-readiness.js";
import { casaGoyoReference } from "../src/reference/casa-goyo.js";
import { casaGoyoFieldIntake } from "../src/reference/casa-goyo-intake.js";
import { buildMinimumFieldChecklist } from "../src/field/checklist.js";

describe("export readiness", () => {
  it("keeps Casa Goyo incomplete while required field data is missing", () => {
    const checklist = buildMinimumFieldChecklist(casaGoyoFieldIntake);
    const result = evaluateExportReadiness(casaGoyoReference, checklist, []);

    expect(result.status).toBe("field-data-incomplete");
  });

  it("blocks export when there is an electrical blocker", () => {
    const checklist = buildMinimumFieldChecklist(casaGoyoFieldIntake);
    const result = evaluateExportReadiness(casaGoyoReference, checklist, [
      {
        code: "TEST-BLOCKER",
        severity: "blocker",
        message: "Conflicto eléctrico pendiente."
      }
    ]);

    expect(result.status).toBe("blocked");
  });
});
