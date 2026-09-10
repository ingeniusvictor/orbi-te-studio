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
});
