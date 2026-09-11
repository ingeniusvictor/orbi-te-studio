import type { TE1FormDraft } from "../web/te1-form-model.js";

export interface EvidenceReceiptRef {
  token: string;
  evidenceId: string;
  sha256: string;
}

export interface EvidenceRoleRef {
  evidenceId: string;
  role: string;
}

export function evidenceRolesFromDraft(
  draft: TE1FormDraft
): EvidenceRoleRef[] {
  const refs: EvidenceRoleRef[] = [
    {
      evidenceId: draft.board.frontalEvidenceId,
      role: "board.front"
    },
    {
      evidenceId: draft.location.locationSketchEvidenceId,
      role: "location.sketch"
    },
    {
      evidenceId: draft.plan.sourceEvidenceId,
      role: "plan.source"
    },
    ...draft.measurements.map((measurement) => ({
      evidenceId: measurement.evidenceId,
      role: `measurement.${measurement.kind}`
    }))
  ];

  if (draft.board.legendEvidenceId) {
    refs.push({
      evidenceId: draft.board.legendEvidenceId,
      role: "board.legend"
    });
  }

  return refs.filter((ref) => ref.evidenceId.trim().length > 0);
}

export function requiredEvidenceIdsFromDraft(
  draft: TE1FormDraft
): string[] {
  return [
    ...new Set(
      evidenceRolesFromDraft(draft).map((ref) => ref.evidenceId)
    )
  ];
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
