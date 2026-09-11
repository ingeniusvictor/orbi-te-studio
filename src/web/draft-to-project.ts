import type { Circuit, TE1Project } from "../domain/types.js";
import { currentFromSinglePhasePower, roundElectrical } from "../engine/electrical.js";
import type { TE1CircuitDraft, TE1FormDraft } from "./te1-form-model.js";

function numberOrUndefined(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function circuitFromDraft(
  draft: TE1CircuitDraft,
  voltageV: number
): Circuit | undefined {
  const number = Number(draft.number);
  const breakerA = Number(draft.breakerA);

  if (!Number.isInteger(number) || number <= 0) return undefined;
  if (!Number.isFinite(breakerA) || breakerA <= 0) return undefined;
  if (!draft.description.trim()) return undefined;

  const installedPowerW = numberOrUndefined(draft.installedPowerW);
  const demandedPowerW = numberOrUndefined(draft.demandedPowerW);
  const currentA =
    installedPowerW !== undefined && voltageV > 0
      ? roundElectrical(currentFromSinglePhasePower(installedPowerW, voltageV))
      : undefined;

  const breakingCapacityKA = numberOrUndefined(draft.breakingCapacityKA);
  const phaseMm2 = numberOrUndefined(draft.conductorPhaseMm2);
  const neutralMm2 = numberOrUndefined(draft.conductorNeutralMm2);
  const peMm2 = numberOrUndefined(draft.conductorPeMm2);

  const circuit: Circuit = {
    id: draft.id,
    number,
    description: draft.description.trim(),
    voltageV,
    protection: {
      poles: 1,
      ratedCurrentA: breakerA,
      ...(breakingCapacityKA !== undefined
        ? { breakingCapacityKA }
        : {}),
      ...(draft.curve.trim() ? { curve: draft.curve.trim() } : {})
    },
    evidence: []
  };

  if (installedPowerW !== undefined) circuit.installedPowerW = installedPowerW;
  if (demandedPowerW !== undefined) circuit.demandedPowerW = demandedPowerW;
  if (currentA !== undefined) circuit.currentA = currentA;

  if (
    phaseMm2 !== undefined ||
    neutralMm2 !== undefined ||
    peMm2 !== undefined ||
    draft.installationMethod.trim()
  ) {
    circuit.conductor = {
      ...(phaseMm2 !== undefined ? { phaseMm2 } : {}),
      ...(neutralMm2 !== undefined ? { neutralMm2 } : {}),
      ...(peMm2 !== undefined ? { peMm2 } : {}),
      material: draft.conductorMaterial,
      ...(draft.installationMethod.trim()
        ? { installationMethod: draft.installationMethod.trim() }
        : {}),
      verified: draft.conductorVerified
    };
  }

  return circuit;
}

export function draftToTE1Project(
  draft: TE1FormDraft,
  projectId = "TE1-DRAFT"
): TE1Project {
  const voltageV = Number(draft.project.voltageV);
  const safeVoltage = Number.isFinite(voltageV) && voltageV > 0 ? voltageV : 220;
  const surfaceM2 = numberOrUndefined(draft.project.surfaceM2);

  const circuits = draft.circuits
    .map((circuit) => circuitFromDraft(circuit, safeVoltage))
    .filter((circuit): circuit is Circuit => circuit !== undefined);

  const mainPoles = numberOrUndefined(draft.board.mainPoles);
  const mainCurrentA = numberOrUndefined(draft.board.mainCurrentA);
  const mainBreakingCapacityKA = numberOrUndefined(
    draft.board.mainBreakingCapacityKA
  );
  const differentialPoles = numberOrUndefined(draft.board.differentialPoles);
  const differentialCurrentA = numberOrUndefined(
    draft.board.differentialCurrentA
  );
  const differentialResidualMA = numberOrUndefined(
    draft.board.differentialResidualMA
  );

  return {
    id: projectId,
    name: draft.project.name.trim() || "Nuevo proyecto TE1",
    destination: draft.project.destination,
    system: draft.project.system,
    voltageV: safeVoltage,
    ...(surfaceM2 !== undefined && surfaceM2 > 0
      ? { surfaceM2 }
      : {}),
    boardName: draft.board.name.trim() || "TABLERO PENDIENTE",
    ...(mainPoles !== undefined && mainCurrentA !== undefined
      ? {
          mainProtection: {
            poles: mainPoles,
            ratedCurrentA: mainCurrentA,
            ...(mainBreakingCapacityKA !== undefined
              ? { breakingCapacityKA: mainBreakingCapacityKA }
              : {})
          }
        }
      : {}),
    ...(differentialPoles !== undefined &&
    differentialCurrentA !== undefined &&
    differentialResidualMA !== undefined
      ? {
          differentialProtection: {
            poles: differentialPoles,
            ratedCurrentA: differentialCurrentA,
            residualCurrentMA: differentialResidualMA,
            type: "unknown" as const
          }
        }
      : {}),
    location: {
      ...(draft.location.address.trim()
        ? { address: draft.location.address.trim() }
        : {}),
      ...(draft.location.commune.trim()
        ? { commune: draft.location.commune.trim() }
        : {}),
      ...(draft.location.region.trim()
        ? { region: draft.location.region.trim() }
        : {}),
      ...(draft.location.wgs84.trim()
        ? { wgs84: draft.location.wgs84.trim() }
        : {}),
      ...(draft.location.utm.trim()
        ? { utm: draft.location.utm.trim() }
        : {})
    },
    circuits,
    evidence: [],
    professionalReview: draft.review.approved
      ? {
          status: "approved",
          reviewedBy: draft.review.reviewerName.trim(),
          reviewedAt: draft.review.approvedAt,
          ...(draft.review.notes.trim() ? { notes: draft.review.notes.trim() } : {})
        }
      : {
          status: "pending",
          ...(draft.review.notes.trim() ? { notes: draft.review.notes.trim() } : {})
        }
  };
}
