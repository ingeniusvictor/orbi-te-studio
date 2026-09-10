import { describe, expect, it } from "vitest";
import { casaGoyoReference } from "../src/reference/casa-goyo.js";
import { departamentoVictorReference } from "../src/reference/departamento-victor.js";
import { ric10Rules } from "../src/compliance/ric10.js";

describe("verified RIC N°10 rules", () => {
  it("flags the observed single-pole general breaker in Casa Goyo for professional review", () => {
    const rule = ric10Rules.find(
      (item) => item.id === "RIC10-5.1.3.3-GENERAL-OMNIPOLAR"
    );
    expect(rule).toBeDefined();
    expect(rule!.evaluate(casaGoyoReference).status).toBe("blocker");
  });

  it("accepts the 30 mA differential sensitivity in Casa Goyo", () => {
    const rule = ric10Rules.find(
      (item) => item.id === "RIC10-5.1.3.5-DIFFERENTIAL-30MA"
    );
    expect(rule!.evaluate(casaGoyoReference).status).toBe("pass");
  });

  it("accepts Casa Goyo three circuits under one differential", () => {
    const rule = ric10Rules.find(
      (item) => item.id === "RIC10-5.1.3.7-MAX-3-CIRCUITS-PER-ID"
    );
    expect(rule!.evaluate(casaGoyoReference).status).toBe("pass");
  });

  it("flags the apartment reference because five circuits are modeled under one differential", () => {
    const rule = ric10Rules.find(
      (item) => item.id === "RIC10-5.1.3.7-MAX-3-CIRCUITS-PER-ID"
    );
    expect(rule!.evaluate(departamentoVictorReference).status).toBe("blocker");
  });
});
