import { describe, expect, it } from "vitest";
import { buildEvidenceManifest } from "../src/web/evidence-manifest.js";
import type { LocalEvidenceMetadata } from "../src/web/evidence-types.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";

function evidence(
  id: string,
  category: LocalEvidenceMetadata["category"],
  filename: string,
  sha256: string
): LocalEvidenceMetadata {
  return {
    id,
    projectId: "TE1-REF-002",
    category,
    filename,
    mimeType: "image/jpeg",
    sizeBytes: 1000,
    lastModified: 0,
    createdAt: "2026-09-10T20:00:00.000Z",
    notes: "",
    sha256
  };
}

describe("TE1 evidence manifest", () => {
  it("records linked evidence roles and hashes deterministically", () => {
    const draft = createCasaGoyoDemoDraft();
    draft.board.frontalEvidenceId = "EV-BOARD";
    draft.location.locationSketchEvidenceId = "EV-LOC";
    draft.plan.sourceType = "measured-sketch";
    draft.plan.sourceEvidenceId = "EV-PLAN";
    draft.measurements = draft.measurements.map((measurement, index) => ({
      ...measurement,
      evidenceId: `EV-M-${index}`
    }));

    const files: LocalEvidenceMetadata[] = [
      evidence("EV-BOARD", "board-front", "tablero.jpg", "a".repeat(64)),
      evidence("EV-LOC", "location-sketch", "ubicacion.jpg", "b".repeat(64)),
      evidence("EV-PLAN", "measured-sketch", "croquis.jpg", "c".repeat(64)),
      ...draft.measurements.map((measurement, index) =>
        evidence(
          measurement.evidenceId,
          "measurement",
          `medicion-${index}.jpg`,
          String(index).padStart(64, "0")
        )
      )
    ];

    const manifest = buildEvidenceManifest(
      "TE1-REF-002",
      draft,
      files,
      new Date("2026-09-10T23:45:00.000Z")
    );

    expect(manifest.algorithm).toBe("SHA-256");
    expect(manifest.entries).toHaveLength(8);
    expect(manifest.entries[0]?.role).toBe("board.front");
    expect(manifest.entries[0]?.sha256).toBe("a".repeat(64));
    expect(manifest.generatedAt).toBe("2026-09-10T23:45:00.000Z");
  });

  it("refuses to emit a manifest if linked evidence is missing", () => {
    const draft = createCasaGoyoDemoDraft();
    expect(() =>
      buildEvidenceManifest("TE1-REF-002", draft, [])
    ).toThrow("No se puede generar el manifest de evidencia");
  });
});
