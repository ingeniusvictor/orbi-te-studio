import { describe, expect, it } from "vitest";
import { auditEvidenceLinks } from "../src/web/evidence-link-audit.js";
import {
  createCasaGoyoDemoDraft,
  type TE1FormDraft
} from "../src/web/te1-form-model.js";
import type { LocalEvidenceMetadata } from "../src/web/evidence-types.js";

function metadata(
  id: string,
  category: LocalEvidenceMetadata["category"],
  filename: string
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
    sha256: "a".repeat(64)
  };
}

function fullyLinkedDraft(): TE1FormDraft {
  const draft = createCasaGoyoDemoDraft();
  draft.board.frontalEvidenceId = "EV-BOARD";
  draft.board.frontalPhotoLabel = "tablero.jpg";
  draft.location.locationSketchEvidenceId = "EV-LOC";
  draft.location.locationSketchEvidenceLabel = "ubicacion.jpg";
  draft.plan.sourceType = "measured-sketch";
  draft.plan.sourceEvidenceId = "EV-PLAN";
  draft.plan.sourceLabel = "croquis.jpg";
  draft.measurements = draft.measurements.map((measurement, index) => ({
    ...measurement,
    evidenceId: `EV-M-${index}`,
    evidenceLabel: `medicion-${index}.jpg`
  }));
  return draft;
}

describe("field-level evidence link audit", () => {
  it("detects missing binary evidence behind a stored id", () => {
    const draft = fullyLinkedDraft();
    const result = auditEvidenceLinks(draft, []);

    expect(result.valid).toBe(false);
    expect(
      result.issues.some((issue) =>
        issue.includes("el archivo vinculado ya no existe")
      )
    ).toBe(true);
  });

  it("detects incompatible evidence categories", () => {
    const draft = fullyLinkedDraft();
    const evidence = [
      metadata("EV-BOARD", "general", "tablero.jpg")
    ];

    const result = auditEvidenceLinks(draft, evidence);
    expect(result.valid).toBe(false);
    expect(
      result.issues.some((issue) => issue.includes("categoría incompatible"))
    ).toBe(true);
  });

  it("accepts a complete compatible evidence set", () => {
    const draft = fullyLinkedDraft();
    const evidence: LocalEvidenceMetadata[] = [
      metadata("EV-BOARD", "board-front", "tablero.jpg"),
      metadata("EV-LOC", "location-sketch", "ubicacion.jpg"),
      metadata("EV-PLAN", "measured-sketch", "croquis.jpg"),
      ...draft.measurements.map((measurement, index) =>
        metadata(measurement.evidenceId, "measurement", `medicion-${index}.jpg`)
      )
    ];

    expect(auditEvidenceLinks(draft, evidence).valid).toBe(true);
  });
});
