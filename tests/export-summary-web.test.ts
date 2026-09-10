import { describe, expect, it } from "vitest";
import { buildWebExportSummary } from "../src/web/export-summary.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";

describe("web TE1 export summary", () => {
  it("does not allow current Casa Goyo draft to masquerade as export-ready", () => {
    const summary = buildWebExportSummary(createCasaGoyoDemoDraft());

    expect(summary.approvedForPreparation).toBe(false);
    expect(summary.documents.every((doc) => doc.status === "pending")).toBe(true);
  });

  it("always emits a project manifest preview", () => {
    const summary = buildWebExportSummary(createCasaGoyoDemoDraft());
    const manifest = JSON.parse(summary.manifestJson) as { declarationType: string };

    expect(manifest.declarationType).toBe("TE1");
  });
});
