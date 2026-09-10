import { describe, expect, it } from "vitest";
import { buildComplianceSummary } from "../src/web/compliance-summary.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";

describe("unified RIC compliance summary", () => {
  it("surfaces the observed Casa Goyo main-protection issue", () => {
    const summary = buildComplianceSummary(createCasaGoyoDemoDraft());

    expect(
      summary.items.find(
        (item) => item.code === "RIC10-5.1.3.3-GENERAL-OMNIPOLAR"
      )?.status
    ).toBe("blocker");
  });

  it("passes the 30 mA Casa Goyo differential check", () => {
    const summary = buildComplianceSummary(createCasaGoyoDemoDraft());

    expect(
      summary.items.find(
        (item) => item.code === "RIC10-5.1.3.5-DIFFERENTIAL-30MA"
      )?.status
    ).toBe("pass");
  });

  it("keeps RIC 18 georeference blocked while coordinates are missing", () => {
    const summary = buildComplianceSummary(createCasaGoyoDemoDraft());

    expect(
      summary.items.find(
        (item) => item.code === "RIC18-6.3.5-GEOREFERENCE"
      )?.status
    ).toBe("blocker");
  });

  it("does not treat an architectural plan as a location sketch", () => {
    const draft = createCasaGoyoDemoDraft();
    draft.plan.sourceType = "architectural-plan";
    draft.plan.sourceEvidenceId = "EV-PLAN-ARCH";
    draft.plan.sourceLabel = "planta.pdf";
    draft.plan.reviewed = true;

    const summary = buildComplianceSummary(draft);

    expect(
      summary.items.find(
        (item) => item.code === "RIC18-6.3.6-LOCATION-SKETCH"
      )?.status
    ).toBe("blocker");
  });
});
