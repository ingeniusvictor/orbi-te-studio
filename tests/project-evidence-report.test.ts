import { beforeEach, describe, expect, it } from "vitest";
import {
  clearEvidenceVerificationReceipts,
  createEvidenceVerificationReceipt
} from "../src/server/evidence-verification-registry.js";
import {
  clearVerifiedEvidenceBuffers,
  storeVerifiedEvidenceBuffer
} from "../src/server/verified-evidence-buffer-registry.js";
import { buildProjectEvidenceReport } from "../src/server/project-evidence-report.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";

describe("project evidence report", () => {
  beforeEach(() => {
    clearEvidenceVerificationReceipts();
    clearVerifiedEvidenceBuffers();
  });

  it("generates a PDF from verified evidence metadata and bytes", async () => {
    const draft = createCasaGoyoDemoDraft();
    draft.board.frontalEvidenceId = "EV-BOARD";

    const receipt = createEvidenceVerificationReceipt(
      "TE1-REF-002",
      "EV-BOARD",
      "a".repeat(64),
      new Date("2026-09-10T23:50:00.000Z"),
      {
        filename: "tablero.pdf",
        mimeType: "application/pdf",
        sizeBytes: 3
      }
    );
    storeVerifiedEvidenceBuffer(
      receipt.token,
      Buffer.from("pdf").toString("base64")
    );

    const report = await buildProjectEvidenceReport(
      "TE1-REF-002",
      draft,
      [
        {
          token: receipt.token,
          evidenceId: "EV-BOARD",
          sha256: "a".repeat(64)
        }
      ],
      new Date("2026-09-10T23:51:00.000Z")
    );

    expect(report.filename).toBe(
      "TE1-REF-002_TE1_evidence_report.pdf"
    );
    expect(report.bytes.byteLength).toBeGreaterThan(1000);
    expect(String.fromCharCode(...report.bytes.slice(0, 4))).toBe("%PDF");
  });
});
