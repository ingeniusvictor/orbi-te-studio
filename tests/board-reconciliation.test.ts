import { describe, expect, it } from "vitest";
import { reconcileBoardWithProject } from "../src/engine/board-reconciliation.js";
import { casaGoyoReference } from "../src/reference/casa-goyo.js";
import { casaGoyoFieldIntake } from "../src/reference/casa-goyo-intake.js";

describe("board reconciliation", () => {
  it("matches Casa Goyo three observed circuit protections", () => {
    const result = reconcileBoardWithProject(
      casaGoyoReference,
      casaGoyoFieldIntake.board.devices
    );

    expect(result.matchedCircuits).toEqual([1, 2, 3]);
    expect(
      result.findings.some((finding) => finding.severity === "blocker")
    ).toBe(false);
  });

  it("detects a branch protection conflict instead of normalizing it away", () => {
    const devices = casaGoyoFieldIntake.board.devices.map((device) =>
      device.circuitNumber === 2 && device.protection
        ? {
            ...device,
            protection: {
              ...device.protection,
              ratedCurrentA: 20
            }
          }
        : device
    );

    const result = reconcileBoardWithProject(casaGoyoReference, devices);
    expect(
      result.findings.some(
        (finding) =>
          finding.code === "BOARD-CIRCUIT-CONFLICT" &&
          finding.circuitId === "GOYO-C2"
      )
    ).toBe(true);
  });
});
