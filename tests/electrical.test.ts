import { describe, expect, it } from "vitest";
import {
  breakerHasCapacity,
  currentFromSinglePhasePower,
  roundElectrical
} from "../src/engine/electrical.js";

describe("electrical helpers", () => {
  it("calculates single-phase current", () => {
    expect(roundElectrical(currentFromSinglePhasePower(2200, 220))).toBe(10);
  });

  it("accepts a breaker when design current is within rating", () => {
    expect(breakerHasCapacity(9.8, 10)).toBe(true);
  });

  it("rejects a breaker when design current exceeds rating", () => {
    expect(breakerHasCapacity(10.1, 10)).toBe(false);
  });
});
