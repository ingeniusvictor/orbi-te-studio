import { EvidencePicker } from "./EvidencePicker.js";
import type { TE1FormDraft } from "./te1-form-model.js";

export function PlanForm({
  draft,
  projectId,
  onChange
}: {
  draft: TE1FormDraft;
  projectId: string;
  onChange: (draft: TE1FormDraft) => void;
}) {
  const update = (patch: Partial<TE1FormDraft["plan"]>) =>
    onChange({
      ...draft,
      plan: { ...draft.plan, ...patch }
    });

  const allowedCategories =
    draft.plan.sourceType === "architectural-plan"
      ? ["architectural-plan" as const]
      : draft.plan.sourceType === "legacy-plan"
        ? ["legacy-plan" as const]
        : draft.plan.sourceType === "measured-sketch"
          ? ["architectural-plan" as const, "general" as const]
          : ["architectural-plan" as const, "legacy-plan" as const, "general" as const];

  return (
    <div className="form-grid">
      <label className="field">
        <span>Tipo de fuente</span>
        <select
          value={draft.plan.sourceType}
          onChange={(event) =>
            update({
              sourceType: event.target.value as TE1FormDraft["plan"]["sourceType"],
              sourceEvidenceId: "",
              sourceLabel: ""
            })
          }
        >
          <option value="">Seleccionar</option>
          <option value="architectural-plan">Plano arquitectónico</option>
          <option value="measured-sketch">Croquis medido en terreno</option>
          <option value="legacy-plan">Plano eléctrico anterior</option>
        </select>
      </label>

      <label className="field">
        <span>Escala indicada</span>
        <input
          value={draft.plan.scale}
          placeholder="Ej. 1:50 / 1:100 / S/E"
          onChange={(event) => update({ scale: event.target.value })}
        />
      </label>

      <div className="wide">
        <EvidencePicker
          projectId={projectId}
          allowCategories={allowedCategories}
          value={draft.plan.sourceEvidenceId}
          label="Archivo / evidencia fuente"
          onSelect={(selection) =>
            update({
              sourceEvidenceId: selection?.id ?? "",
              sourceLabel: selection?.filename ?? ""
            })
          }
        />
      </div>

      <label className="verify-check wide">
        <input
          type="checkbox"
          checked={draft.plan.hasDimensions}
          onChange={(event) => update({ hasDimensions: event.target.checked })}
        />
        <span>La fuente contiene dimensiones suficientes para reconstruir geometría</span>
      </label>

      <label className="verify-check wide">
        <input
          type="checkbox"
          checked={draft.plan.hasElectricalPoints}
          onChange={(event) =>
            update({ hasElectricalPoints: event.target.checked })
          }
        />
        <span>Los puntos eléctricos existentes están identificados o levantados</span>
      </label>

      <label className="verify-check wide">
        <input
          type="checkbox"
          checked={draft.plan.reviewed}
          onChange={(event) => update({ reviewed: event.target.checked })}
        />
        <span>Fuente revisada por el profesional antes de generar la planta</span>
      </label>

      <label className="field wide">
        <span>Notas</span>
        <input
          value={draft.plan.notes}
          placeholder="Observaciones de terreno o diferencias con plano anterior"
          onChange={(event) => update({ notes: event.target.value })}
        />
      </label>
    </div>
  );
}
