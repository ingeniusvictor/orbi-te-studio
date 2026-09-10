import { describe, expect, it } from "vitest";
import { buildTE1GeneratedArtifacts } from "../src/export/te1-artifacts.js";
import { casaGoyoReference } from "../src/reference/casa-goyo.js";

describe("generic TE1 generated artifacts", () => {
  it("generates SVG PDF and manifest from one project model", async () => {
    const artifacts = await buildTE1GeneratedArtifacts(casaGoyoReference);

    expect(artifacts.svg.filename).toContain("Casa_Goyo_-_Osorno_TE1_A2.svg");
    expect(artifacts.svg.text).toContain("CASA GOYO - OSORNO");
    expect(artifacts.svg.text).toContain("POR VERIFICAR EN TERRENO");

    expect(artifacts.pdf.filename).toContain("Casa_Goyo_-_Osorno_TE1_A2.pdf");
    expect(artifacts.pdf.bytes.byteLength).toBeGreaterThan(1000);
    expect(String.fromCharCode(...artifacts.pdf.bytes.slice(0, 4))).toBe("%PDF");

    const manifest = JSON.parse(artifacts.manifest.text) as {
      projectId: string;
      declarationType: string;
    };
    expect(manifest.projectId).toBe("TE1-REF-002");
    expect(manifest.declarationType).toBe("TE1");
  });
});
