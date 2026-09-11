import { buildComplianceSummary } from "./compliance-summary.js";
import { buildProjectManifest } from "../export/project-manifest.js";
import { validateTE1 } from "../engine/validate-te1.js";
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
  const engineeringValidation = validateTE1(project);
  const engineeringBlockers = engineeringValidation.findings.filter(
    (finding) => finding.severity === "blocker"
  );
  const hasCircuits = project.circuits.length > 0;
  const hasLoads = project.circuits.every(
    (circuit) => circuit.installedPowerW !== undefined
  );
  const hasConductors = project.circuits.every(
    (circuit) => circuit.conductor?.verified === true
  );
  const planReady =
    Boolean(draft.plan.sourceType) &&
    Boolean(draft.plan.sourceEvidenceId.trim()) &&
    draft.plan.hasDimensions &&
    draft.plan.reviewed;

  const approvedForPreparation =
    draft.review.approved &&
    Boolean(draft.review.reviewerName.trim()) &&
    compliance.ready &&
    engineeringBlockers.length === 0;

  const documents: ExportDocumentStatus[] = [
    {
      id: "engineering-validation",
      label: "Validación técnica TE1",
      status:
        engineeringBlockers.length === 0
          ? "ready-to-generate"
          : "pending",
      ...(engineeringBlockers.length > 0
        ? {
            reason: engineeringBlockers
              .map((finding) => finding.message)
              .join(" · ")
          }
        : {})
    },
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
        approvedForPreparation && Boolean(draft.board.frontalEvidenceId.trim())
          ? "ready-to-generate"
          : "pending",
      ...(!draft.board.frontalEvidenceId.trim()
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
    },
    {
      id: "evidence-manifest",
      label: "Manifest SHA-256 de evidencia",
      status: approvedForPreparation ? "ready-to-generate" : "pending",
      ...(!approvedForPreparation
        ? { reason: "Requiere aprobación y vínculos de evidencia completos." }
        : {})
    },
    {
      id: "evidence-report",
      label: "Informe legible de evidencia",
      status: approvedForPreparation ? "ready-to-generate" : "pending",
      ...(!approvedForPreparation
        ? { reason: "Se genera tras verificación server-side de evidencia." }
        : {})
    },
    {
      id: "server-verification-manifest",
      label: "Manifest de verificación del servidor",
      status: approvedForPreparation ? "ready-to-generate" : "pending",
      ...(!approvedForPreparation
        ? { reason: "Se genera después de verificar SHA-256 en servidor." }
        : {})
    },
    {
      id: "audit-history",
      label: "Historial de auditoría del proyecto",
      status: approvedForPreparation ? "ready-to-generate" : "pending",
      ...(!approvedForPreparation
        ? { reason: "Requiere aprobación profesional vigente y cadena válida." }
        : {})
    },
    {
      id: "server-audit-ledger",
      label: "Ledger de auditoría server-side",
      status: approvedForPreparation ? "ready-to-generate" : "pending",
      ...(!approvedForPreparation
        ? { reason: "Se valida y persiste en el servicio local antes de generar." }
        : {})
    },
    {
      id: "package-index",
      label: "Índice SHA-256 del paquete",
      status: approvedForPreparation ? "ready-to-generate" : "pending",
      ...(!approvedForPreparation
        ? { reason: "Se genera junto con el paquete técnico final." }
        : {})
    },
    {
      id: "package-readme",
      label: "LEEME del paquete TE1",
      status: approvedForPreparation ? "ready-to-generate" : "pending",
      ...(!approvedForPreparation
        ? { reason: "Documenta estructura, revisión e integridad del paquete." }
        : {})
    },
    {
      id: "organized-zip",
      label: "Paquete TE1 organizado (.zip)",
      status: approvedForPreparation ? "ready-to-generate" : "pending",
      ...(!approvedForPreparation
        ? { reason: "Agrupa los artefactos finales por carpeta." }
        : {})
    }
  ];

  return {
    approvedForPreparation,
    documents,
    manifestJson: JSON.stringify(buildProjectManifest(project), null, 2)
  };
}
