import { describe, expect, it } from "vitest";
import { sha256Blob, shortSha256 } from "../src/web/evidence-hash.js";

describe("evidence SHA-256", () => {
  it("hashes binary evidence with SHA-256", async () => {
    const hash = await sha256Blob(new Blob(["abc"]));
    expect(hash).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });

  it("formats a short human-readable fingerprint", () => {
    expect(shortSha256("a".repeat(64))).toBe("aaaaaaaaaaaa…");
  });
});
