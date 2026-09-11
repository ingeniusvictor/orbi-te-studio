import { describe, expect, it } from "vitest";
import {
  defaultTE1SymbolLegend,
  renderSymbolLegendPanel,
  symbolLegendForProject
} from "../src/drawing/symbol-legend.js";
import { draftToTE1Project } from "../src/web/draft-to-project.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";

describe("symbol legend", () => {
  it("contains the current core TE1 symbols", () => {
    const svg = renderSymbolLegendPanel();

    expect(defaultTE1SymbolLegend.length).toBeGreaterThanOrEqual(5);
    expect(svg).toContain("CUADRO DE SIMBOLOGÍA");
    expect(svg).toContain("Interruptor automático general");
    expect(svg).toContain("Interruptor diferencial");
    expect(svg).toContain("Puesta a tierra");
  });

  it("omits grounding symbols when grounding topology is not modeled", () => {
    const project = draftToTE1Project(
      createCasaGoyoDemoDraft(),
      "TE1-REF-002"
    );
    const items = symbolLegendForProject(project);
    const svg = renderSymbolLegendPanel(items);

    expect(svg).toContain("Interruptor automático general");
    expect(svg).toContain("Interruptor diferencial");
    expect(svg).not.toContain("Puesta a tierra");
    expect(svg).not.toContain("TP/TS");
  });
});
