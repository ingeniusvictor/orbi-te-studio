import { beforeEach, describe, expect, it } from "vitest";
import {
  clearEvidenceVerificationReceipts,
  createEvidenceVerificationReceipt
} from "../src/server/evidence-verification-registry.js";
import {
  buildServerEvidenceVerificationManifest
} from "../src/server/evidence-verification-manifest.js";

describe("server evidence verification manifest", () => {
  beforeEach(() => clearEvidenceVerificationReceipts());

  it("records verified evidence without exposing the capability token", () => {
    const receipt = createEvidenceVerificationReceipt(
      "TE1-1",
      "EV-1",
      "a".repeat(64),
      new Date("2026-09-10T23:50:00.000Z")
    );

    const manifest = buildServerEvidenceVerificationManifest(
      "TE1-1",
      [
        {
          token: receipt.token,
          evidenceId: "EV-1",
          sha256: "a".repeat(64)
        }
      ],
      new Date("2026-09-10T23:51:00.000Z")
    );

    expect(manifest.entries[0]?.evidenceId).toBe("EV-1");
    expect(manifest.entries[0]?.sha256).toBe("a".repeat(64));
    expect(manifest.entries[0]?.verifiedAt).toBe(
      "2026-09-10T23:50:00.000Z"
    );
    expect(manifest.entries[0]?.receiptFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(manifest)).not.toContain(receipt.token);
  });

  it("refuses a receipt that belongs to another project", () => {
    const receipt = createEvidenceVerificationReceipt(
      "TE1-A",
      "EV-1",
      "b".repeat(64)
    );

    expect(() =>
      buildServerEvidenceVerificationManifest("TE1-B", [
        {
          token: receipt.token,
          evidenceId: "EV-1",
          sha256: "b".repeat(64)
        }
      ])
    ).toThrow("no corresponde");
  });
});
