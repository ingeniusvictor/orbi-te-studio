import { describe, expect, it } from "vitest";
import { buildTE1GeneratedArtifacts } from "../src/export/te1-artifacts.js";
import { casaGoyoReference } from "../src/reference/casa-goyo.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";
import { draftToTE1Project } from "../src/web/draft-to-project.js";

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

  it("includes a digital board-front SVG when board ways are registered", async () => {
    const project = draftToTE1Project(
      createCasaGoyoDemoDraft(),
      "TE1-REF-002"
    );
    const artifacts = await buildTE1GeneratedArtifacts(project);

    expect(artifacts.panelFrontSvg?.filename).toContain(
      "_TE1_tablero_frontal.svg"
    );
    expect(artifacts.panelFrontSvg?.text).toContain(
      "TABLERO DIGITALIZADO"
    );
    expect(artifacts.panelFrontSvg?.text).toContain("C3");
  });
});
