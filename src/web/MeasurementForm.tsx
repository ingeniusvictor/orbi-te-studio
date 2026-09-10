import type { TE1FormDraft, TE1MeasurementDraft } from "./te1-form-model.js";

export function MeasurementForm({
  draft,
  onChange
}: {
  draft: TE1FormDraft;
  onChange: (draft: TE1FormDraft) => void;
}) {
  const update = (index: number, patch: Partial<TE1MeasurementDraft>) => {
    onChange({
      ...draft,
      measurements: draft.measurements.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item
      )
    });
  };

  return (
    <div className="circuit-editor">
      <div className="circuit-toolbar">
        <div>
          <strong>Mediciones de verificación</strong>
          <small>Registre valor, unidad y evidencia; no estime resultados.</small>
        </div>
      </div>

      <div className="circuit-stack">
        {draft.measurements.map((measurement, index) => (
          <section className="circuit-card" key={measurement.id}>
            <div className="circuit-card-head">
              <strong>{measurementLabel(measurement.kind)}</strong>
              <span className="mini-status">
                {measurement.verified ? "VERIFICADA" : "PENDIENTE"}
              </span>
            </div>

            <div className="form-grid compact-grid">
              <label className="field">
                <span>Valor</span>
                <input
                  value={measurement.value}
                  inputMode="decimal"
                  onChange={(event) =>
                    update(index, { value: event.target.value })
                  }
                />
              </label>

              <label className="field">
                <span>Unidad</span>
                <input
                  value={measurement.unit}
                  onChange={(event) =>
                    update(index, { unit: event.target.value })
                  }
                />
              </label>

              <label className="field wide">
                <span>Evidencia / instrumento</span>
                <input
                  value={measurement.evidenceLabel}
                  placeholder="Ej. Foto instrumento HIOKI / registro de ensayo"
                  onChange={(event) =>
                    update(index, { evidenceLabel: event.target.value })
                  }
                />
              </label>

              <label className="field wide">
                <span>Notas</span>
                <input
                  value={measurement.notes}
                  placeholder="Opcional"
                  onChange={(event) =>
                    update(index, { notes: event.target.value })
                  }
                />
              </label>

              <label className="verify-check wide">
                <input
                  type="checkbox"
                  checked={measurement.verified}
                  onChange={(event) =>
                    update(index, { verified: event.target.checked })
                  }
                />
                <span>Medición verificada y respaldada por evidencia</span>
              </label>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function measurementLabel(kind: TE1MeasurementDraft["kind"]): string {
  const labels: Record<TE1MeasurementDraft["kind"], string> = {
    "supply-voltage": "Tensión de alimentación",
    "insulation-resistance": "Resistencia de aislamiento",
    "pe-continuity": "Continuidad del conductor de protección",
    "earthing-resistance": "Resistencia de puesta a tierra",
    "rcd-test": "Prueba de diferencial"
  };
  return labels[kind];
}
