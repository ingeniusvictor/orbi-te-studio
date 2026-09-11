import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { buildTE1PackageIndex } from "../src/server/te1-package-index.js";

describe("TE1 package index", () => {
  it("hashes utf8 and base64 artifacts deterministically", () => {
    const pdfBytes = Buffer.from("%PDF-test", "utf8");
    const index = buildTE1PackageIndex(
      "TE1-1",
      [
        {
          filename: "a.json",
          mimeType: "application/json",
          encoding: "utf8",
          content: "{}"
        },
        {
          filename: "b.pdf",
          mimeType: "application/pdf",
          encoding: "base64",
          content: pdfBytes.toString("base64")
        }
      ],
      new Date("2026-09-11T02:30:00.000Z")
    );

    expect(index.artifactCount).toBe(2);
    expect(index.artifacts[0]?.filename).toBe("a.json");
    expect(index.artifacts[0]?.sha256).toBe(
      createHash("sha256").update(Buffer.from("{}")).digest("hex")
    );
    expect(index.artifacts[1]?.sizeBytes).toBe(pdfBytes.byteLength);
    expect(index.generatedAt).toBe("2026-09-11T02:30:00.000Z");
  });
});
