import { describe, expect, it } from "vitest";
import { renderCasaGoyoRic18A2Svg } from "../src/drawing/casa-goyo-ric18-sheet.js";
import { svgToPdfArtifact } from "../src/export/pdf-export.js";

describe("Casa Goyo generation contract", () => {
  it("produces a non-empty A2 PDF from the deterministic SVG", async () => {
    const svg = renderCasaGoyoRic18A2Svg();

    expect(svg).toContain('width="594mm"');
    expect(svg).toContain('height="420mm"');
    expect(svg).toContain("CASA GOYO");
    expect(svg).toContain("CUADRO DE SIMBOLOGÍA");

    const pdf = await svgToPdfArtifact(
      "Casa_Goyo_TE1_A2.pdf",
      svg,
      "A2",
      "landscape"
    );

    expect(pdf.bytes.byteLength).toBeGreaterThan(1000);
    expect(String.fromCharCode(...pdf.bytes.slice(0, 4))).toBe("%PDF");
  });
});
