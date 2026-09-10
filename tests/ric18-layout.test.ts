import { describe, expect, it } from "vitest";
import { getRic18Margins, getRic18SheetGeometry } from "../src/drawing/ric18-layout.js";

describe("RIC N°18 sheet geometry", () => {
  it("uses A2 electrical-project margins from Annex 18.1", () => {
    expect(getRic18Margins("A2")).toEqual({
      left: 30,
      top: 10,
      right: 10,
      bottom: 10
    });
  });

  it("places the 110 x 80 mm title block at the bottom-right", () => {
    const geometry = getRic18SheetGeometry("A2", "landscape");
    expect(geometry.titleBlock.width).toBe(110);
    expect(geometry.titleBlock.height).toBe(80);
    expect(geometry.titleBlock.x + geometry.titleBlock.width).toBe(584);
    expect(geometry.titleBlock.y + geometry.titleBlock.height).toBe(410);
  });

  it("reserves 80 + 110 + 110 mm for croquis, stamp and title block", () => {
    const geometry = getRic18SheetGeometry("A2", "landscape");
    expect(
      geometry.croquisBox.width +
        geometry.stampBox.width +
        geometry.titleBlock.width
    ).toBe(300);
  });
});
