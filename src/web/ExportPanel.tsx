import { useState } from "react";
import { buildWebExportSummary } from "./export-summary.js";
import {
  downloadArtifact,
  requestEvidenceVerification,
  requestTE1Package,
  type ApiGeneratedArtifact,
  type EvidenceVerificationReceipt
} from "./generation-api.js";
import type { TE1FormDraft } from "./te1-form-model.js";
import { useEvidenceAudit } from "./use-evidence-audit.js";
import { listEvidence } from "./evidence-store.js";
import {
  buildEvidenceManifest,
  evidenceManifestToJson
} from "./evidence-manifest.js";
import { buildEvidenceVerificationUploads } from "./evidence-upload-payload.js";
import {
  buildProjectAuditHistory,
  projectAuditHistoryToJson,
  replaceProjectAuditHistory,
  validateProjectAuditChain
} from "./audit-log.js";

export function ExportPanel({
  draft,
  projectId
}: {
  draft: TE1FormDraft;
  projectId: string;
}) {
  const summary = buildWebExportSummary(draft);
  const evidenceAudit = useEvidenceAudit(projectId, draft);
  const [state, setState] = useState<
    "idle" | "generating" | "success" | "error"
  >("idle");
  const [generated, setGenerated] = useState<ApiGeneratedArtifact[]>([]);
  const [issues, setIssues] = useState<string[]>([]);

  const generatePackage = async () => {
    setState("generating");
    setIssues([]);
    setGenerated([]);

    try {
      if (!evidenceAudit.valid) {
        setIssues(evidenceAudit.issues);
        setState("error");
        return;
      }

      const localEvidence = await listEvidence(projectId);
      const evidenceManifest = buildEvidenceManifest(
        projectId,
        draft,
        localEvidence
      );
      const evidenceUploads =
        await buildEvidenceVerificationUploads(evidenceManifest);

      const receipts: EvidenceVerificationReceipt[] = [];
      for (const upload of evidenceUploads) {
        const verification = await requestEvidenceVerification(
          projectId,
          [upload]
        );
        if (!verification.ok || verification.receipts.length !== 1) {
          const verificationIssues = [
            ...(verification.issues ?? []),
            ...verification.items.flatMap((item) => item.issues)
          ];
          setIssues(
            verificationIssues.length > 0
              ? verificationIssues
              : [`No se pudo verificar ${upload.filename} en el servidor.`]
          );
          setState("error");
          return;
        }
        receipts.push(verification.receipts[0]!);
      }

      const evidenceManifestJson =
        evidenceManifestToJson(evidenceManifest);

      if (typeof window === "undefined") {
        throw new Error("El historial de auditoría requiere almacenamiento del navegador.");
      }

      const auditIssues = await validateProjectAuditChain(
        window.localStorage,
        projectId
      );
      if (auditIssues.length > 0) {
        setIssues(auditIssues);
        setState("error");
        return;
      }

      const auditHistoryJson = projectAuditHistoryToJson(
        buildProjectAuditHistory(window.localStorage, projectId)
      );

      const result = await requestTE1Package(
        draft,
        projectId,
        receipts.map((receipt) => ({
          token: receipt.token,
          evidenceId: receipt.evidenceId,
          sha256: receipt.sha256
        })),
        evidenceManifestJson,
        auditHistoryJson
      );

      if (!result.ok) {
        setIssues(
          result.issues.length > 0 ? result.issues : [result.message]
        );
        setState("error");
        return;
      }

      setGenerated(result.artifacts);
      replaceProjectAuditHistory(
        window.localStorage,
        result.auditHistory
      );

      setState("success");
    } catch (error) {
      setIssues([
        error instanceof Error
          ? error.message
          : "No fue posible contactar el servicio de generación."
      ]);
      setState("error");
    }
  };

  return (
    <div className="export-panel">
      <div
        className={`review-banner ${
          summary.approvedForPreparation && evidenceAudit.valid ? "ready" : "blocked"
        }`}
      >
        <strong>
          {summary.approvedForPreparation && evidenceAudit.valid
            ? "Paquete habilitado para generación."
            : "Exportación bloqueada."}
        </strong>
        <span>
          ORBI prepara los archivos técnicos. La declaración formal ante SEC
          permanece bajo control del profesional autorizado.
        </span>
      </div>

      <div className="export-documents">
        {summary.documents.map((document) => (
          <div className="export-document" key={document.id}>
            <div>
              <strong>{document.label}</strong>
              {document.reason && <small>{document.reason}</small>}
            </div>
            <span className={`export-state ${document.status}`}>
              {document.status === "ready-to-generate"
                ? "LISTO PARA GENERAR"
                : "PENDIENTE"}
            </span>
          </div>
        ))}
      </div>

      <div className="evidence-export-audit">
        <strong>Integridad de evidencia local</strong>
        <span>
          {evidenceAudit.checking
            ? "Verificando archivos vinculados..."
            : evidenceAudit.valid
              ? "Todos los vínculos requeridos apuntan a archivos existentes y compatibles."
              : evidenceAudit.issues.join(" · ")}
        </span>
      </div>

      <div className="action-row">
        <button
          type="button"
          className="primary"
          disabled={
            !summary.approvedForPreparation ||
            !evidenceAudit.valid ||
            evidenceAudit.checking ||
            state === "generating"
          }
          onClick={generatePackage}
        >
          {state === "generating"
            ? "Verificando evidencia y generando..."
            : "Generar paquete TE1"}
        </button>
      </div>

      {state === "error" && (
        <div className="generation-result error">
          <strong>No se generó el paquete.</strong>
          <ul>
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {state === "success" && (
        <div className="generation-result success">
          <strong>Paquete generado por el servicio local.</strong>
          <span>
            El ZIP reúne el expediente técnico en carpetas. También puedes
            descargar cada artefacto individual para revisión.
          </span>

          {generated.find((artifact) => artifact.mimeType === "application/zip") && (
            <button
              type="button"
              className="zip-download"
              onClick={() => {
                const zip = generated.find(
                  (artifact) => artifact.mimeType === "application/zip"
                );
                if (zip) downloadArtifact(zip);
              }}
            >
              <span>
                {generated.find(
                  (artifact) => artifact.mimeType === "application/zip"
                )?.filename}
              </span>
              <b>Descargar paquete ZIP</b>
            </button>
          )}

          <div className="generated-files">
            {generated
              .filter((artifact) => artifact.mimeType !== "application/zip")
              .map((artifact) => (
                <button
                  type="button"
                  className="generated-file"
                  key={artifact.filename}
                  onClick={() => downloadArtifact(artifact)}
                >
                  <span>{artifact.filename}</span>
                  <b>Descargar</b>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
