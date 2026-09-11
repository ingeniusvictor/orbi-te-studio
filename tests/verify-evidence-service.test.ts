import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { verifyEvidenceUploads } from "../src/server/verify-evidence-service.js";

function upload(content: string, expectedSha256?: string) {
  const bytes = Buffer.from(content, "utf8");
  return {
    evidenceId: "EV-1",
    filename: "evidencia.pdf",
    mimeType: "application/pdf",
    expectedSha256:
      expectedSha256 ??
      createHash("sha256").update(bytes).digest("hex"),
    contentBase64: bytes.toString("base64")
  };
}

describe("server evidence SHA-256 verification", () => {
  it("accepts evidence when expected and actual hashes match", () => {
    const result = verifyEvidenceUploads(
      [upload("ORBI evidence")],
      new Date("2026-09-10T23:50:00.000Z")
    );

    expect(result.ok).toBe(true);
    expect(result.items[0]?.verified).toBe(true);
    expect(result.algorithm).toBe("SHA-256");
  });

  it("rejects evidence when the expected hash does not match", () => {
    const result = verifyEvidenceUploads([
      upload("ORBI evidence", "0".repeat(64))
    ]);

    expect(result.ok).toBe(false);
    expect(result.items[0]?.issues).toContain(
      "La huella SHA-256 recibida no coincide con los bytes del archivo."
    );
  });

  it("rejects unsupported MIME types", () => {
    const item = upload("abc");
    item.mimeType = "text/plain";

    const result = verifyEvidenceUploads([item]);
    expect(result.ok).toBe(false);
    expect(result.items[0]?.issues).toContain("MIME type no permitido.");
  });
});
