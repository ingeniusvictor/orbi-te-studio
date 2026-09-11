import type { TE1FormDraft } from "./te1-form-model.js";

export interface ApprovalInvalidationResult {
  draft: TE1FormDraft;
  invalidated: boolean;
}

export function applyTechnicalDraftChange(
  previous: TE1FormDraft,
  next: TE1FormDraft,
  now = new Date()
): ApprovalInvalidationResult {
  if (!previous.review.approved) {
    return { draft: next, invalidated: false };
  }

  if (technicalDraftFingerprint(previous) === technicalDraftFingerprint(next)) {
    return { draft: next, invalidated: false };
  }

  return {
    invalidated: true,
    draft: {
      ...next,
      review: {
        ...next.review,
        approved: false,
        approvedAt: "",
        invalidated: true,
        invalidatedAt: now.toISOString(),
        invalidationReason:
          "Cambió información técnica después de la aprobación profesional."
      }
    }
  };
}

export function applyReviewMetadataChange(
  previous: TE1FormDraft,
  patch: Partial<TE1FormDraft["review"]>,
  now = new Date()
): ApprovalInvalidationResult {
  const nextReview = {
    ...previous.review,
    ...patch
  };

  const reviewerChanged =
    patch.reviewerName !== undefined &&
    patch.reviewerName !== previous.review.reviewerName;
  const notesChanged =
    patch.notes !== undefined &&
    patch.notes !== previous.review.notes;

  const shouldInvalidate =
    previous.review.approved &&
    (reviewerChanged || notesChanged) &&
    patch.approved === undefined;

  if (!shouldInvalidate) {
    return {
      invalidated: false,
      draft: {
        ...previous,
        review: nextReview
      }
    };
  }

  return {
    invalidated: true,
    draft: {
      ...previous,
      review: {
        ...nextReview,
        approved: false,
        approvedAt: "",
        invalidated: true,
        invalidatedAt: now.toISOString(),
        invalidationReason:
          reviewerChanged
            ? "Cambió la identidad del profesional revisor."
            : "Cambiaron las notas de revisión después de la aprobación."
      }
    }
  };
}

export function technicalDraftFingerprint(draft: TE1FormDraft): string {
  return JSON.stringify({
    project: draft.project,
    owner: draft.owner,
    location: draft.location,
    board: draft.board,
    circuits: draft.circuits,
    measurements: draft.measurements,
    plan: draft.plan
  });
}
