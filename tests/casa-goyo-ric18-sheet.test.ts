import { describe, expect, it } from "vitest";
import { renderCasaGoyoRic18A2Svg } from "../src/drawing/casa-goyo-ric18-sheet.js";

describe("Casa Goyo RIC 18 A2 sheet", () => {
  it("includes mandatory first-sheet presentation areas", () => {
    const svg = renderCasaGoyoRic18A2Svg();

    expect(svg).toContain("PROYECTO TE1 - CASA GOYO - OSORNO");
    expect(svg).toContain("CROQUIS DE UBICACIÓN");
    expect(svg).toContain("TIMBRE DE INSCRIPCIÓN");
    expect(svg).toContain("ACEPTACIÓN PROPIETARIO");
    expect(svg).toContain("INSTALADOR");
    expect(svg).toContain("1 DE 1");
    expect(svg).toContain("TDA CASA GOYO");
    expect(svg).toContain("PENDING");
  });
});
