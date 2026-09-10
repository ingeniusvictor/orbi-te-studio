import { describe, expect, it, beforeEach } from "vitest";
import {
  clearEvidenceVerificationReceipts,
  createEvidenceVerificationReceipt,
  validateEvidenceVerificationReceipts
} from "../src/server/evidence-verification-registry.js";

describe("evidence verification receipts", () => {
  beforeEach(() => clearEvidenceVerificationReceipts());

  it("accepts a matching unexpired receipt", () => {
    const now = new Date("2026-09-10T23:50:00.000Z");
    const receipt = createEvidenceVerificationReceipt(
      "TE1-1",
      "EV-1",
      "a".repeat(64),
      now
    );

    expect(
      validateEvidenceVerificationReceipts(
        "TE1-1",
        [
          {
            token: receipt.token,
            evidenceId: "EV-1",
            sha256: "a".repeat(64)
          }
        ],
        new Date("2026-09-10T23:55:00.000Z")
      )
    ).toEqual([]);
  });

  it("rejects an expired receipt", () => {
    const receipt = createEvidenceVerificationReceipt(
      "TE1-1",
      "EV-1",
      "a".repeat(64),
      new Date("2026-09-10T23:30:00.000Z")
    );

    const issues = validateEvidenceVerificationReceipts(
      "TE1-1",
      [
        {
          token: receipt.token,
          evidenceId: "EV-1",
          sha256: "a".repeat(64)
        }
      ],
      new Date("2026-09-10T23:50:00.000Z")
    );

    expect(issues[0]).toContain("expirado");
  });
});
