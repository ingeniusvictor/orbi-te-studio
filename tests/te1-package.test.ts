import { describe, expect, it } from "vitest";
import { buildProjectManifest } from "../src/export/project-manifest.js";
import { buildTE1DocumentPackage } from "../src/export/te1-package.js";
import { casaGoyoReference } from "../src/reference/casa-goyo.js";

describe("TE1 document package", () => {
  it("does not claim an electrical plan exists when Casa Goyo has no source plan yet", () => {
    const manifest = buildProjectManifest(casaGoyoReference);
    const pkg = buildTE1DocumentPackage(
      manifest,
      {
        status: "field-data-incomplete",
        reasons: ["Plano de planta pendiente."]
      },
      {
        unilinear: "Casa_Goyo_Unilineal.pdf",
        "load-schedule": "Casa_Goyo_Cuadro_Cargas.pdf",
        manifest: "project-manifest.json"
      }
    );

    expect(
      pkg.documents.find((doc) => doc.kind === "electrical-plan")?.status
    ).toBe("pending");
    expect(
      pkg.documents.find((doc) => doc.kind === "unilinear")?.status
    ).toBe("generated");
  });
});
