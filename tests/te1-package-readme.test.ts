import { describe, expect, it } from "vitest";
import { buildTE1PackageReadme } from "../src/server/te1-package-readme.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";

describe("TE1 package README", () => {
  it("documents package structure, review state and integrity commands", () => {
    const draft = createCasaGoyoDemoDraft();
    draft.review.reviewerName = "Profesional Prueba";
    draft.review.approved = true;
    draft.review.approvedAt = "2026-09-11T02:00:00.000Z";

    const readme = buildTE1PackageReadme(
      "TE1-REF-002",
      draft,
      new Date("2026-09-11T02:30:00.000Z")
    );

    expect(readme.filename).toBe("LEEME_ORBI_TE1.txt");
    expect(readme.content).toContain("00_Proyecto/");
    expect(readme.content).toContain("04_Integridad/");
    expect(readme.content).toContain("Get-FileHash -Algorithm SHA256");
    expect(readme.content).toContain("sha256sum archivo.ext");
    expect(readme.content).toContain("Profesional Prueba");
    expect(readme.content).toContain("No constituye declaracion");
  });
});
