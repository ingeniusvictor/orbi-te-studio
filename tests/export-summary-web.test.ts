import { describe, expect, it } from "vitest";
import { buildWebExportSummary } from "../src/web/export-summary.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";

describe("web TE1 export summary", () => {
  it("does not allow current Casa Goyo draft to masquerade as export-ready", () => {
    const summary = buildWebExportSummary(createCasaGoyoDemoDraft());

    expect(summary.approvedForPreparation).toBe(false);

    const engineeringValidation = summary.documents.find(
      (document) => document.id === "engineering-validation"
    );
    expect(engineeringValidation?.status).toBe("ready-to-generate");

    expect(
      summary.documents
        .filter((document) => document.id !== "engineering-validation")
        .every((document) => document.status === "pending")
    ).toBe(true);
  });

  it("surfaces deterministic engineering blockers in the export document list", () => {
    const draft = createCasaGoyoDemoDraft();
    draft.circuits[0]!.breakerA = "1";
    draft.circuits[0]!.installedPowerW = "10000";

    const summary = buildWebExportSummary(draft);
    const validation = summary.documents.find(
      (document) => document.id === "engineering-validation"
    );

    expect(validation?.status).toBe("pending");
    expect(validation?.reason).toContain(
      "corriente de diseño supera"
    );
  });

  it("always emits a project manifest preview", () => {
    const summary = buildWebExportSummary(createCasaGoyoDemoDraft());
    const manifest = JSON.parse(summary.manifestJson) as { declarationType: string };

    expect(manifest.declarationType).toBe("TE1");
  });
});
