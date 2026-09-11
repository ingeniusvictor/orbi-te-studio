import { beforeEach, describe, expect, it } from "vitest";
import {
  clearVerifiedEvidenceBuffers,
  getVerifiedEvidenceBuffer,
  pruneExpiredVerifiedEvidenceBuffers,
  storeVerifiedEvidenceBuffer,
  totalVerifiedEvidenceBufferBytes
} from "../src/server/verified-evidence-buffer-registry.js";

describe("verified evidence buffer registry", () => {
  beforeEach(() => clearVerifiedEvidenceBuffers());

  it("stores a verified buffer and reports its byte usage", () => {
    const content = Buffer.from("evidence").toString("base64");
    storeVerifiedEvidenceBuffer(
      "token-1",
      content,
      "2099-01-01T00:00:00.000Z"
    );

    expect(
      getVerifiedEvidenceBuffer("token-1")?.toString("utf8")
    ).toBe("evidence");
    expect(totalVerifiedEvidenceBufferBytes()).toBe(8);
  });

  it("prunes expired buffers", () => {
    const content = Buffer.from("old").toString("base64");
    storeVerifiedEvidenceBuffer(
      "token-old",
      content,
      "2099-01-01T00:00:00.000Z"
    );

    const removed = pruneExpiredVerifiedEvidenceBuffers(
      new Date("2100-01-01T00:00:00.000Z")
    );

    expect(removed).toBe(1);
    expect(totalVerifiedEvidenceBufferBytes()).toBe(0);
  });

  it("rejects already expired buffers", () => {
    expect(() =>
      storeVerifiedEvidenceBuffer(
        "token-expired",
        Buffer.from("x").toString("base64"),
        "2000-01-01T00:00:00.000Z"
      )
    ).toThrow("expiración inválida o vencida");
  });
});
