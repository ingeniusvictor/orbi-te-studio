import { describe, expect, it } from "vitest";
import { buildPanelFrontModel } from "../src/drawing/panel-front.js";
import { renderPanelFrontPanel } from "../src/drawing/render-panel-front-svg.js";

describe("panel-front SVG renderer", () => {
  it("renders observed devices and reserve slots without inventing conductor values", () => {
    const model = buildPanelFrontModel(
      "TDA CASA",
      6,
      [
        {
          position: 1,
          kind: "main-breaker",
          label: "Aut. General",
          protection: {
            poles: 1,
            ratedCurrentA: 25,
            breakingCapacityKA: 6
          },
          confidence: "high",
          evidenceIds: ["EV-BOARD"]
        },
        {
          position: 2,
          kind: "differential",
          label: "Diferencial",
          differential: {
            poles: 2,
            ratedCurrentA: 25,
            residualCurrentMA: 30
          },
          confidence: "high",
          evidenceIds: ["EV-BOARD"]
        },
        {
          position: 3,
          kind: "branch-breaker",
          label: "Alumbrado",
          circuitNumber: 1,
          protection: {
            poles: 1,
            ratedCurrentA: 10,
            breakingCapacityKA: 6
          },
          confidence: "high",
          evidenceIds: ["EV-BOARD"]
        }
      ]
    );

    const panel = renderPanelFrontPanel(model);

    expect(panel).toContain("TDA CASA");
    expect(panel).toContain("1x25A 6kA");
    expect(panel).toContain("2x25A 30mA");
    expect(panel).toContain("Alumbrado");
    expect(panel).toContain("RES");
    expect(panel).not.toContain("2.5mm");
  });
});
