import { buildReviewGateSummary } from "./review-summary.js";
import { useEvidenceAudit } from "./use-evidence-audit.js";
import type { TE1FormDraft } from "./te1-form-model.js";
import { applyReviewMetadataChange } from "./review-integrity.js";

export function ReviewForm({
  draft,
  projectId,
  onChange
}: {
  draft: TE1FormDraft;
  projectId: string;
  onChange: (draft: TE1FormDraft) => void;
}) {
  const summary = buildReviewGateSummary(draft);
  const evidenceAudit = useEvidenceAudit(projectId, draft);
  const canApprove =
    summary.readyForApproval &&
    evidenceAudit.valid &&
    !evidenceAudit.checking &&
    Boolean(draft.review.reviewerName.trim());

  const update = (patch: Partial<TE1FormDraft["review"]>) => {
    onChange(applyReviewMetadataChange(draft, patch).draft);
  };

  const setApproved = (approved: boolean) => {
    update({
      approved,
      approvedAt: approved ? new Date().toISOString() : "",
      invalidated: false,
      invalidatedAt: "",
      invalidationReason: ""
    });
  };

  return (
    <div className="review-panel">
      <div className={`review-banner ${summary.readyForApproval && evidenceAudit.valid ? "ready" : "blocked"}`}>
        <strong>
          {summary.readyForApproval && evidenceAudit.valid
            ? "Proyecto listo para decisión profesional."
            : "Aún existen etapas técnicas o vínculos de evidencia pendientes."}
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
        <div className="review-check">
          <span className={`review-icon ${evidenceAudit.valid ? "done" : "pending"}`}>
            {evidenceAudit.valid ? "✓" : "!"}
          </span>
          <div>
            <strong>Integridad de evidencia</strong>
            <small>
              {evidenceAudit.checking
                ? "Verificando archivos vinculados..."
                : evidenceAudit.valid
                  ? "Todos los vínculos requeridos apuntan a archivos locales existentes."
                  : evidenceAudit.issues.join(" · ")}
            </small>
          </div>
        </div>
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
          disabled={!canApprove}
          onClick={() => setApproved(true)}
        >
          Aprobar profesionalmente
        </button>
      </div>

      {draft.review.approved ? (
        <div className="approval-record">
          <strong>APROBADO PARA PREPARACIÓN DE EXPORTACIÓN</strong>
          <span>{draft.review.reviewerName}</span>
          <small>{draft.review.approvedAt}</small>
        </div>
      ) : draft.review.invalidated ? (
        <div className="approval-record warning">
          <strong>APROBACIÓN INVALIDADA</strong>
          <span>{draft.review.invalidationReason}</span>
          <small>{draft.review.invalidatedAt}</small>
        </div>
      ) : null}
    </div>
  );
}
