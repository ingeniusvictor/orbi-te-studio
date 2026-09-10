import { buildTE1GeneratedArtifacts } from "../export/te1-artifacts.js";
import { draftToTE1Project } from "../web/draft-to-project.js";
import { buildWebExportSummary } from "../web/export-summary.js";
import type { TE1FormDraft } from "../web/te1-form-model.js";

export interface GeneratedArtifactPayload {
  filename: string;
  mimeType: string;
  encoding: "utf8" | "base64";
  content: string;
}

export interface GenerateTE1Success {
  ok: true;
  projectId: string;
  artifacts: GeneratedArtifactPayload[];
}

export interface GenerateTE1Failure {
  ok: false;
  status: 409 | 422;
  code: "EXPORT_GATE_BLOCKED" | "INVALID_REQUEST";
  message: string;
  issues: string[];
}

export type GenerateTE1Result = GenerateTE1Success | GenerateTE1Failure;

export async function generateTE1FromDraft(
  draft: TE1FormDraft,
  projectId = "TE1-DRAFT"
): Promise<GenerateTE1Result> {
  const exportSummary = buildWebExportSummary(draft);

  if (!exportSummary.approvedForPreparation) {
    return {
      ok: false,
      status: 409,
      code: "EXPORT_GATE_BLOCKED",
      message:
        "El proyecto no cuenta con aprobación profesional y cierre RIC suficientes para generar el paquete.",
      issues: exportSummary.documents
        .filter((document) => document.status === "pending")
        .map(
          (document) =>
            `${document.label}: ${document.reason ?? "pendiente"}`
        )
    };
  }

  const pending = exportSummary.documents.filter(
    (document) => document.status === "pending"
  );
  if (pending.length > 0) {
    return {
      ok: false,
      status: 409,
      code: "EXPORT_GATE_BLOCKED",
      message: "El paquete aún contiene documentos pendientes.",
      issues: pending.map(
        (document) =>
          `${document.label}: ${document.reason ?? "pendiente"}`
      )
    };
  }

  const project = draftToTE1Project(draft, projectId);
  const generated = await buildTE1GeneratedArtifacts(project, {
    ...(draft.owner.name.trim() ? { ownerName: draft.owner.name.trim() } : {}),
    ...(draft.owner.rut.trim() ? { ownerRut: draft.owner.rut.trim() } : {}),
    ...(draft.review.reviewerName.trim()
      ? { authorizedInstaller: draft.review.reviewerName.trim() }
      : {}),
    ...(draft.plan.scale.trim() ? { scale: draft.plan.scale.trim() } : {}),
    locationSketchVerified:
      Boolean(draft.location.locationSketchEvidenceId.trim()) &&
      draft.location.locationSketchVerified
  });

  return {
    ok: true,
    projectId,
    artifacts: [
      {
        filename: generated.svg.filename,
        mimeType: generated.svg.mimeType,
        encoding: "utf8",
        content: generated.svg.text
      },
      {
        filename: generated.pdf.filename,
        mimeType: generated.pdf.mimeType,
        encoding: "base64",
        content: Buffer.from(generated.pdf.bytes).toString("base64")
      },
      {
        filename: generated.manifest.filename,
        mimeType: generated.manifest.mimeType,
        encoding: "utf8",
        content: generated.manifest.text
      }
    ]
  };
}
