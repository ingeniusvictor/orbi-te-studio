import type { VisionObservation } from "./vision-provider.js";

export type TE1ProposalTarget =
  | "board.mainPoles"
  | "board.mainCurrentA"
  | "board.mainBreakingCapacityKA"
  | "board.differentialPoles"
  | "board.differentialCurrentA"
  | "board.differentialResidualMA";

export interface TE1VisionProposal {
  target: TE1ProposalTarget;
  proposedValue: string;
  evidenceId: string;
  confidence: VisionObservation["confidence"];
  sourceStatus: VisionObservation["status"];
  note: string;
  requiresManualAcceptance: true;
}

export interface VisionProposalResult {
  proposals: TE1VisionProposal[];
  ignored: Array<{
    field: string;
    reason: string;
  }>;
}

const TARGETS: Record<string, TE1ProposalTarget> = {
  mainPoles: "board.mainPoles",
  mainCurrentA: "board.mainCurrentA",
  mainBreakingCapacityKA: "board.mainBreakingCapacityKA",
  differentialPoles: "board.differentialPoles",
  differentialCurrentA: "board.differentialCurrentA",
  differentialResidualMA: "board.differentialResidualMA"
};

export function buildTE1VisionProposals(
  observations: VisionObservation[]
): VisionProposalResult {
  const proposals: TE1VisionProposal[] = [];
  const ignored: VisionProposalResult["ignored"] = [];

  for (const observation of observations) {
    const target = TARGETS[observation.field];

    if (!target) {
      ignored.push({
        field: observation.field,
        reason:
          "El campo no tiene un destino técnico permitido para propuesta automática."
      });
      continue;
    }

    if (observation.status !== "OBSERVED") {
      ignored.push({
        field: observation.field,
        reason:
          "La observación está pendiente y no puede proponerse como valor."
      });
      continue;
    }

    if (
      observation.confidence === "low" ||
      observation.confidence === "unknown"
    ) {
      ignored.push({
        field: observation.field,
        reason:
          "La confianza visual es insuficiente para crear una propuesta."
      });
      continue;
    }

    const normalized = normalizeElectricalNumber(
      observation.value
    );
    if (!normalized) {
      ignored.push({
        field: observation.field,
        reason:
          "El valor observado no tiene formato numérico utilizable."
      });
      continue;
    }

    proposals.push({
      target,
      proposedValue: normalized,
      evidenceId: observation.evidenceId,
      confidence: observation.confidence,
      sourceStatus: observation.status,
      note: observation.note,
      requiresManualAcceptance: true
    });
  }

  return { proposals, ignored };
}

function normalizeElectricalNumber(value: string): string {
  const trimmed = value
    .trim()
    .replace(",", ".")
    .replace(/\s*(A|kA|mA|V|mm²|mm2)$/i, "")
    .trim();

  if (!/^\d+(?:\.\d+)?$/.test(trimmed)) {
    return "";
  }

  return trimmed;
}
