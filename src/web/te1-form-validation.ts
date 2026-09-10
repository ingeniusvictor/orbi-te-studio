import type { TE1WizardStep } from "../wizard/te1-wizard.js";
import type { TE1CircuitDraft, TE1FormDraft } from "./te1-form-model.js";
import { buildComplianceSummary } from "./compliance-summary.js";
import { buildReviewGateSummary } from "./review-summary.js";
import { buildWebExportSummary } from "./export-summary.js";

export interface FormValidationResult {
  valid: boolean;
  issues: string[];
}

function required(value: string, label: string, issues: string[]): void {
  if (!value.trim()) issues.push(`${label} es obligatorio.`);
}

function positiveNumber(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function circuitName(circuit: TE1CircuitDraft): string {
  return `Circuito ${circuit.number || "?"}`;
}

export function validateFormStep(
  step: TE1WizardStep,
  draft: TE1FormDraft
): FormValidationResult {
  const issues: string[] = [];

  switch (step) {
    case "project": {
      required(draft.project.name, "Nombre del proyecto", issues);
      const voltage = Number(draft.project.voltageV);
      if (!Number.isFinite(voltage) || voltage <= 0) {
        issues.push("La tensión nominal debe ser un valor mayor que cero.");
      }
      break;
    }

    case "owner":
      required(draft.owner.name, "Nombre del propietario", issues);
      required(draft.owner.rut, "RUT del propietario", issues);
      break;

    case "location":
      required(draft.location.address, "Dirección", issues);
      required(draft.location.commune, "Comuna", issues);
      required(draft.location.region, "Región", issues);
      if (!draft.location.wgs84.trim() && !draft.location.utm.trim()) {
        issues.push("Debe ingresar georreferencia WGS84 o UTM.");
      }
      break;

    case "board": {
      required(draft.board.name, "Nombre del tablero", issues);
      const ways = Number(draft.board.totalWays);
      if (!Number.isInteger(ways) || ways <= 0) {
        issues.push("La cantidad de módulos del tablero debe ser un entero mayor que cero.");
      }
      required(
        draft.board.frontalPhotoLabel,
        "Evidencia fotográfica frontal del tablero",
        issues
      );
      break;
    }

    case "circuits": {
      if (draft.circuits.length === 0) {
        issues.push("Debe existir al menos un circuito.");
        break;
      }

      const numbers = new Set<number>();
      for (const circuit of draft.circuits) {
        const number = Number(circuit.number);
        if (!Number.isInteger(number) || number <= 0) {
          issues.push(`${circuitName(circuit)}: número inválido.`);
        } else if (numbers.has(number)) {
          issues.push(`Circuito ${number}: número duplicado.`);
        } else {
          numbers.add(number);
        }

        required(
          circuit.description,
          `${circuitName(circuit)}: descripción`,
          issues
        );

        if (!positiveNumber(circuit.breakerA)) {
          issues.push(`${circuitName(circuit)}: calibre de protección inválido.`);
        }

        if (
          circuit.breakingCapacityKA.trim() &&
          !positiveNumber(circuit.breakingCapacityKA)
        ) {
          issues.push(`${circuitName(circuit)}: poder de corte inválido.`);
        }
      }
      break;
    }

    case "loads":
      for (const circuit of draft.circuits) {
        if (!positiveNumber(circuit.installedPowerW)) {
          issues.push(`${circuitName(circuit)}: potencia instalada pendiente o inválida.`);
        }
        if (
          circuit.demandedPowerW.trim() &&
          !positiveNumber(circuit.demandedPowerW)
        ) {
          issues.push(`${circuitName(circuit)}: potencia demandada inválida.`);
        }
      }
      break;

    case "conductors":
      for (const circuit of draft.circuits) {
        if (!positiveNumber(circuit.conductorPhaseMm2)) {
          issues.push(`${circuitName(circuit)}: sección de fase pendiente o inválida.`);
        }
        if (!positiveNumber(circuit.conductorNeutralMm2)) {
          issues.push(`${circuitName(circuit)}: sección de neutro pendiente o inválida.`);
        }
        if (!positiveNumber(circuit.conductorPeMm2)) {
          issues.push(`${circuitName(circuit)}: sección PE pendiente o inválida.`);
        }
        required(
          circuit.installationMethod,
          `${circuitName(circuit)}: método de instalación`,
          issues
        );
        if (!circuit.conductorVerified) {
          issues.push(`${circuitName(circuit)}: conductor aún no verificado.`);
        }
      }
      break;

    case "measurements":
      for (const measurement of draft.measurements) {
        if (!positiveNumber(measurement.value)) {
          issues.push(`${measurement.kind}: valor pendiente o inválido.`);
        }
        required(
          measurement.evidenceLabel,
          `${measurement.kind}: evidencia`,
          issues
        );
        if (!measurement.verified) {
          issues.push(`${measurement.kind}: medición aún no verificada.`);
        }
      }
      break;

    case "plans":
      if (!draft.plan.sourceType) {
        issues.push("Debe seleccionar una fuente para la planta eléctrica.");
      }
      required(draft.plan.sourceLabel, "Archivo o evidencia del plano", issues);
      if (!draft.plan.hasDimensions) {
        issues.push("La fuente debe contener dimensiones suficientes.");
      }
      if (!draft.plan.reviewed) {
        issues.push("La fuente del plano aún no cuenta con revisión profesional.");
      }
      break;

    case "compliance": {
      const compliance = buildComplianceSummary(draft);
      for (const item of compliance.items) {
        if (item.status === "blocker") {
          issues.push(`${item.code}: ${item.message}`);
        }
        if (item.status === "not-verifiable") {
          issues.push(`${item.code}: regla no verificable con los datos actuales.`);
        }
      }
      break;
    }

    case "review": {
      const review = buildReviewGateSummary(draft);
      if (!review.readyForApproval) {
        for (const item of review.items.filter((item) => !item.completed)) {
          issues.push(`${item.label}: pendiente.`);
        }
      }
      if (!draft.review.reviewerName.trim()) {
        issues.push("Debe identificar al profesional revisor.");
      }
      if (!draft.review.approved) {
        issues.push("El proyecto aún no tiene aprobación profesional explícita.");
      }
      break;
    }

    case "export": {
      const exportSummary = buildWebExportSummary(draft);
      if (!exportSummary.approvedForPreparation) {
        issues.push("El proyecto aún no está aprobado para preparación de exportación.");
      }
      if (
        exportSummary.documents.some(
          (document) => document.status !== "ready-to-generate"
        )
      ) {
        issues.push("El paquete TE1 todavía contiene documentos pendientes.");
      }
      break;
    }

    default:
      break;
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
