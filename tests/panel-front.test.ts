import { describe, expect, it } from "vitest";
import { buildPanelFrontModel } from "../src/drawing/panel-front.js";
import { casaGoyoFieldIntake } from "../src/reference/casa-goyo-intake.js";

describe("panel front model", () => {
  it("places observed Casa Goyo devices and preserves reserve ways", () => {
    const model = buildPanelFrontModel(
      "TDA CASA GOYO",
      12,
      casaGoyoFieldIntake.board.devices
    );

    expect(model.totalWays).toBe(12);
    expect(model.slots[0]).toMatchObject({ kind: "main-breaker", rating: "1x25A 6kA" });
    expect(model.slots[1]).toMatchObject({ kind: "differential", rating: "2x25A 30mA" });
    expect(model.slots[2]).toMatchObject({ kind: "branch-breaker", circuitNumber: 1 });
    expect(model.slots.slice(5).every((slot) => slot.kind === "blank")).toBe(true);
  });
});
