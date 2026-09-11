import { describe, expect, it } from "vitest";
import { buildRetakeRequest } from "../src/field/photo-quality.js";

describe("photo quality gate", () => {
  it("passes a clear high-confidence board photo", () => {
    const result = buildRetakeRequest({
      evidenceId: "PHOTO-1",
      confidence: "high",
      issues: [],
      readableDevicePositions: [1, 2, 3, 4, 5],
      unreadableDevicePositions: []
    });

    expect(result.required).toBe(false);
  });

  it("requests a targeted retake for an unreadable breaker", () => {
    const result = buildRetakeRequest({
      evidenceId: "PHOTO-2",
      confidence: "medium",
      issues: ["rating-unreadable"],
      readableDevicePositions: [1, 2, 3, 4],
      unreadableDevicePositions: [5]
    });

    expect(result.required).toBe(true);
    expect(result.instructions.some((item) => item.includes("posición 5"))).toBe(true);
  });
});
