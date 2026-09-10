import { useEffect, useMemo, useState } from "react";
import { getEvidenceBlob, listEvidence } from "./evidence-store.js";
import {
  formatEvidenceSize,
  type EvidenceCategory,
  type LocalEvidenceMetadata
} from "./evidence-types.js";

export interface EvidenceSelection {
  id: string;
  filename: string;
}

export function EvidencePicker({
  projectId,
  category,
  value,
  label,
  onSelect,
  allowCategories
}: {
  projectId: string;
  category?: EvidenceCategory;
  value: string;
  label: string;
  onSelect: (selection: EvidenceSelection | undefined) => void;
  allowCategories?: EvidenceCategory[];
}) {
  const [items, setItems] = useState<LocalEvidenceMetadata[]>([]);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  const refresh = async () => {
    try {
      const evidence = await listEvidence(projectId);
      setItems(evidence);
      setMessage("");
      setLoaded(true);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar la evidencia."
      );
    }
  };

  useEffect(() => {
    void refresh();

    const handler = () => void refresh();
    window.addEventListener("orbi:evidence-changed", handler);
    return () => window.removeEventListener("orbi:evidence-changed", handler);
  }, [projectId]);

  const options = useMemo(() => {
    if (allowCategories) {
      return items.filter((item) => allowCategories.includes(item.category));
    }
    if (category) {
      return items.filter((item) => item.category === category);
    }
    return items;
  }, [items, category, allowCategories]);

  useEffect(() => {
    if (loaded && value && !options.some((item) => item.id === value)) {
      onSelect(undefined);
    }
  }, [loaded, value, options, onSelect]);

  const openSelected = async () => {
    if (!value) return;
    const record = await getEvidenceBlob(value);
    if (!record) return;

    const url = URL.createObjectURL(record.blob);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <div className="evidence-picker">
      <label className="field">
        <span>{label}</span>
        <select
          value={value}
          onChange={(event) => {
            const id = event.target.value;
            const selected = options.find((item) => item.id === id);
            onSelect(
              selected
                ? { id: selected.id, filename: selected.filename }
                : undefined
            );
          }}
        >
          <option value="">Sin evidencia vinculada</option>
          {options.map((item) => (
            <option value={item.id} key={item.id}>
              {item.filename} · {formatEvidenceSize(item.sizeBytes)}
            </option>
          ))}
        </select>
      </label>

      <div className="evidence-picker-actions">
        <button
          type="button"
          className="secondary compact"
          disabled={!value}
          onClick={() => void openSelected()}
        >
          Ver evidencia
        </button>
        <button
          type="button"
          className="secondary compact"
          onClick={() => void refresh()}
        >
          Actualizar lista
        </button>
      </div>

      {options.length === 0 && (
        <small className="evidence-picker-empty">
          No hay archivos compatibles cargados en ORBI Field para este campo.
        </small>
      )}
      {message && <small className="evidence-picker-error">{message}</small>}
    </div>
  );
}
