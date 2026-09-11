import { describe, expect, it } from "vitest";
import { validateFloorPlanModel } from "../src/drawing/floor-plan.js";

describe("electrical floor-plan model", () => {
  it("rejects an invented plan with no source evidence", () => {
    const issues = validateFloorPlanModel({
      projectId: "TE1-REF-002",
      widthMm: 100,
      heightMm: 100,
      rooms: [],
      points: [],
      paths: [],
      sourceEvidenceIds: []
    });

    expect(issues).toContain("El plano debe conservar referencia a evidencia fuente.");
  });

  it("requires each non-board electrical point to have a circuit", () => {
    const issues = validateFloorPlanModel({
      projectId: "TE1-X",
      widthMm: 100,
      heightMm: 100,
      rooms: [],
      points: [
        {
          id: "P1",
          kind: "outlet",
          xMm: 10,
          yMm: 10
        }
      ],
      paths: [],
      sourceEvidenceIds: ["PLAN-001"]
    });

    expect(issues).toContain("Punto P1: circuito pendiente.");
  });
});
