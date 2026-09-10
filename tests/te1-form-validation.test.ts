import { describe, expect, it } from "vitest";
import {
  createCasaGoyoDemoDraft,
  createEmptyTE1FormDraft
} from "../src/web/te1-form-model.js";
import { validateFormStep } from "../src/web/te1-form-validation.js";

describe("TE1 editable wizard form validation", () => {
  it("blocks an empty project", () => {
    const draft = createEmptyTE1FormDraft();
    const result = validateFormStep("project", draft);

    expect(result.valid).toBe(false);
    expect(result.issues).toContain("Nombre del proyecto es obligatorio.");
  });

  it("accepts the Casa Goyo project header", () => {
    const draft = createCasaGoyoDemoDraft();
    expect(validateFormStep("project", draft).valid).toBe(true);
  });

  it("requires owner identity", () => {
    const draft = createCasaGoyoDemoDraft();
    const result = validateFormStep("owner", draft);

    expect(result.valid).toBe(false);
    expect(result.issues.length).toBe(2);
  });

  it("requires address and georeference", () => {
    const draft = createCasaGoyoDemoDraft();
    const result = validateFormStep("location", draft);

    expect(result.valid).toBe(false);
    expect(result.issues).toContain("Dirección es obligatorio.");
    expect(result.issues).toContain("Debe ingresar georreferencia WGS84 o UTM.");
  });

  it("accepts the observed Casa Goyo board header", () => {
    const draft = createCasaGoyoDemoDraft();
    expect(validateFormStep("board", draft).valid).toBe(true);
  });

  it("accepts Casa Goyo observed circuit descriptions and breakers", () => {
    const draft = createCasaGoyoDemoDraft();
    expect(validateFormStep("circuits", draft).valid).toBe(true);
  });

  it("keeps Casa Goyo loads pending instead of inventing watts", () => {
    const draft = createCasaGoyoDemoDraft();
    const result = validateFormStep("loads", draft);

    expect(result.valid).toBe(false);
    expect(
      result.issues.some((issue) => issue.includes("potencia instalada"))
    ).toBe(true);
  });

  it("keeps Casa Goyo conductors pending until verified", () => {
    const draft = createCasaGoyoDemoDraft();
    const result = validateFormStep("conductors", draft);

    expect(result.valid).toBe(false);
    expect(
      result.issues.some((issue) => issue.includes("conductor aún no verificado"))
    ).toBe(true);
  });

  it("accepts loads after real values are entered", () => {
    const draft = createCasaGoyoDemoDraft();
    draft.circuits = draft.circuits.map((circuit, index) => ({
      ...circuit,
      installedPowerW: String((index + 1) * 1000)
    }));

    expect(validateFormStep("loads", draft).valid).toBe(true);
  });

  it("keeps measurement step blocked without real evidence", () => {
    const draft = createCasaGoyoDemoDraft();
    expect(validateFormStep("measurements", draft).valid).toBe(false);
  });

  it("accepts a fully recorded measurement package", () => {
    const draft = createCasaGoyoDemoDraft();
    draft.measurements = draft.measurements.map((measurement, index) => ({
      ...measurement,
      value: String(index + 1),
      evidenceLabel: `EV-M-${index + 1}`,
      verified: true
    }));

    expect(validateFormStep("measurements", draft).valid).toBe(true);
  });

  it("keeps Casa Goyo plan pending without a grounded source", () => {
    const draft = createCasaGoyoDemoDraft();
    expect(validateFormStep("plans", draft).valid).toBe(false);
  });

  it("shows Casa Goyo current RIC blocker from single-pole main protection", () => {
    const draft = createCasaGoyoDemoDraft();
    draft.location.address = "Dirección de prueba";
    draft.location.wgs84 = "-40.0,-73.0";
    draft.plan.sourceType = "measured-sketch";
    draft.plan.sourceLabel = "croquis.pdf";
    draft.plan.hasDimensions = true;
    draft.plan.reviewed = true;

    const result = validateFormStep("compliance", draft);

    expect(result.valid).toBe(false);
    expect(
      result.issues.some((issue) =>
        issue.includes("RIC10-5.1.3.3-GENERAL-OMNIPOLAR")
      )
    ).toBe(true);
  });
});
