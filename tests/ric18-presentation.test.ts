import { describe, expect, it } from "vitest";
import { validateRic18Presentation } from "../src/compliance/ric18-presentation.js";

describe("RIC N°18 presentation validation", () => {
  it("blocks a first sheet without georeference, croquis or symbol legend", () => {
    const findings = validateRic18Presentation({
      isFirstSheet: true,
      hasGeoreference: false,
      hasLocationSketch: false,
      destination: "Casa habitación",
      sheetNumber: 1,
      sheetTotal: 1,
      hasSymbolLegend: false,
      usesAnnex18_2TitleBlock: true
    });

    expect(findings.filter((item) => item.status === "blocker").map((item) => item.code)).toEqual([
      "RIC18-6.3.5-GEOREFERENCE",
      "RIC18-6.3.6-LOCATION-SKETCH",
      "RIC18-6.3.9-SYMBOL-LEGEND"
    ]);
  });

  it("passes a complete first-sheet presentation state", () => {
    const findings = validateRic18Presentation({
      isFirstSheet: true,
      hasGeoreference: true,
      hasLocationSketch: true,
      destination: "Casa habitación",
      sheetNumber: 1,
      sheetTotal: 1,
      hasSymbolLegend: true,
      usesAnnex18_2TitleBlock: true
    });

    expect(findings.every((item) => item.status === "pass")).toBe(true);
  });
});
