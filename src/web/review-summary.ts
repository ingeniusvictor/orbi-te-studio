import { buildComplianceSummary } from "./compliance-summary.js";
import type { TE1FormDraft } from "./te1-form-model.js";

export interface ReviewGateItem {
  id: string;
  label: string;
  completed: boolean;
  detail: string;
}

export interface ReviewGateSummary {
  items: ReviewGateItem[];
  readyForApproval: boolean;
}

function positive(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

export function buildReviewGateSummary(
  draft: TE1FormDraft
): ReviewGateSummary {
  const compliance = buildComplianceSummary(draft);

  const identityComplete =
    Boolean(draft.project.name.trim()) &&
    positive(draft.project.voltageV) &&
    Boolean(draft.owner.name.trim()) &&
    Boolean(draft.owner.rut.trim()) &&
    Boolean(draft.location.address.trim()) &&
    Boolean(draft.location.commune.trim()) &&
    Boolean(draft.location.region.trim()) &&
    Boolean(draft.location.wgs84.trim() || draft.location.utm.trim());

  const boardComplete =
    Boolean(draft.board.name.trim()) &&
    positive(draft.board.totalWays) &&
    Boolean(draft.board.frontalPhotoLabel.trim()) &&
    positive(draft.board.mainPoles) &&
    positive(draft.board.mainCurrentA) &&
    positive(draft.board.differentialPoles) &&
    positive(draft.board.differentialCurrentA) &&
    positive(draft.board.differentialResidualMA) &&
    draft.circuits.length > 0 &&
    draft.circuits.every(
      (circuit) =>
        positive(circuit.number) &&
        Boolean(circuit.description.trim()) &&
        positive(circuit.breakerA)
    );

  const designComplete =
    draft.circuits.length > 0 &&
    draft.circuits.every(
      (circuit) =>
        positive(circuit.installedPowerW) &&
        positive(circuit.conductorPhaseMm2) &&
        positive(circuit.conductorNeutralMm2) &&
        positive(circuit.conductorPeMm2) &&
        Boolean(circuit.installationMethod.trim()) &&
        circuit.conductorVerified
    );

  const measurementsComplete =
    draft.measurements.length > 0 &&
    draft.measurements.every(
      (measurement) =>
        positive(measurement.value) &&
        Boolean(measurement.evidenceLabel.trim()) &&
        measurement.verified
    );

  const planComplete =
    Boolean(draft.plan.sourceType) &&
    Boolean(draft.plan.sourceLabel.trim()) &&
    draft.plan.hasDimensions &&
    draft.plan.reviewed;

  const items: ReviewGateItem[] = [
    {
      id: "IDENTITY",
      label: "Identificación del proyecto",
      completed: identityComplete,
      detail: "Proyecto, propietario, dirección y georreferencia."
    },
    {
      id: "BOARD",
      label: "Tablero y circuitos",
      completed: boardComplete,
      detail: "Protecciones, circuitos y evidencia frontal."
    },
    {
      id: "DESIGN",
      label: "Cargas y conductores",
      completed: designComplete,
      detail: "Potencias y conductores respaldados."
    },
    {
      id: "MEASUREMENTS",
      label: "Mediciones",
      completed: measurementsComplete,
      detail: "Ensayos registrados y verificados con evidencia."
    },
    {
      id: "PLANS",
      label: "Planos",
      completed: planComplete,
      detail: "Fuente geométrica revisada y suficiente."
    },
    {
      id: "COMPLIANCE",
      label: "Verificación RIC",
      completed: compliance.ready,
      detail: "Sin blockers ni reglas no verificables de las reglas implementadas."
    }
  ];

  return {
    items,
    readyForApproval: items.every((item) => item.completed)
  };
}
