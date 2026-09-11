import type { TE1FormDraft } from "../web/te1-form-model.js";

export interface EvidenceReceiptRef {
  token: string;
  evidenceId: string;
  sha256: string;
}

export function requiredEvidenceIdsFromDraft(
  draft: TE1FormDraft
): string[] {
  const ids = [
    draft.board.frontalEvidenceId,
    draft.location.locationSketchEvidenceId,
    draft.plan.sourceEvidenceId,
    ...draft.measurements.map((measurement) => measurement.evidenceId)
  ];

  if (draft.board.legendEvidenceId) {
    ids.push(draft.board.legendEvidenceId);
  }

  return [...new Set(ids.filter((id) => id.trim().length > 0))];
}

export function auditReceiptCoverage(
  draft: TE1FormDraft,
  receipts: EvidenceReceiptRef[]
): string[] {
  const required = requiredEvidenceIdsFromDraft(draft);
  const supplied = new Set(receipts.map((receipt) => receipt.evidenceId));

  const issues: string[] = [];
  for (const id of required) {
    if (!supplied.has(id)) {
      issues.push(`${id}: falta comprobante server-side para evidencia requerida.`);
    }
  }

  for (const receipt of receipts) {
    if (!required.includes(receipt.evidenceId)) {
      issues.push(
        `${receipt.evidenceId}: comprobante no corresponde a evidencia requerida por el draft.`
      );
    }
  }

  return issues;
}
