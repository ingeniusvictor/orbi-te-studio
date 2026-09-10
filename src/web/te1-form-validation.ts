import type { TE1WizardStep } from "../wizard/te1-wizard.js";
import type { TE1FormDraft } from "./te1-form-model.js";

export interface FormValidationResult {
  valid: boolean;
  issues: string[];
}

function required(value: string, label: string, issues: string[]): void {
  if (!value.trim()) issues.push(`${label} es obligatorio.`);
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

    default:
      break;
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
