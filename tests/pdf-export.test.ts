import { describe, expect, it } from "vitest";
import { svgToPdfArtifact } from "../src/export/pdf-export.js";

describe("PDF export", () => {
  it("creates a PDF artifact from SVG", async () => {
    const artifact = await svgToPdfArtifact(
      "test.pdf",
      '<svg xmlns="http://www.w3.org/2000/svg" width="594mm" height="420mm"><text x="10" y="10">TEST</text></svg>',
      "A2",
      "landscape"
    );

    expect(artifact.mimeType).toBe("application/pdf");
    expect(artifact.bytes.length).toBeGreaterThan(100);
    expect(String.fromCharCode(...artifact.bytes.slice(0, 4))).toBe("%PDF");
  });
});
