import { describe, expect, it } from "vitest";
import { casaGoyoReference } from "../src/reference/casa-goyo.js";
import { validateTE1 } from "../src/engine/validate-te1.js";

describe("TE1-REF-002 Casa Goyo", () => {
  it("preserves the three branch circuits visible in the board", () => {
    expect(casaGoyoReference.circuits.map((c) => c.protection.ratedCurrentA)).toEqual([
      10,
      16,
      16
    ]);
  });

  it("preserves the observed main and differential protections", () => {
    expect(casaGoyoReference.mainProtection?.ratedCurrentA).toBe(25);
    expect(casaGoyoReference.mainProtection?.breakingCapacityKA).toBe(6);
    expect(casaGoyoReference.differentialProtection?.ratedCurrentA).toBe(25);
    expect(casaGoyoReference.differentialProtection?.residualCurrentMA).toBe(30);
  });

  it("flags missing field data rather than inventing it", () => {
    const result = validateTE1(casaGoyoReference);
    expect(
      result.findings.some((f) => f.code === "TE1-CIRCUIT-POWER-PENDING")
    ).toBe(true);
    expect(
      result.findings.some((f) => f.code === "TE1-CONDUCTOR-UNVERIFIED")
    ).toBe(true);
  });
});
