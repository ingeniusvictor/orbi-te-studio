import { describe, expect, it } from "vitest";
import { validateEvidenceManifestAgainstReceipts } from "../src/server/evidence-manifest-gate.js";
import type { EvidenceManifest } from "../src/web/evidence-manifest.js";

function manifest(hash: string): EvidenceManifest {
  return {
    schemaVersion: 1,
    projectId: "TE1-1",
    generatedAt: "2026-09-11T02:30:00.000Z",
    algorithm: "SHA-256",
    entries: [
      {
        evidenceId: "EV-1",
        role: "board.front",
        filename: "tablero.jpg",
        category: "board-front",
        mimeType: "image/jpeg",
        sizeBytes: 123,
        sha256: hash,
        createdAt: "2026-09-11T02:00:00.000Z"
      }
    ]
  };
}

describe("evidence manifest server gate", () => {
  it("accepts matching verified evidence", () => {
    expect(
      validateEvidenceManifestAgainstReceipts(
        "TE1-1",
        manifest("a".repeat(64)),
        [
          {
            token: "token",
            evidenceId: "EV-1",
            sha256: "a".repeat(64)
          }
        ]
      )
    ).toEqual([]);
  });

  it("rejects a hash mismatch", () => {
    const issues = validateEvidenceManifestAgainstReceipts(
      "TE1-1",
      manifest("b".repeat(64)),
      [
        {
          token: "token",
          evidenceId: "EV-1",
          sha256: "a".repeat(64)
        }
      ]
    );
    expect(issues[0]).toContain("no coincide");
  });
});
