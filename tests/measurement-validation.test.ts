import { describe, expect, it } from "vitest";
import { validateMeasurementPackage } from "../src/field/measurement-validation.js";

describe("measurement validation", () => {
  it("keeps an empty field package visibly incomplete", () => {
    const findings = validateMeasurementPackage([]);
    expect(findings.filter((item) => item.status === "warning").length).toBe(5);
  });

  it("accepts a verified supply-voltage measurement with evidence", () => {
    const findings = validateMeasurementPackage([
      {
        id: "M-VOLT-001",
        kind: "supply-voltage",
        value: 221.4,
        unit: "V",
        status: "verified",
        evidenceIds: ["EV-METER-001"]
      }
    ]);

    expect(
      findings.some(
        (item) =>
          item.code === "MEASUREMENT-SUPPLY-VOLTAGE-RECORDED" &&
          item.status === "pass"
      )
    ).toBe(true);
  });
});
