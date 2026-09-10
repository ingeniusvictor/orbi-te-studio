import type { TE1Project } from "../domain/types.js";
import type { TE1FieldIntake } from "../field/intake-types.js";

export interface ReviewerChecklistItem {
  id: string;
  section: "identity" | "field" | "design" | "compliance" | "documents";
  label: string;
  required: boolean;
  completed: boolean;
}

export function buildReviewerChecklist(
  project: TE1Project,
  intake: TE1FieldIntake,
  options: {
    complianceBlockers: number;
    hasElectricalPlan: boolean;
    hasUnilinear: boolean;
    hasLoadSchedule: boolean;
    hasSymbolLegend: boolean;
  }
): ReviewerChecklistItem[] {
  return [
    {
      id: "REVIEW-OWNER",
      section: "identity",
      label: "Propietario y RUT confirmados",
      required: true,
      completed:
        intake.property.ownerName.value !== undefined &&
        intake.property.ownerRut.value !== undefined
    },
    {
      id: "REVIEW-ADDRESS",
      section: "identity",
      label: "Dirección y georreferenciación confirmadas",
      required: true,
      completed:
        intake.property.address.value !== undefined &&
        (intake.property.wgs84.value !== undefined ||
          intake.property.utm.value !== undefined)
    },
    {
      id: "REVIEW-FIELD-EVIDENCE",
      section: "field",
      label: "Evidencia de tablero y circuitos revisada",
      required: true,
      completed:
        intake.board.frontalPhoto.value !== undefined &&
        intake.board.devices.length > 0
    },
    {
      id: "REVIEW-CIRCUITS",
      section: "design",
      label: "Circuitos, protecciones y cargas revisados",
      required: true,
      completed:
        project.circuits.length > 0 &&
        project.circuits.every(
          (circuit) =>
            circuit.installedPowerW !== undefined &&
            circuit.conductor?.verified === true
        )
    },
    {
      id: "REVIEW-COMPLIANCE",
      section: "compliance",
      label: "Sin blockers normativos pendientes",
      required: true,
      completed: options.complianceBlockers === 0
    },
    {
      id: "REVIEW-DOCUMENTS",
      section: "documents",
      label: "Plano, unilineal, cuadro de cargas y simbología presentes",
      required: true,
      completed:
        options.hasElectricalPlan &&
        options.hasUnilinear &&
        options.hasLoadSchedule &&
        options.hasSymbolLegend
    }
  ];
}

export function reviewerChecklistReady(
  items: ReviewerChecklistItem[]
): boolean {
  return items.filter((item) => item.required).every((item) => item.completed);
}
