import { describe, expect, it } from "vitest";
import { buildUnilinearModel } from "../src/drawing/unilinear.js";
import { casaGoyoReference } from "../src/reference/casa-goyo.js";

describe("unilinear model", () => {
  it("builds Casa Goyo device sequence from structured project facts", () => {
    const model = buildUnilinearModel(casaGoyoReference);

    expect(model.boardName).toBe("TDA CASA GOYO");
    expect(model.devices.map((device) => device.id)).toEqual([
      "AG",
      "ID",
      "C1",
      "C2",
      "C3"
    ]);
    expect(model.devices.map((device) => device.rating)).toEqual([
      "1x25A 6kA",
      "2x25A 30mA",
      "1x10A 6kA",
      "1x16A 6kA",
      "1x16A 6kA"
    ]);
  });
});
