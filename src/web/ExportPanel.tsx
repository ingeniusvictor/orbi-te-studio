import { buildWebExportSummary } from "./export-summary.js";
import type { TE1FormDraft } from "./te1-form-model.js";

export function ExportPanel({ draft }: { draft: TE1FormDraft }) {
  const summary = buildWebExportSummary(draft);

  const downloadManifest = () => {
    const blob = new Blob([summary.manifestJson], {
      type: "application/json;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "orbi-te1-project-manifest.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="export-panel">
      <div className={`review-banner ${summary.approvedForPreparation ? "ready" : "blocked"}`}>
        <strong>
          {summary.approvedForPreparation
            ? "Paquete habilitado para preparación."
            : "Exportación bloqueada."}
        </strong>
        <span>
          ORBI prepara documentos; la revisión y declaración formal siguen bajo
          control del profesional autorizado.
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

      <div className="action-row">
        <button
          type="button"
          className="secondary"
          disabled={!summary.approvedForPreparation}
          onClick={downloadManifest}
        >
          Descargar manifest JSON
        </button>
      </div>
    </div>
  );
}
