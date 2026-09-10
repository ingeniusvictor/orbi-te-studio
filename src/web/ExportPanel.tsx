import { useState } from "react";
import { buildWebExportSummary } from "./export-summary.js";
import {
  downloadArtifact,
  requestTE1Package,
  type ApiGeneratedArtifact
} from "./generation-api.js";
import type { TE1FormDraft } from "./te1-form-model.js";
import { useEvidenceAudit } from "./use-evidence-audit.js";

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

      const result = await requestTE1Package(draft, projectId);

      if (!result.ok) {
        setIssues(
          result.issues.length > 0 ? result.issues : [result.message]
        );
        setState("error");
        return;
      }

      setGenerated(result.artifacts);
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
            ? "Generando paquete..."
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
            Descarga cada artefacto para revisarlo antes de cualquier uso
            documental.
          </span>

          <div className="generated-files">
            {generated.map((artifact) => (
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
