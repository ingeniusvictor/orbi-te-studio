import { buildReviewGateSummary } from "./review-summary.js";
import type { TE1FormDraft } from "./te1-form-model.js";

export function ReviewForm({
  draft,
  onChange
}: {
  draft: TE1FormDraft;
  onChange: (draft: TE1FormDraft) => void;
}) {
  const summary = buildReviewGateSummary(draft);

  const update = (patch: Partial<TE1FormDraft["review"]>) =>
    onChange({
      ...draft,
      review: { ...draft.review, ...patch }
    });

  const setApproved = (approved: boolean) => {
    update({
      approved,
      approvedAt: approved ? new Date().toISOString() : ""
    });
  };

  return (
    <div className="review-panel">
      <div className={`review-banner ${summary.readyForApproval ? "ready" : "blocked"}`}>
        <strong>
          {summary.readyForApproval
            ? "Proyecto listo para decisión profesional."
            : "Aún existen etapas técnicas pendientes."}
        </strong>
        <span>
          La aprobación profesional no sustituye ni automatiza la declaración en
          SEC. Registra únicamente la decisión dentro de ORBI TE Studio.
        </span>
      </div>

      <div className="review-checks">
        {summary.items.map((item) => (
          <div className="review-check" key={item.id}>
            <span className={`review-icon ${item.completed ? "done" : "pending"}`}>
              {item.completed ? "✓" : "!"}
            </span>
            <div>
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="form-grid">
        <label className="field wide">
          <span>Profesional revisor</span>
          <input
            value={draft.review.reviewerName}
            placeholder="Nombre del profesional responsable"
            onChange={(event) => update({ reviewerName: event.target.value })}
          />
        </label>

        <label className="field wide">
          <span>Notas de revisión</span>
          <textarea
            value={draft.review.notes}
            rows={4}
            placeholder="Observaciones, restricciones o aclaraciones."
            onChange={(event) => update({ notes: event.target.value })}
          />
        </label>
      </div>

      <div className="approval-actions">
        <button
          type="button"
          className="secondary"
          onClick={() => setApproved(false)}
        >
          Mantener pendiente
        </button>
        <button
          type="button"
          className="primary"
          disabled={!summary.readyForApproval || !draft.review.reviewerName.trim()}
          onClick={() => setApproved(true)}
        >
          Aprobar profesionalmente
        </button>
      </div>

      {draft.review.approved && (
        <div className="approval-record">
          <strong>APROBADO PARA PREPARACIÓN DE EXPORTACIÓN</strong>
          <span>{draft.review.reviewerName}</span>
          <small>{draft.review.approvedAt}</small>
        </div>
      )}
    </div>
  );
}
