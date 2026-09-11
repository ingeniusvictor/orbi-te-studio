import { describe, expect, it } from "vitest";
import { runLocalAIExclusive } from "../src/server/local-ai-resource-gate.js";

describe("local AI resource gate", () => {
  it("runs local AI workloads one at a time", async () => {
    const order: string[] = [];
    let releaseFirst!: () => void;
    const firstWait = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });

    const first = runLocalAIExclusive(async () => {
      order.push("first-start");
      await firstWait;
      order.push("first-end");
      return 1;
    });

    const second = runLocalAIExclusive(async () => {
      order.push("second-start");
      order.push("second-end");
      return 2;
    });

    await Promise.resolve();
    expect(order).toEqual(["first-start"]);

    releaseFirst();
    await Promise.all([first, second]);

    expect(order).toEqual([
      "first-start",
      "first-end",
      "second-start",
      "second-end"
    ]);
  });
});
