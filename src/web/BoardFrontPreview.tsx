import { useEffect, useMemo, useState } from "react";
import { renderProjectPanelFrontSvg } from "../drawing/render-project-panel-front-svg.js";
import { draftToTE1Project } from "./draft-to-project.js";
import type { TE1FormDraft } from "./te1-form-model.js";

export function BoardFrontPreview({
  draft,
  projectId
}: {
  draft: TE1FormDraft;
  projectId: string;
}) {
  const svg = useMemo(() => {
    const project = draftToTE1Project(draft, projectId);
    return renderProjectPanelFrontSvg(project);
  }, [draft, projectId]);

  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!svg) {
      setPreviewUrl("");
      return;
    }

    const blob = new Blob([svg], {
      type: "image/svg+xml;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [svg]);

  if (!svg) {
    return (
      <section className="drawing-preview-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TABLERO DIGITAL</p>
            <h3>Representación frontal determinista</h3>
          </div>
          <span className="status-pill warning">Pendiente</span>
        </div>
        <div className="evidence-empty">
          Registra la cantidad total de vías/módulos del tablero para generar
          esta representación.
        </div>
      </section>
    );
  }

  const download = () => {
    const blob = new Blob([svg], {
      type: "image/svg+xml;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download =
      `${safeName(draft.project.name || projectId)}_TE1_tablero_frontal.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="drawing-preview-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">TABLERO DIGITAL</p>
          <h3>Representación frontal determinista</h3>
        </div>
        <button
          type="button"
          className="secondary compact"
          onClick={download}
        >
          Descargar SVG
        </button>
      </div>

      <div className="svg-preview board-front-preview">
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Representación frontal digital del tablero"
          />
        )}
      </div>

      <small className="preview-note">
        La IA visual solo puede proponer datos. Esta imagen se dibuja desde los
        valores registrados en ORBI y no representa cableado oculto ni datos no
        verificados.
      </small>
    </section>
  );
}

function safeName(value: string): string {
  return (
    value
      .trim()
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 60) || "TE1"
  );
}
