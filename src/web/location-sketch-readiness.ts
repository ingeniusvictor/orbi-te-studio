import type { TE1FormDraft } from "./te1-form-model.js";

export function hasRenderableLocationSketch(
  draft: TE1FormDraft
): boolean {
  const hasBoundary = [
    draft.location.northStreet,
    draft.location.southStreet,
    draft.location.eastStreet,
    draft.location.westStreet
  ].some((value) => value.trim().length > 0);

  return (
    Boolean(draft.location.address.trim()) &&
    Boolean(draft.location.locationSketchEvidenceId.trim()) &&
    draft.location.locationSketchVerified &&
    hasBoundary
  );
}
