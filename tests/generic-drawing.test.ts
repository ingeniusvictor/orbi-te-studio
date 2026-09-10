import { describe, expect, it } from "vitest";
import { renderDraftA2Svg } from "../src/web/draft-drawing.js";
import {
  createCasaGoyoDemoDraft,
  createEmptyTE1FormDraft
} from "../src/web/te1-form-model.js";

describe("generic TE1 A2 renderer", () => {
  it("renders a new draft without inventing service or location topology", () => {
    const svg = renderDraftA2Svg(createEmptyTE1FormDraft());

    expect(svg).toContain("POR VERIFICAR EN TERRENO");
    expect(svg).toContain("SIN DATOS DE UBICACIÓN VERIFICADOS");
    expect(svg).not.toContain("CALLE NORTE");
    expect(svg).not.toContain("CALLE SUR");
  });

  it("renders Casa Goyo from the editable draft data", () => {
    const svg = renderDraftA2Svg(
      createCasaGoyoDemoDraft(),
      "TE1-REF-002"
    );

    expect(svg).toContain("CASA GOYO - OSORNO");
    expect(svg).toContain("TDA CASA GOYO");
    expect(svg).toContain("Alumbrado");
    expect(svg).toContain("10A");
    expect(svg).toContain("PENDING");
  });
});
