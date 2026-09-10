import { describe, expect, it } from "vitest";
import { casaGoyoReference } from "../src/reference/casa-goyo.js";
import { buildLoadSchedule } from "../src/drawing/load-schedule.js";

describe("load schedule", () => {
  it("renders observed protections and leaves unknown engineering data pending", () => {
    const rows = buildLoadSchedule(casaGoyoReference);

    expect(rows.map((row) => row.breaker)).toEqual([
      "1x10A 6kA",
      "1x16A 6kA",
      "1x16A 6kA"
    ]);

    expect(rows.every((row) => row.installedPowerW === "PENDING")).toBe(true);
    expect(rows.every((row) => row.conductor === "VERIFY")).toBe(true);
  });
});
