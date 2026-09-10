import { renderTE1ProjectRic18A2Svg } from "../drawing/render-te1-project-sheet.js";
import { draftToTE1Project } from "./draft-to-project.js";
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
      locationSketchVerified:
        Boolean(draft.location.address.trim()) &&
        Boolean(draft.location.wgs84.trim() || draft.location.utm.trim()) &&
        Boolean(draft.location.locationSketchEvidenceLabel.trim()) &&
        draft.location.locationSketchVerified
    }
  );
}
