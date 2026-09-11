import { describe, expect, it } from "vitest";
import { renderProjectPanelFrontSvg } from "../src/drawing/render-project-panel-front-svg.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";
import { draftToTE1Project } from "../src/web/draft-to-project.js";

describe("project board-front SVG", () => {
  it("renders registered board and branch protections without inventing conductors", () => {
    const project = draftToTE1Project(
      createCasaGoyoDemoDraft(),
      "TE1-REF-002"
    );

    const svg = renderProjectPanelFrontSvg(project);

    expect(svg).toContain("TABLERO DIGITALIZADO");
    expect(svg).toContain("TDA CASA GOYO");
    expect(svg).toContain("1x25A 6kA");
    expect(svg).toContain("2x25A 30mA");
    expect(svg).toContain("C1");
    expect(svg).toContain("C2");
    expect(svg).toContain("C3");
    expect(svg).not.toContain("2.5mm");
    expect(svg).not.toContain("1.5mm");
  });

  it("does not render when total board ways are unknown", () => {
    const project = draftToTE1Project(createCasaGoyoDemoDraft());
    delete project.boardTotalWays;

    expect(renderProjectPanelFrontSvg(project)).toBeUndefined();
  });
});
