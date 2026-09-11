import { describe, expect, it } from "vitest";
import { departamentoVictorReference } from "../src/reference/departamento-victor.js";

describe("TE1-REF-001 Departamento Víctor", () => {
  it("preserves the five observed branch protection ratings", () => {
    expect(
      departamentoVictorReference.circuits.map((c) => c.protection.ratedCurrentA)
    ).toEqual([10, 10, 16, 16, 32]);
  });

  it("preserves the observed 40 A / 30 mA differential", () => {
    expect(departamentoVictorReference.differentialProtection).toMatchObject({
      ratedCurrentA: 40,
      residualCurrentMA: 30
    });
  });
});
