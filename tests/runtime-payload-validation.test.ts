import { describe, expect, it } from "vitest";
import {
  validateEvidenceVerifyRequest,
  validateGenerateTE1Request
} from "../src/server/runtime-payload-validation.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";

describe("runtime API payload validation", () => {
  it("rejects malformed TE1 drafts before server casts", () => {
    const result = validateGenerateTE1Request({
      projectId: "TE1-1",
      draft: {
        project: {
          name: "Casa",
          destination: "INVALIDO",
          system: "monofasico",
          voltageV: "220"
        }
      },
      evidenceReceipts: [],
      evidenceManifestJson: "{}",
      auditHistoryJson: "{}"
    });

    expect(result.ok).toBe(false);
    expect(
      result.issues.some((issue) =>
        issue.includes("draft.owner debe ser un objeto")
      )
    ).toBe(true);
  });

  it("rejects excessive evidence upload arrays", () => {
    const result = validateEvidenceVerifyRequest({
      projectId: "TE1-1",
      uploads: Array.from({ length: 101 }, () => ({
        evidenceId: "EV",
        filename: "a.jpg",
        mimeType: "image/jpeg",
        expectedSha256: "a".repeat(64),
        contentBase64: "YQ=="
      }))
    });

    expect(result.ok).toBe(false);
    expect(result.issues[0]).toContain("máximo de 100");
  });

  it("accepts a structurally complete request", () => {
    const draft = createCasaGoyoDemoDraft();
    const result = validateGenerateTE1Request({
      projectId: "TE1-1",
      draft,
      evidenceReceipts: [
        {
          token: "token",
          evidenceId: "EV-1",
          sha256: "a".repeat(64)
        }
      ],
      evidenceManifestJson: JSON.stringify({
        schemaVersion: 1,
        projectId: "TE1-1",
        generatedAt: "2026-09-11T05:00:00.000Z",
        algorithm: "SHA-256",
        entries: []
      }),
      auditHistoryJson: JSON.stringify({
        schemaVersion: 1,
        projectId: "TE1-1",
        events: []
      })
    });

    expect(result.ok).toBe(true);
    expect(result.value?.projectId).toBe("TE1-1");
  });
});
