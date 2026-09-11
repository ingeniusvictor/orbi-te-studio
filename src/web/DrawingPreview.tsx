import { useEffect, useMemo, useState } from "react";
import { renderDraftA2Svg } from "./draft-drawing.js";
import type { TE1FormDraft } from "./te1-form-model.js";

export function DrawingPreview({
  draft,
  projectId
}: {
  draft: TE1FormDraft;
  projectId: string;
}) {
  const svg = useMemo(
    () => renderDraftA2Svg(draft, projectId),
    [draft, projectId]
  );
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const blob = new Blob([svg], {
      type: "image/svg+xml;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [svg]);

  const downloadSvg = () => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeName(draft.project.name || projectId)}_TE1_A2.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="drawing-preview-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PREVISUALIZACIÓN TÉCNICA</p>
          <h3>Lámina A2 generada desde los datos actuales</h3>
        </div>
        <button className="secondary compact" onClick={downloadSvg}>
          Descargar SVG
        </button>
      </div>

      <div
        className="svg-preview"
        aria-label="Previsualización de lámina A2"
      >
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Previsualización de lámina A2 TE1"
          />
        )}
      </div>

      <small className="preview-note">
        La previsualización no implica cumplimiento ni aprobación. Los datos
        faltantes permanecen marcados como PENDIENTE / POR VERIFICAR.
      </small>
    </div>
  );
}

function safeName(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60) || "TE1";
}
