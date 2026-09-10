import { describe, expect, it } from "vitest";
import {
  defaultTE1SymbolLegend,
  renderSymbolLegendPanel
} from "../src/drawing/symbol-legend.js";

describe("symbol legend", () => {
  it("contains the current core TE1 symbols", () => {
    const svg = renderSymbolLegendPanel();

    expect(defaultTE1SymbolLegend.length).toBeGreaterThanOrEqual(5);
    expect(svg).toContain("CUADRO DE SIMBOLOGÍA");
    expect(svg).toContain("Interruptor automático general");
    expect(svg).toContain("Interruptor diferencial");
    expect(svg).toContain("Puesta a tierra");
  });
});
