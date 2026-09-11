import { describe, expect, it } from "vitest";
import { getSheetSizeMm } from "../src/drawing/a-series.js";
import { renderCasaGoyoA2Svg } from "../src/drawing/casa-goyo-sheet.js";

describe("A-series SVG renderer", () => {
  it("uses normalized A2 landscape geometry", () => {
    expect(getSheetSizeMm("A2", "landscape")).toEqual({
      width: 594,
      height: 420
    });
  });

  it("renders Casa Goyo from structured project facts", () => {
    const svg = renderCasaGoyoA2Svg();

    expect(svg).toContain('width="594mm"');
    expect(svg).toContain('height="420mm"');
    expect(svg).toContain("TDA CASA GOYO");
    expect(svg).toContain("1x25A 6kA");
    expect(svg).toContain("2x25A 30mA");
    expect(svg).toContain("ALUMBRADO");
    expect(svg).toContain("ENCHUFES COMUNES");
    expect(svg).toContain("ENCHUFES COCINA - LOGIA");
    expect(svg).toContain("PENDING");
  });
});
