import { describe, expect, it } from "vitest";
import { hasRenderableLocationSketch } from "../src/web/location-sketch-readiness.js";
import { createEmptyTE1FormDraft } from "../src/web/te1-form-model.js";

describe("location sketch readiness", () => {
  it("does not treat a verified file link alone as a renderable croquis", () => {
    const draft = createEmptyTE1FormDraft();
    draft.location.address = "Calle Ejemplo 123";
    draft.location.locationSketchEvidenceId = "EV-SKETCH";
    draft.location.locationSketchVerified = true;

    expect(hasRenderableLocationSketch(draft)).toBe(false);
  });

  it("becomes renderable only with explicit location geometry", () => {
    const draft = createEmptyTE1FormDraft();
    draft.location.address = "Calle Ejemplo 123";
    draft.location.locationSketchEvidenceId = "EV-SKETCH";
    draft.location.locationSketchVerified = true;
    draft.location.northStreet = "Calle Norte";

    expect(hasRenderableLocationSketch(draft)).toBe(true);
  });
});
