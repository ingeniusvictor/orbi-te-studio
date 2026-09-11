import { describe, expect, it } from "vitest";
import { createReviewAuditEvent } from "../src/qa/review-audit.js";

describe("professional review audit", () => {
  it("creates an immutable approval event", () => {
    const event = createReviewAuditEvent({
      id: "AUDIT-1",
      projectId: "TE1-REF-002",
      action: "approved",
      reviewer: "Instalador autorizado",
      occurredAt: "2026-09-10T18:00:00-03:00"
    });

    expect(event.action).toBe("approved");
    expect(Object.isFrozen(event)).toBe(true);
  });
});
