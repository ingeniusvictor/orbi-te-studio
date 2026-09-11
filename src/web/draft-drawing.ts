import { renderTE1ProjectRic18A2Svg } from "../drawing/render-te1-project-sheet.js";
import type { LocationSketchModel } from "../drawing/location-sketch.js";
import { draftToTE1Project } from "./draft-to-project.js";
import { hasRenderableLocationSketch } from "./location-sketch-readiness.js";
import type { TE1FormDraft } from "./te1-form-model.js";

export function renderDraftA2Svg(
  draft: TE1FormDraft,
  projectId = "TE1-DRAFT"
): string {
  return renderTE1ProjectRic18A2Svg(
    draftToTE1Project(draft, projectId),
    {
      ...(draft.owner.name.trim() ? { ownerName: draft.owner.name.trim() } : {}),
      ...(draft.owner.rut.trim() ? { ownerRut: draft.owner.rut.trim() } : {}),
      locationSketchModel: buildLocationSketchModel(draft)
    }
  );
}

export function buildLocationSketchModel(
  draft: TE1FormDraft
): LocationSketchModel {
  if (!hasRenderableLocationSketch(draft)) {
    return { status: "pending" };
  }

  return {
    status: "verified",
    propertyLabel: draft.location.address.trim(),
    ...(draft.location.northStreet.trim()
      ? { northStreet: draft.location.northStreet.trim() }
      : {}),
    ...(draft.location.southStreet.trim()
      ? { southStreet: draft.location.southStreet.trim() }
      : {}),
    ...(draft.location.eastStreet.trim()
      ? { eastStreet: draft.location.eastStreet.trim() }
      : {}),
    ...(draft.location.westStreet.trim()
      ? { westStreet: draft.location.westStreet.trim() }
      : {})
  };
}
