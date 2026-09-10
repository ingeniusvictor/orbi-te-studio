import { useEffect, useState, type ChangeEvent } from "react";
import {
  addEvidence,
  deleteEvidence,
  getEvidenceBlob,
  listEvidence
} from "./evidence-store.js";
import {
  formatEvidenceSize,
  type EvidenceCategory,
  type LocalEvidenceMetadata
} from "./evidence-types.js";

export function EvidenceManager({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<LocalEvidenceMetadata[]>([]);
  const [category, setCategory] =
    useState<EvidenceCategory>("general");
  const [notes, setNotes] = useState("");
  const [state, setState] =
    useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  const refresh = async () => {
    try {
      setItems(await listEvidence(projectId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible leer evidencia.");
      setState("error");
    }
  };

  useEffect(() => {
    void refresh();
  }, [projectId]);

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setState("saving");
    setMessage("");

    try {
      await addEvidence({
        projectId,
        category,
        file,
        notes
      });
      event.target.value = "";
      setNotes("");
      await refresh();
      setState("idle");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la evidencia."
      );
      setState("error");
    }
  };

  const remove = async (id: string) => {
    await deleteEvidence(id);
    await refresh();
  };

  const download = async (id: string) => {
    const record = await getEvidenceBlob(id);
    if (!record) return;

    const url = URL.createObjectURL(record.blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = record.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="evidence-manager">
      <div className="section-heading">
        <div>
          <p className="eyebrow">ORBI FIELD · EVIDENCIA</p>
          <h3>Archivos locales del proyecto</h3>
        </div>
        <span className="status-pill">{items.length}</span>
      </div>

      <p className="evidence-intro">
        Las fotos y PDFs se guardan localmente en IndexedDB. No se suben a SEC
        ni a un servidor en esta fase.
      </p>

      <div className="evidence-upload-grid">
        <label className="field">
          <span>Tipo de evidencia</span>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as EvidenceCategory)
            }
          >
            <option value="general">General</option>
            <option value="board-front">Tablero · frontal</option>
            <option value="board-internal">Tablero · interior</option>
            <option value="board-legend">Tablero · leyenda</option>
            <option value="location-sketch">Croquis de ubicación</option>
            <option value="architectural-plan">Plano arquitectónico</option>
            <option value="legacy-plan">Plano anterior</option>
            <option value="measurement">Medición / instrumento</option>
            <option value="service">Empalme / medidor</option>
            <option value="grounding">Puesta a tierra</option>
          </select>
        </label>

        <label className="field">
          <span>Notas</span>
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Opcional"
          />
        </label>

        <label className="evidence-file-button">
          <input
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            onChange={onFile}
            disabled={state === "saving"}
          />
          {state === "saving" ? "Guardando..." : "+ Seleccionar archivo"}
        </label>
      </div>

      {message && (
        <div className="generation-result error">
          <strong>{message}</strong>
        </div>
      )}

      {items.length === 0 ? (
        <div className="evidence-empty">
          Aún no hay archivos binarios asociados a este proyecto.
        </div>
      ) : (
        <div className="evidence-list">
          {items.map((item) => (
            <article className="evidence-row" key={item.id}>
              <div className="evidence-main">
                <strong>{item.filename}</strong>
                <small>
                  {categoryLabel(item.category)} · {formatEvidenceSize(item.sizeBytes)}
                </small>
                {item.notes && <span>{item.notes}</span>}
              </div>
              <div className="evidence-actions">
                <button
                  className="secondary compact"
                  type="button"
                  onClick={() => void download(item.id)}
                >
                  Abrir
                </button>
                <button
                  className="danger-link"
                  type="button"
                  onClick={() => void remove(item.id)}
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <small className="preview-note">
        Formatos admitidos: PDF, JPG, PNG y WEBP. Máximo 20 MB por archivo.
      </small>
    </section>
  );
}

function categoryLabel(category: EvidenceCategory): string {
  const labels: Record<EvidenceCategory, string> = {
    "board-front": "Tablero frontal",
    "board-internal": "Tablero interior",
    "board-legend": "Leyenda tablero",
    "location-sketch": "Croquis ubicación",
    "architectural-plan": "Plano arquitectónico",
    "legacy-plan": "Plano anterior",
    measurement: "Medición",
    service: "Empalme / medidor",
    grounding: "Puesta a tierra",
    general: "General"
  };
  return labels[category];
}
