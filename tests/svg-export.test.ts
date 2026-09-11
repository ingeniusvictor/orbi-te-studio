import { describe, expect, it } from "vitest";
import { createSvgArtifact } from "../src/export/svg-export.js";

describe("SVG export contract", () => {
  it("creates a valid SVG artifact", () => {
    const artifact = createSvgArtifact("test.svg", "<svg></svg>");
    expect(artifact.mimeType).toBe("image/svg+xml");
  });

  it("rejects non-SVG filenames", () => {
    expect(() => createSvgArtifact("test.pdf", "<svg></svg>")).toThrow();
  });
});
