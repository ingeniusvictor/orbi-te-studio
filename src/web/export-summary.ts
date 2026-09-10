import { buildComplianceSummary } from "./compliance-summary.js";
import { buildProjectManifest } from "../export/project-manifest.js";
import { draftToTE1Project } from "./draft-to-project.js";
import type { TE1FormDraft } from "./te1-form-model.js";

export interface ExportDocumentStatus {
  id: string;
  label: string;
  status: "ready-to-generate" | "pending";
  reason?: string;
}

export interface WebExportSummary {
  approvedForPreparation: boolean;
  documents: ExportDocumentStatus[];
  manifestJson: string;
}

export function buildWebExportSummary(draft: TE1FormDraft): WebExportSummary {
  const project = draftToTE1Project(draft);
  const compliance = buildComplianceSummary(draft);
  const hasCircuits = project.circuits.length > 0;
  const hasLoads = project.circuits.every(
    (circuit) => circuit.installedPowerW !== undefined
  );
  const hasConductors = project.circuits.every(
    (circuit) => circuit.conductor?.verified === true
  );
  const planReady =
    Boolean(draft.plan.sourceType) &&
    Boolean(draft.plan.sourceLabel.trim()) &&
    draft.plan.hasDimensions &&
    draft.plan.reviewed;

  const approvedForPreparation =
    draft.review.approved &&
    Boolean(draft.review.reviewerName.trim()) &&
    compliance.ready;

  const documents: ExportDocumentStatus[] = [
    {
      id: "electrical-plan",
      label: "Planta eléctrica",
      status: approvedForPreparation && planReady ? "ready-to-generate" : "pending",
      ...(!planReady ? { reason: "Plano fuente pendiente o no revisado." } : {})
    },
    {
      id: "unilinear",
      label: "Diagrama unilineal",
      status: approvedForPreparation && hasCircuits ? "ready-to-generate" : "pending",
      ...(!hasCircuits ? { reason: "Circuitos pendientes." } : {})
    },
    {
      id: "load-schedule",
      label: "Cuadro de cargas",
      status:
        approvedForPreparation && hasLoads && hasConductors
          ? "ready-to-generate"
          : "pending",
      ...(!hasLoads || !hasConductors
        ? { reason: "Cargas o conductores pendientes." }
        : {})
    },
    {
      id: "verification-report",
      label: "Informe de verificación",
      status: approvedForPreparation ? "ready-to-generate" : "pending",
      ...(!approvedForPreparation
        ? { reason: "Falta aprobación profesional o cierre RIC." }
        : {})
    },
    {
      id: "image-report",
      label: "Informe fotográfico",
      status:
        approvedForPreparation && Boolean(draft.board.frontalPhotoLabel.trim())
          ? "ready-to-generate"
          : "pending",
      ...(!draft.board.frontalPhotoLabel.trim()
        ? { reason: "Evidencia fotográfica pendiente." }
        : {})
    },
    {
      id: "manifest",
      label: "Manifest del proyecto",
      status: approvedForPreparation ? "ready-to-generate" : "pending",
      ...(!approvedForPreparation
        ? { reason: "El proyecto aún no está aprobado." }
        : {})
    }
  ];

  return {
    approvedForPreparation,
    documents,
    manifestJson: JSON.stringify(buildProjectManifest(project), null, 2)
  };
}
