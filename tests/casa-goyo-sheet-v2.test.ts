import { describe, expect, it } from "vitest";
import { renderCasaGoyoA2SvgV2 } from "../src/drawing/casa-goyo-sheet-v2.js";

describe("Casa Goyo A2 v2", () => {
  it("contains all current deterministic drawing sections", () => {
    const svg = renderCasaGoyoA2SvgV2();

    expect(svg).toContain("DIAGRAMA UNILINEAL");
    expect(svg).toContain("VISTA FRONTAL TABLERO");
    expect(svg).toContain("CUADRO DE CARGAS / CIRCUITOS");
    expect(svg).toContain("EMPALME Y TIERRAS");
    expect(svg).toContain("CROQUIS UBICACIÓN");
    expect(svg).toContain("TDA CASA GOYO");
    expect(svg).toContain("12 WAYS");
  });
});
